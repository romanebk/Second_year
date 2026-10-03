const REDIS_KEYS = {
  VILLES: 'aanid:villes',
  PANNEaux: 'aanid:panneaux',
  SIGNALEMENTS: 'aanid:signalements',
  USERS: 'aanid:users',
  FORMATIONS: 'aanid:formations',
  POSTS: 'aanid:posts',
};

const ROLES = {
  CITOYEN: 'citoyen',
  PROFESSIONNEL: 'professionnel',
  REGIE: 'regie',
  FORMATEUR: 'formateur',
  AUTORITE: 'autorite',
  ADMIN: 'admin',
};

const SUBSCRIPTIONS = {
  FREE: 'free',
  PREMIUM: 'premium',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
};

module.exports = { REDIS_KEYS, ROLES, SUBSCRIPTIONS, ...require('./api') };
