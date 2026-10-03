const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userStore = require('./userStore');
const mailer = require('./mailer');
const { createOAuthRouter } = require('./oauth');

const router = express.Router();

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES = Object.freeze({
  CITOYEN: 'CITOYEN',
  PROFESSIONNEL: 'PROFESSIONNEL',
  REGIE: 'REGIE',
  FORMATEUR: 'FORMATEUR',
  AUTORITE: 'AUTORITE',
  ADMIN: 'ADMIN',
});

const SUBSCRIPTIONS = Object.freeze({
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
  PROFESSIONAL: 'PROFESSIONAL',
  ENTERPRISE: 'ENTERPRISE',
});

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;    // 1h

const ACCESS_SECRET = process.env.AANID_ACCESS_SECRET;
const REFRESH_SECRET = process.env.AANID_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  console.error('[AANID] FATAL: AANID_ACCESS_SECRET and AANID_REFRESH_SECRET must be set in environment');
  if (process.env.NODE_ENV === 'production') process.exit(1);
}

// Fallback only for development — never ship with these
const _ACCESS_SECRET = ACCESS_SECRET || 'dev-only-access-secret-CHANGE-ME';
const _REFRESH_SECRET = REFRESH_SECRET || 'dev-only-refresh-secret-CHANGE-ME';

const AUTO_VERIFY_EMAIL =
  process.env.AANID_AUTO_VERIFY_EMAIL === 'true' || process.env.NODE_ENV !== 'production';

if (userStore.dbEnabled()) {
  console.log('[AANID] Auth → PostgreSQL (Neon/Prisma)');
} else {
  console.warn('[AANID] Auth → mémoire (DATABASE_URL absent, données perdues au redémarrage)');
}

// ─── Rate limiting ────────────────────────────────────────────────────────────
// Replace with express-rate-limit + Redis in production

/** @type {Map<string, { count: number, resetAt: number }>} */
const rateLimitStore = new Map();

function checkRateLimit(key, maxAttempts, windowMs) {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= maxAttempts) return false;
  record.count++;
  return true;
}

function resetRateLimit(key) {
  rateLimitStore.delete(key);
}

// Purge expired rate limit records every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore) {
    if (now > record.resetAt) rateLimitStore.delete(key);
  }
}, 60 * 60 * 1000);

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/;
// Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_#])[A-Za-z\d@$!%*?&\-_#]{8,128}$/;

function validateEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim());
}

function validatePassword(password) {
  return typeof password === 'string' && PASSWORD_RE.test(password);
}

function validateFullName(name) {
  return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 100;
}

function validatePhone(phone) {
  if (typeof phone !== 'string') return false;
  const digits = phone.replace(/[\s\-\+\(\)]/g, '');
  return /^\d{7,15}$/.test(digits);
}

function normalizePhone(phone) {
  return phone.trim().replace(/[\s\-\(\)]/g, '');
}

function validateCity(city) {
  return typeof city === 'string' && city.trim().length >= 2 && city.trim().length <= 100;
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

// ─── Token helpers ────────────────────────────────────────────────────────────

function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
    },
    _ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY, issuer: 'aanid', audience: 'aanid-app' }
  );
}

function generateRefreshToken(userId) {
  const token = jwt.sign(
    { sub: userId },
    _REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY, issuer: 'aanid', audience: 'aanid-app' }
  );
  return token;
}

async function persistRefreshToken(token, userId) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await userStore.saveRefreshToken(token, userId, expiresAt);
  return token;
}

function generateOpaqueToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ─── Auth middleware ──────────────────────────────────────────────────────────

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token d\'accès manquant' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, _ACCESS_SECRET, {
      issuer: 'aanid',
      audience: 'aanid-app',
    });
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé : droits insuffisants' });
    }
    next();
  };
}

// ─── Helper: strip sensitive fields ──────────────────────────────────────────

function safeUser(user) {
  return userStore.toSafeUser(user);
}

async function issueSession(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user.id);
  await persistRefreshToken(refreshToken, user.id);
  return { accessToken, refreshToken, user: safeUser(user) };
}

// ─── Helper: get client IP ────────────────────────────────────────────────────

function clientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES — Authentification
// ─────────────────────────────────────────────────────────────────────────────

router.use(createOAuthRouter({ userStore, issueSession }));

// POST /auth/register
router.post('/auth/register', async (req, res) => {
  try {
    const { fullName, email, phone, city, password, role } = req.body ?? {};

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'fullName, email et password sont requis' });
    }

    if (!validateFullName(fullName)) {
      return res.status(400).json({ error: 'Le nom complet doit contenir entre 2 et 100 caractères' });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Adresse email invalide' });
    }

    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ error: 'Numéro de téléphone invalide (7 à 15 chiffres)' });
    }

    if (city && !validateCity(city)) {
      return res.status(400).json({ error: 'La ville doit contenir entre 2 et 100 caractères' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&-_#)',
      });
    }

    const assignedRole =
      role && Object.values(ROLES).includes(role) && role !== ROLES.ADMIN
        ? role
        : ROLES.CITOYEN;

    if (await userStore.findUserByEmail(normalizedEmail)) {
      // Generic delay to prevent email enumeration via timing
      await bcrypt.hash(password, BCRYPT_ROUNDS);
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const verificationToken = generateOpaqueToken();
    const emailVerified = AUTO_VERIFY_EMAIL;

    const user = await userStore.createUser({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone ? normalizePhone(phone) : null,
      city: city ? city.trim() : null,
      passwordHash,
      role: assignedRole,
      emailVerified,
    });

    if (!emailVerified) {
      await userStore.saveVerificationToken(
        verificationToken,
        normalizedEmail,
        new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
      );
      await mailer.sendVerificationEmail(normalizedEmail, verificationToken);
      if (process.env.NODE_ENV !== 'production' && !mailer.isConfigured()) {
        console.log(`[AANID:DEV] Verification token for ${normalizedEmail}: ${verificationToken}`);
      }
    }

    return res.status(201).json({
      message: emailVerified
        ? 'Compte créé. Vous pouvez vous connecter.'
        : 'Compte créé. Vérifiez votre email pour activer votre compte.',
      userId: user.id,
      emailVerified,
    });
  } catch (err) {
    console.error('[AANID] register error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /auth/login
router.post('/auth/login', async (req, res) => {
  const ip = clientIp(req);
  const rateLimitKey = `login:${ip}`;

  if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
    return res.status(429).json({
      error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
    });
  }

  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await userStore.findUserByEmail(normalizedEmail);

    if (!user) {
      // Constant-time response to prevent email enumeration
      await bcrypt.hash(password, BCRYPT_ROUNDS);
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    if (!user.passwordHash) {
      return res.status(401).json({
        error: 'Ce compte utilise une connexion sociale. Connectez-vous avec Google, Facebook ou X.',
        code: 'SOCIAL_LOGIN_REQUIRED',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        error: 'Email non vérifié. Consultez votre boîte mail ou demandez un nouvel email.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    resetRateLimit(rateLimitKey);

    return res.status(200).json(await issueSession(user));
  } catch (err) {
    console.error('[AANID] login error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /auth/refresh
router.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body ?? {};

  if (!refreshToken || typeof refreshToken !== 'string') {
    return res.status(400).json({ error: 'Refresh token requis' });
  }

  if (!(await userStore.refreshTokenExists(refreshToken))) {
    return res.status(401).json({ error: 'Refresh token invalide ou révoqué' });
  }

  try {
    const payload = jwt.verify(refreshToken, _REFRESH_SECRET, {
      issuer: 'aanid',
      audience: 'aanid-app',
    });

    const user = await userStore.findUserById(payload.sub);
    if (!user) {
      await userStore.deleteRefreshToken(refreshToken);
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }

    await userStore.deleteRefreshToken(refreshToken);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user.id);
    await persistRefreshToken(newRefreshToken, user.id);

    return res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    await userStore.deleteRefreshToken(refreshToken);
    return res.status(401).json({ error: 'Refresh token expiré ou invalide' });
  }
});

// POST /auth/logout
router.post('/auth/logout', authenticateToken, async (req, res) => {
  const { refreshToken } = req.body ?? {};
  if (refreshToken && typeof refreshToken === 'string') {
    await userStore.deleteRefreshToken(refreshToken);
  }
  return res.status(200).json({ message: 'Déconnexion réussie' });
});

// GET /auth/verify-email/:token
router.get('/auth/verify-email/:token', async (req, res) => {
  const { token } = req.params;
  if (!token || !/^[0-9a-f]{64}$/.test(token)) {
    return res.status(400).json({ error: 'Lien de vérification invalide ou expiré' });
  }
  const record = await userStore.consumeVerificationToken(token);

  if (!record || Date.now() > record.expiresAt) {
    return res.status(400).json({ error: 'Lien de vérification invalide ou expiré' });
  }

  const user = await userStore.findUserByEmail(record.email);
  if (!user) {
    return res.status(404).json({ error: 'Compte introuvable' });
  }

  user.emailVerified = true;
  await userStore.updateUser(user);

  return res.status(200).json({ message: 'Email vérifié avec succès. Vous pouvez vous connecter.' });
});

// POST /auth/resend-verification
router.post('/auth/resend-verification', async (req, res) => {
  const ip = clientIp(req);
  if (!checkRateLimit(`resend:${ip}`, 3, 60 * 60 * 1000)) {
    return res.status(429).json({ error: 'Trop de demandes. Réessayez dans une heure.' });
  }

  const { email } = req.body ?? {};
  if (!email) return res.status(400).json({ error: 'Email requis' });

  const normalizedEmail = normalizeEmail(email);
  const user = await userStore.findUserByEmail(normalizedEmail);

  // Generic response to prevent enumeration
  if (!user || user.emailVerified) {
    return res.status(200).json({ message: 'Si un compte non vérifié existe, un email a été envoyé.' });
  }

  const verificationToken = generateOpaqueToken();
  await userStore.saveVerificationToken(
    verificationToken,
    normalizedEmail,
    new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
  );

  await mailer.sendVerificationEmail(normalizedEmail, verificationToken);
  if (process.env.NODE_ENV !== 'production' && !mailer.isConfigured()) {
    console.log(`[AANID:DEV] New verification token for ${normalizedEmail}: ${verificationToken}`);
  }

  return res.status(200).json({ message: 'Si un compte non vérifié existe, un email a été envoyé.' });
});

// POST /auth/forgot-password
router.post('/auth/forgot-password', async (req, res) => {
  const ip = clientIp(req);
  if (!checkRateLimit(`pwd-reset:${ip}`, 3, 60 * 60 * 1000)) {
    return res.status(429).json({ error: 'Trop de demandes. Réessayez dans une heure.' });
  }

  const { email } = req.body ?? {};
  if (!email) return res.status(400).json({ error: 'Email requis' });

  const normalizedEmail = normalizeEmail(email);
  const user = await userStore.findUserByEmail(normalizedEmail);

  if (user) {
    const resetToken = generateOpaqueToken();
    await userStore.savePasswordResetToken(
      resetToken,
      normalizedEmail,
      new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
    );
    await mailer.sendPasswordResetEmail(normalizedEmail, resetToken);
    if (process.env.NODE_ENV !== 'production' && !mailer.isConfigured()) {
      console.log(`[AANID:DEV] Password reset token for ${normalizedEmail}: ${resetToken}`);
    }
  }

  return res.status(200).json({ message: 'Si un compte existe, un email de réinitialisation a été envoyé.' });
});

// POST /auth/reset-password
router.post('/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body ?? {};

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token et nouveau mot de passe requis' });
    }

    if (!/^[0-9a-f]{64}$/.test(token)) {
      return res.status(400).json({ error: 'Lien de réinitialisation invalide ou expiré' });
    }

    const record = await userStore.consumePasswordResetToken(token);
    if (!record || Date.now() > record.expiresAt) {
      return res.status(400).json({ error: 'Lien de réinitialisation invalide ou expiré' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
      });
    }

    const user = await userStore.findUserByEmail(record.email);
    if (!user) {
      return res.status(404).json({ error: 'Compte introuvable' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await userStore.updateUser(user);
    await userStore.deleteRefreshTokensForUser(user.id);

    return res.status(200).json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (err) {
    console.error('[AANID] reset-password error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES — Profil
// ─────────────────────────────────────────────────────────────────────────────

// GET /profile
router.get('/profile', authenticateToken, async (req, res) => {
  const user = await userStore.findUserById(req.user.sub);
  if (!user) return res.status(404).json({ error: 'Profil introuvable' });

  return res.status(200).json({ user: safeUser(user) });
});

// PATCH /profile
router.patch('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await userStore.findUserById(req.user.sub);
    if (!user) return res.status(404).json({ error: 'Profil introuvable' });

    const { fullName, phone, city } = req.body ?? {};

    if (fullName !== undefined) {
      if (!validateFullName(fullName)) {
        return res.status(400).json({ error: 'Nom invalide (2 à 100 caractères)' });
      }
      user.fullName = fullName.trim();
    }

    if (phone !== undefined) {
      if (!validatePhone(phone)) {
        return res.status(400).json({ error: 'Numéro de téléphone invalide (7 à 15 chiffres)' });
      }
      user.phone = normalizePhone(phone);
    }

    if (city !== undefined) {
      if (!validateCity(city)) {
        return res.status(400).json({ error: 'Ville invalide (2 à 100 caractères)' });
      }
      user.city = city.trim();
    }

    await userStore.updateUser(user);
    return res.status(200).json({ user: safeUser(user) });
  } catch (err) {
    console.error('[AANID] update profile error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /profile/password
router.patch('/profile/password', authenticateToken, async (req, res) => {
  const ip = clientIp(req);
  if (!checkRateLimit(`pwd-change:${req.user.sub}:${ip}`, 3, 30 * 60 * 1000)) {
    return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 30 minutes.' });
  }

  try {
    const user = await userStore.findUserById(req.user.sub);
    if (!user) return res.status(404).json({ error: 'Profil introuvable' });
    if (!user.passwordHash) {
      return res.status(400).json({
        error: 'Ce compte social n’a pas encore de mot de passe. Utilisez « Mot de passe oublié » pour en définir un.',
      });
    }

    const { currentPassword, newPassword } = req.body ?? {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error: 'Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
      });
    }

    const samePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (samePassword) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit être différent de l\'actuel' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await userStore.updateUser(user);
    await userStore.deleteRefreshTokensForUser(user.id);

    return res.status(200).json({ message: 'Mot de passe modifié. Reconnectez-vous sur vos autres appareils.' });
  } catch (err) {
    console.error('[AANID] change password error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /profile/subscription
router.get('/profile/subscription', authenticateToken, async (req, res) => {
  const user = await userStore.findUserById(req.user.sub);
  if (!user) return res.status(404).json({ error: 'Profil introuvable' });

  const details = {
    FREE: {
      label: 'Gratuit',
      color: '#BDBDBD',
      features: ['Accès aux villes publiques', 'Consultation de base', 'Signalement limité'],
    },
    PREMIUM: {
      label: 'Premium',
      color: '#1E73BE',
      features: ['Toutes les villes', 'Formations gratuites incluses', 'Signalements illimités', 'Carte interactive avancée'],
    },
    PROFESSIONAL: {
      label: 'Professionnel',
      color: '#F5A623',
      features: ['Accès professionnel complet', 'Relais publicitaires', 'Statistiques & rapports', 'Géolocalisation des panneaux'],
    },
    ENTERPRISE: {
      label: 'Entreprise',
      color: '#212121',
      features: ['Accès complet illimité', 'API dédiée', 'Support prioritaire 24/7', 'Tableau de bord Régie', 'Gestion d\'équipe'],
    },
  };

  return res.status(200).json({
    subscription: user.subscription,
    details: details[user.subscription],
  });
});

// PATCH /profile/subscription — admin only
router.patch('/profile/subscription', authenticateToken, authorizeRoles(ROLES.ADMIN), async (req, res) => {
  const { userId, subscription } = req.body ?? {};

  if (!userId || !Object.values(SUBSCRIPTIONS).includes(subscription)) {
    return res.status(400).json({ error: 'userId et subscription valide requis' });
  }

  const user = await userStore.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

  user.subscription = subscription;
  await userStore.updateUser(user);

  return res.status(200).json({
    message: `Abonnement mis à jour vers ${subscription}`,
    userId: user.id,
    subscription,
  });
});

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = router;
module.exports.ROLES = ROLES;
module.exports.SUBSCRIPTIONS = SUBSCRIPTIONS;
module.exports.authenticateToken = authenticateToken;
module.exports.authorizeRoles = authorizeRoles;
