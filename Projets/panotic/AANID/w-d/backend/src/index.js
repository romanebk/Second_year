const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRouter = require('./server');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(express.json({ limit: '10kb' }));

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'aanid-auth' }));

app.use(authRouter);

// 404
app.use((_req, res) => res.status(404).json({ error: 'Route introuvable' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[AANID] Unhandled error:', err.message);
  res.status(500).json({ error: 'Erreur serveur' });
});

app.listen(PORT, () => {
  console.log(`[AANID] Auth service running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

module.exports = app;
