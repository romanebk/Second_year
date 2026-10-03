const express = require('express');
const path = require('path');
const router = require('./src/server');

const app = express();
app.use(express.json());
app.use('/api/v1', router);

app.use('/preview', express.static(path.join(__dirname, '..')));
app.get('/app', (_, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>AANID · États des Lieux</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{width:100%;height:100%;overflow:hidden}
  body{font-family:system-ui,-apple-system,sans-serif;background:#EDE0D0}
</style>
</head>
<body><div id="root"></div>
<script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
<script src="https://unpkg.com/react-native-web/dist/index.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<script type="text/babel" data-type="module" data-presets="react">
const C = {
  bleu: '#A8B4C4', vert: '#8B9D77', orange: '#C99A4E',
  rouge: '#D4654A', noir: '#1A1A1A', gris: '#C9BEB2',
  grisClair: '#FBF3E9', blanc: '#FFFFFF',
};
const RN = ReactNativeWeb;
const { View, Text, ScrollView, TouchableOpacity, StyleSheet } = RN;
// ... full component code
<\/script>
</body></html>`);
});

app.get('/health', (_, res) => res.json({ status: 'ok', module: 'bryan-fanou' }));

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`[bryan-fanou] Backend running on http://localhost:${PORT}`);
  console.log(`[bryan-fanou] Routes:`);
  console.log(`  GET /health`);
  console.log(`  GET /api/v1/etats-lieux`);
  console.log(`  GET /api/v1/etats-lieux/kpis`);
  console.log(`  GET /api/v1/etats-lieux/evolution`);
  console.log(`  GET /api/v1/etats-lieux/signalements`);
  console.log(`  GET /api/v1/etats-lieux/categories`);
  console.log(`  GET /api/v1/etats-lieux/carte`);
  console.log(`  GET /api/v1/etats-lieux/conformite`);
});
