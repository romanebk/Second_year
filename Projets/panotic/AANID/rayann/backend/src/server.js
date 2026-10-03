const express = require('express');
const store = require('./carteStore');

const router = express.Router();

function filterByVille(items, villeId) {
  if (!villeId || villeId === 'toutes') return items;
  return items.filter(i => i.villeId === villeId);
}

router.get('/carte/villes', async (req, res) => {
  try {
    res.json(await store.listVilles());
  } catch (err) {
    console.error('[carte] villes:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/carte/signalements', async (req, res) => {
  try {
    const { type, villeId } = req.query;
    let filtered = filterByVille(await store.listSignalements(), villeId);
    if (type && type !== 'tous') {
      filtered = filtered.filter(s => s.type === type);
    }
    res.json(filtered);
  } catch (err) {
    console.error('[carte] signalements:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/carte/panneaux', async (req, res) => {
  try {
    const { type, etat, villeId } = req.query;
    let filtered = filterByVille(await store.listPanneaux(), villeId);
    if (type && type !== 'tous') {
      filtered = filtered.filter(p => p.type === type);
    }
    if (etat && etat !== 'tous') {
      filtered = filtered.filter(p => p.etat === etat);
    }
    res.json(filtered);
  } catch (err) {
    console.error('[carte] panneaux:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/carte/zones', async (req, res) => {
  try {
    const { villeId } = req.query;
    res.json(filterByVille(await store.listZones(), villeId));
  } catch (err) {
    console.error('[carte] zones:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/carte/recherche', async (req, res) => {
  try {
    const { q, villeId } = req.query;
    if (!q) return res.json({ panneaux: [], zones: [] });

    const query = q.toLowerCase();
    const filteredPanneaux = filterByVille(await store.listPanneaux(), villeId);
    const filteredZones = filterByVille(await store.listZones(), villeId);

    const matchedPanneaux = filteredPanneaux.filter(p =>
      p.format.toLowerCase().includes(query) ||
      p.type.toLowerCase().includes(query) ||
      p.regime.toLowerCase().includes(query)
    );
    const matchedZones = filteredZones.filter(z =>
      z.name.toLowerCase().includes(query)
    );

    res.json({ panneaux: matchedPanneaux, zones: matchedZones });
  } catch (err) {
    console.error('[carte] recherche:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/carte/heatmap', async (req, res) => {
  try {
    const { villeId } = req.query;
    const data = filterByVille(await store.listSignalements(), villeId)
      .filter(s => s.status === 'VALIDATED')
      .map(s => ({
        latitude: s.lat,
        longitude: s.lng,
        weight: s.votesCount || 1,
      }));
    res.json(data);
  } catch (err) {
    console.error('[carte] heatmap:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/carte/stats', async (req, res) => {
  try {
    const { villeId } = req.query;
    const villes = await store.listVilles();
    const ville = villes.find(v => v.id === villeId) || { nom: 'Toutes les villes', lat: 6.5, lng: 2.0 };

    const sigs = filterByVille(await store.listSignalements(), villeId);
    const pans = filterByVille(await store.listPanneaux(), villeId);
    const zns = filterByVille(await store.listZones(), villeId);

    const stats = {
      ville: ville.nom,
      signalements: {
        total: sigs.length,
        parType: {
          DEGRADE: sigs.filter(s => s.type === 'DEGRADE').length,
          DANGEREUX: sigs.filter(s => s.type === 'DANGEREUX').length,
          ILLEGAL: sigs.filter(s => s.type === 'ILLEGAL').length,
          OBSOLETE: sigs.filter(s => s.type === 'OBSOLETE').length,
          TRAVAUX: sigs.filter(s => s.type === 'TRAVAUX').length,
          BON_ETAT: sigs.filter(s => s.type === 'BON_ETAT').length,
        },
        parStatut: {
          PENDING: sigs.filter(s => s.status === 'PENDING').length,
          VALIDATED: sigs.filter(s => s.status === 'VALIDATED').length,
          RESOLVED: sigs.filter(s => s.status === 'RESOLVED').length,
          REJECTED: sigs.filter(s => s.status === 'REJECTED').length,
        },
      },
      panneaux: {
        total: pans.length,
        parType: {
          CLASSIQUE: pans.filter(p => p.type === 'CLASSIQUE').length,
          DIGITAL: pans.filter(p => p.type === 'DIGITAL').length,
          ABRIBUS: pans.filter(p => p.type === 'ABRIBUS').length,
          TOTEM: pans.filter(p => p.type === 'TOTEM').length,
          AUTRE: pans.filter(p => p.type === 'AUTRE').length,
        },
        parEtat: {
          DISPONIBLE: pans.filter(p => p.etat === 'DISPONIBLE').length,
          LOUE: pans.filter(p => p.etat === 'LOUE').length,
          MAINTENANCE: pans.filter(p => p.etat === 'MAINTENANCE').length,
        },
        prixMoyen: pans.length > 0 ? Math.round(pans.reduce((a, p) => a + (p.price || 0), 0) / pans.length) : 0,
      },
      zones: {
        total: zns.length,
        parType: {
          commerciale: zns.filter(z => z.type === 'commerciale').length,
          residentielle: zns.filter(z => z.type === 'residentielle').length,
          speciale: zns.filter(z => z.type === 'speciale').length,
          interdite: zns.filter(z => z.type === 'interdite').length,
        },
      },
      tauxSignalement: pans.length > 0 ? Math.round((sigs.length / pans.length) * 100) / 100 : 0,
    };

    res.json(stats);
  } catch (err) {
    console.error('[carte] stats:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
