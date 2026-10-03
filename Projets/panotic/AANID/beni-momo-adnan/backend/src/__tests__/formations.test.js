const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const router = require('../server');

const SECRET = process.env.AANID_ACCESS_SECRET || 'dev-only-access-secret-CHANGE-ME';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1', router);
  return app;
}

function makeToken(sub = 'test-user-1') {
  return jwt.sign({ sub }, SECRET, { issuer: 'aanid', audience: 'aanid-app' });
}

describe('Formations API', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  describe('GET /api/v1/formations', () => {
    it('returns paginated formations', async () => {
      const res = await request(app).get('/api/v1/formations');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page', 1);
      expect(res.body).toHaveProperty('hasMore');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('filters by category', async () => {
      const res = await request(app).get('/api/v1/formations?category=SANTE');
      expect(res.status).toBe(200);
      res.body.data.forEach(f => {
        expect(f.category).toBe('SANTE');
      });
    });

    it('filters by isFree', async () => {
      const res = await request(app).get('/api/v1/formations?isFree=true');
      expect(res.status).toBe(200);
      res.body.data.forEach(f => {
        expect(f.isFree).toBe(true);
      });
    });

    it('supports pagination', async () => {
      const first = await request(app).get('/api/v1/formations?page=1&limit=2');
      expect(first.status).toBe(200);
      expect(first.body.data.length).toBe(2);
      expect(first.body.hasMore).toBe(true);

      const second = await request(app).get('/api/v1/formations?page=2&limit=2');
      expect(second.status).toBe(200);
      expect(second.body.data.length).toBeGreaterThan(0);
      expect(second.body.page).toBe(2);

      const firstIds = first.body.data.map(f => f.id);
      const secondIds = second.body.data.map(f => f.id);
      const overlap = firstIds.filter(id => secondIds.includes(id));
      expect(overlap.length).toBe(0);
    });
  });

  describe('GET /api/v1/formations/:id', () => {
    it('returns a formation by id', async () => {
      const res = await request(app).get('/api/v1/formations/fmt-1');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 'fmt-1');
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('modules');
      expect(res.body).toHaveProperty('isEnrolled');
      expect(res.body).toHaveProperty('userProgress');
    });

    it('returns 404 for unknown formation', async () => {
      const res = await request(app).get('/api/v1/formations/unknown');
      expect(res.status).toBe(404);
    });

    it('returns user progress when authenticated', async () => {
      const token = makeToken();
      const res = await request(app)
        .get('/api/v1/formations/fmt-1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('isEnrolled');
    });
  });

  describe('POST /api/v1/formations/:id/enroll', () => {
    it('enrolls a user', async () => {
      const token = makeToken('enroll-test-user');
      const res = await request(app)
        .post('/api/v1/formations/fmt-1/enroll')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Inscription réussie');
    });

    it('returns 409 if already enrolled', async () => {
      const token = makeToken('enroll-test-user-dup');
      await request(app)
        .post('/api/v1/formations/fmt-1/enroll')
        .set('Authorization', `Bearer ${token}`);
      const res = await request(app)
        .post('/api/v1/formations/fmt-1/enroll')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(409);
    });

    it('returns 401 without token', async () => {
      const res = await request(app)
        .post('/api/v1/formations/fmt-1/enroll');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/formations/:id/unenroll', () => {
    it('un enrolls a user', async () => {
      const token = makeToken('unenroll-test-user');
      await request(app)
        .post('/api/v1/formations/fmt-1/enroll')
        .set('Authorization', `Bearer ${token}`);
      const res = await request(app)
        .post('/api/v1/formations/fmt-1/unenroll')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Désinscription réussie');
    });

    it('returns 404 if not enrolled', async () => {
      const token = makeToken('unenroll-not-enrolled');
      const res = await request(app)
        .post('/api/v1/formations/fmt-1/unenroll')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it('returns 401 without token', async () => {
      const res = await request(app)
        .post('/api/v1/formations/fmt-1/unenroll');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/formations/mine', () => {
    it("returns user's formations", async () => {
      const userId = 'mine-test-user';
      const token = makeToken(userId);
      await request(app)
        .post('/api/v1/formations/fmt-1/enroll')
        .set('Authorization', `Bearer ${token}`);
      const res = await request(app)
        .get('/api/v1/formations/mine')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/v1/formations/mine');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/formations/:id/progress', () => {
    it('updates module progress', async () => {
      const userId = 'progress-test-user';
      const token = makeToken(userId);
      await request(app)
        .post('/api/v1/formations/fmt-1/enroll')
        .set('Authorization', `Bearer ${token}`);
      const res = await request(app)
        .patch('/api/v1/formations/fmt-1/progress')
        .set('Authorization', `Bearer ${token}`)
        .send({ moduleId: 'fmt1-ch1-lecon1', completed: true });
      expect(res.status).toBe(200);
      expect(res.body.modulesCompleted).toContain('fmt1-ch1-lecon1');
    });

    it('returns 401 without token', async () => {
      const res = await request(app)
        .patch('/api/v1/formations/fmt-1/progress')
        .send({ moduleId: 'fmt1-ch1-lecon1', completed: true });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/formations/mine/badges', () => {
    it("returns user's badges", async () => {
      const token = makeToken('badge-test-user');
      const res = await request(app)
        .get('/api/v1/formations/mine/badges')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/v1/formations/:id/pay', () => {
    it('processes payment (simulation sans clé KKiaPay)', async () => {
      const token = makeToken('pay-test-user');
      const res = await request(app)
        .post('/api/v1/formations/fmt-3/pay')
        .set('Authorization', `Bearer ${token}`)
        .send({ phone: '22990123456' });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('provider', 'simulation');
      expect(res.body).toHaveProperty('status', 'approved');
    });

    it('returns 400 for a free formation', async () => {
      const token = makeToken('pay-free-user');
      const res = await request(app)
        .post('/api/v1/formations/fmt-1/pay')
        .set('Authorization', `Bearer ${token}`)
        .send({ phone: '22990123456' });
      expect(res.status).toBe(400);
    });

    it('returns 400 without phone', async () => {
      const token = makeToken('pay-no-phone');
      const res = await request(app)
        .post('/api/v1/formations/fmt-3/pay')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/villes', () => {
    it('returns villes list', async () => {
      const res = await request(app).get('/api/v1/villes');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('filters villes by search', async () => {
      const res = await request(app).get('/api/v1/villes?search=cotonou');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].nom).toBe('Cotonou');
    });
  });

  describe('GET /api/v1/villes/:id', () => {
    it('returns a ville by id', async () => {
      const res = await request(app).get('/api/v1/villes/cotonou');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 'cotonou');
      expect(res.body).toHaveProperty('rubriques');
    });

    it('returns 404 for unknown ville', async () => {
      const res = await request(app).get('/api/v1/villes/unknown');
      expect(res.status).toBe(404);
    });
  });

  describe('Module images', () => {
    it('formations have modules with imageUrl', async () => {
      const res = await request(app).get('/api/v1/formations/fmt-1');
      expect(res.status).toBe(200);
      res.body.modules.forEach(mod => {
        expect(mod).toHaveProperty('imageUrl');
      });
    });
  });
});
