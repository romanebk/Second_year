const express = require('express');
const crypto = require('crypto');

const ATTEMPT_TTL_MS = 10 * 60 * 1000;
const EXCHANGE_TTL_MS = 2 * 60 * 1000;
const PROVIDERS = ['google', 'facebook', 'x'];

function base64Url(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomToken() {
  return base64Url(crypto.randomBytes(32));
}

function codeChallenge(verifier) {
  return base64Url(crypto.createHash('sha256').update(verifier).digest());
}

function appendQuery(url, values) {
  const target = new URL(url);
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null) target.searchParams.set(key, String(value));
  });
  return target.toString();
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.error_description || payload.error?.message || payload.error || `HTTP ${response.status}`;
    throw new Error(String(message));
  }
  return payload;
}

async function postForm(url, values, headers = {}) {
  const body = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null) body.set(key, String(value));
  });
  return fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headers },
    body: body.toString(),
  });
}

function providerSettings(provider, callbackUrl) {
  const facebookVersion = process.env.FACEBOOK_GRAPH_VERSION || 'v23.0';

  if (provider === 'google') {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl,
      usesPkce: true,
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      scopes: 'openid email profile',
    };
  }
  if (provider === 'facebook') {
    return {
      clientId: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackUrl,
      usesPkce: false,
      authorizationUrl: `https://www.facebook.com/${facebookVersion}/dialog/oauth`,
      tokenUrl: `https://graph.facebook.com/${facebookVersion}/oauth/access_token`,
      profileUrl: `https://graph.facebook.com/${facebookVersion}/me`,
      scopes: 'email public_profile',
    };
  }
  if (provider === 'x') {
    return {
      clientId: process.env.X_CLIENT_ID,
      clientSecret: process.env.X_CLIENT_SECRET,
      callbackUrl,
      usesPkce: true,
      authorizationUrl: 'https://x.com/i/oauth2/authorize',
      scopes: 'tweet.read users.read',
    };
  }
  return null;
}

async function exchangeProviderCode(provider, settings, code, verifier) {
  if (provider === 'google') {
    const tokens = await postForm('https://oauth2.googleapis.com/token', {
      client_id: settings.clientId,
      client_secret: settings.clientSecret,
      code,
      code_verifier: verifier,
      grant_type: 'authorization_code',
      redirect_uri: settings.callbackUrl,
    });
    const profile = await fetchJson('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!profile.sub || !profile.email || profile.email_verified === false) {
      throw new Error('Le compte Google ne fournit pas une adresse email vérifiée');
    }
    return {
      providerUserId: String(profile.sub),
      email: profile.email,
      fullName: profile.name || profile.email.split('@')[0],
      avatarUrl: profile.picture,
    };
  }

  if (provider === 'facebook') {
    const tokens = await postForm(settings.tokenUrl, {
      client_id: settings.clientId,
      client_secret: settings.clientSecret,
      code,
      redirect_uri: settings.callbackUrl,
    });
    const profile = await fetchJson(appendQuery(settings.profileUrl, {
      fields: 'id,name,email,picture.type(large)',
      access_token: tokens.access_token,
    }));
    if (!profile.id) throw new Error('Profil Facebook incomplet');
    return {
      providerUserId: String(profile.id),
      email: profile.email,
      fullName: profile.name || 'Utilisateur Facebook',
      avatarUrl: profile.picture?.data?.url,
    };
  }

  const basic = Buffer.from(`${settings.clientId}:${settings.clientSecret}`).toString('base64');
  const tokens = await postForm('https://api.x.com/2/oauth2/token', {
    code,
    code_verifier: verifier,
    grant_type: 'authorization_code',
    redirect_uri: settings.callbackUrl,
  }, { Authorization: `Basic ${basic}` });
  const response = await fetchJson(
    'https://api.x.com/2/users/me?user.fields=id,name,username,profile_image_url',
    { headers: { Authorization: `Bearer ${tokens.access_token}` } },
  );
  const profile = response.data;
  if (!profile?.id) throw new Error('Profil X incomplet');
  return {
    providerUserId: String(profile.id),
    email: null,
    fullName: profile.name || profile.username || 'Utilisateur X',
    avatarUrl: profile.profile_image_url,
  };
}

function createOAuthRouter({ userStore, issueSession }) {
  const router = express.Router();
  const publicOrigin = (
    process.env.OAUTH_CALLBACK_BASE_URL ||
    process.env.API_PUBLIC_URL ||
    'http://localhost:4000'
  ).replace(/\/$/, '');
  const allowedRedirects = new Set(
    (process.env.OAUTH_APP_REDIRECT_URIS || 'aanid://oauth/callback')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  );

  router.get('/auth/oauth/providers', (_req, res) => {
    const providers = {};
    for (const provider of PROVIDERS) {
      const callbackUrl = `${publicOrigin}/api/v1/auth/oauth/${provider}/callback`;
      const settings = providerSettings(provider, callbackUrl);
      providers[provider] = Boolean(settings?.clientId && settings?.clientSecret);
    }
    res.json({ providers });
  });

  router.get('/auth/oauth/:provider/start', async (req, res) => {
    const provider = String(req.params.provider || '').toLowerCase();
    if (!PROVIDERS.includes(provider)) return res.status(404).json({ error: 'Fournisseur OAuth inconnu' });

    const redirectUri = String(req.query.redirectUri || '');
    if (!allowedRedirects.has(redirectUri)) {
      return res.status(400).json({ error: 'URI de retour non autorisée' });
    }

    const callbackUrl = `${publicOrigin}/api/v1/auth/oauth/${provider}/callback`;
    const settings = providerSettings(provider, callbackUrl);
    if (!settings?.clientId || !settings?.clientSecret) {
      return res.status(503).json({ error: `${provider} n'est pas encore configuré` });
    }

    const state = randomToken();
    const verifier = settings.usesPkce ? randomToken() : null;
    await userStore.saveOAuthAttempt({
      state,
      provider,
      codeVerifier: verifier,
      redirectUri,
      expiresAt: new Date(Date.now() + ATTEMPT_TTL_MS),
    });

    const params = {
      client_id: settings.clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: settings.scopes,
      state,
    };
    if (verifier) {
      params.code_challenge = codeChallenge(verifier);
      params.code_challenge_method = 'S256';
    }
    if (provider === 'google') params.prompt = 'select_account';

    return res.redirect(302, appendQuery(settings.authorizationUrl, params));
  });

  router.get('/auth/oauth/:provider/callback', async (req, res) => {
    const provider = String(req.params.provider || '').toLowerCase();
    const state = String(req.query.state || '');
    const attempt = state ? await userStore.consumeOAuthAttempt(state) : null;
    const fallbackRedirect = 'aanid://oauth/callback';
    const appRedirect = attempt?.redirectUri || fallbackRedirect;
    const fail = (code) => res.redirect(302, appendQuery(appRedirect, { error: code }));

    if (!attempt || attempt.provider !== provider || new Date(attempt.expiresAt).getTime() < Date.now()) {
      return fail('invalid_state');
    }
    if (req.query.error) return fail('access_denied');
    if (!req.query.code) return fail('missing_code');

    try {
      const callbackUrl = `${publicOrigin}/api/v1/auth/oauth/${provider}/callback`;
      const settings = providerSettings(provider, callbackUrl);
      const profile = await exchangeProviderCode(provider, settings, String(req.query.code), attempt.codeVerifier);
      const user = await userStore.findOrCreateOAuthUser({ provider, ...profile });
      const exchangeCode = randomToken();
      await userStore.saveOAuthExchange(
        exchangeCode,
        user.id,
        new Date(Date.now() + EXCHANGE_TTL_MS),
      );
      return res.redirect(302, appendQuery(appRedirect, { code: exchangeCode }));
    } catch (error) {
      console.error(`[AANID] OAuth ${provider} callback:`, error.message);
      return fail('provider_error');
    }
  });

  router.post('/auth/oauth/exchange', async (req, res) => {
    const code = typeof req.body?.code === 'string' ? req.body.code : '';
    if (!code) return res.status(400).json({ error: 'Code OAuth requis' });

    const exchange = await userStore.consumeOAuthExchange(code);
    if (!exchange || new Date(exchange.expiresAt).getTime() < Date.now()) {
      return res.status(401).json({ error: 'Code OAuth invalide ou expiré' });
    }
    const user = await userStore.findUserById(exchange.userId);
    if (!user) return res.status(401).json({ error: 'Utilisateur introuvable' });

    const session = await issueSession(user);
    return res.status(200).json(session);
  });

  return router;
}

module.exports = { createOAuthRouter };
