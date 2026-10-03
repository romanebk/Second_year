import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import { initDb, queryOne } from '../../backend/src/database.js';
import { seed } from '../../backend/src/seed.js';
import authRoutes from '../../backend/src/routes/auth.js';
import equipmentRoutes from '../../backend/src/routes/equipment.js';
import faultRoutes from '../../backend/src/routes/faults.js';
import sparePartRoutes from '../../backend/src/routes/spareparts.js';
import notificationRoutes from '../../backend/src/routes/notifications.js';
import dashboardRoutes from '../../backend/src/routes/dashboard.js';
import userRoutes from '../../backend/src/routes/users.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

let ready = false;
app.use(async (_req, _res, next) => {
  if (!ready) {
    await initDb();
    const count = (queryOne('SELECT COUNT(*) as count FROM users') as any)?.count;
    if (!count) await seed();
    ready = true;
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/faults', faultRoutes);
app.use('/api/spare-parts', sparePartRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export const handler = serverless(app);
