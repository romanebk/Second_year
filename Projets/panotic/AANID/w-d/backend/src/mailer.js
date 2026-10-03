// Envoi d'emails via SMTP (nodemailer). Sans SMTP_HOST configuré, les envois
// sont désactivés et les tokens restent visibles dans les logs (dev).
//   SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS : connexion SMTP
//   SMTP_FROM     : expéditeur (défaut: AANID <no-reply@aanid.bj>)
//   APP_BASE_URL  : base des liens dans les emails (défaut: http://localhost:8080)

let transporter = null;

function isConfigured() {
  return Boolean(process.env.SMTP_HOST);
}

function getTransporter() {
  if (!isConfigured()) return null;
  if (transporter) return transporter;
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

function baseUrl() {
  return (process.env.APP_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
}

async function send({ to, subject, text, html }) {
  const tx = getTransporter();
  if (!tx) return false;
  const from = process.env.SMTP_FROM || 'AANID <no-reply@aanid.bj>';
  try {
    await tx.sendMail({ from, to, subject, text, html });
    return true;
  } catch (err) {
    console.error('[AANID:mailer] envoi échoué:', err.message);
    return false;
  }
}

async function sendVerificationEmail(email, token) {
  const link = `${baseUrl()}/verify-email?token=${token}`;
  return send({
    to: email,
    subject: 'AANID — Vérifiez votre adresse email',
    text: `Bienvenue sur AANID !\n\nCliquez sur ce lien pour vérifier votre adresse email :\n${link}\n\nCe lien expire dans 24 heures.`,
    html: `<p>Bienvenue sur <strong>AANID</strong> !</p><p><a href="${link}">Vérifier mon adresse email</a></p><p>Ce lien expire dans 24 heures.</p>`,
  });
}

async function sendPasswordResetEmail(email, token) {
  const link = `${baseUrl()}/reset-password?token=${token}`;
  return send({
    to: email,
    subject: 'AANID — Réinitialisation de votre mot de passe',
    text: `Vous avez demandé la réinitialisation de votre mot de passe AANID.\n\nCliquez sur ce lien pour choisir un nouveau mot de passe :\n${link}\n\nCe lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
    html: `<p>Vous avez demandé la réinitialisation de votre mot de passe <strong>AANID</strong>.</p><p><a href="${link}">Choisir un nouveau mot de passe</a></p><p>Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`,
  });
}

module.exports = {
  isConfigured,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
