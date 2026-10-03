const fs = require('fs');

const PREFS_FILE = '/home/node/.n8n/preferences.json';
const NEWSLETTERS_FILE = '/home/node/.n8n/newsletters.json';

const RSS_SOURCES = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', topics: ['tech', 'startup', 'ai'] },
  { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml', topics: ['general', 'politique', 'international', 'economie'] },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', topics: ['tech', 'science', 'ai'] },
  { name: 'NASA', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', topics: ['science', 'space', 'environnement'] },
  { name: 'Hacker News', url: 'https://hnrss.org/frontpage', topics: ['dev', 'tech', 'startup'] },
  { name: 'Le Monde', url: 'https://www.lemonde.fr/rss/une.xml', topics: ['general', 'politique', 'international', 'economie', 'culture'] },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', topics: ['tech', 'science', 'culture', 'ai'] }
];

function loadJSON(filePath, defaultData) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch(e) {}
  return defaultData;
}

function saveJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function parseRSS(xmlText, sourceName) {
  const items = [];
  const itemRegex = /<item>([^]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXml = match[1];
    const title = (itemXml.match(/<title[^>]*>([^]*?)<\/title>/i) || [,''])[1].replace(/<\/?[^>]+(>|$)/g, '').trim();
    const link = (itemXml.match(/<link[^>]*>([^]*?)<\/link>/i) || [,''])[1].trim();
    const description = (itemXml.match(/<description[^>]*>([^]*?)<\/description>/i) || [,''])[1].replace(/<\/?[^>]+(>|$)/g, '').trim();
    if (title && link) {
      items.push({ title, link, description: description.slice(0, 500), source: sourceName });
    }
  }
  return items;
}

function matchTopics(article, userTopics) {
  const text = (article.title + ' ' + article.description).toLowerCase();
  return userTopics.some(topic => text.includes(topic.toLowerCase()));
}

const prefs = loadJSON(PREFS_FILE, { preferences: [] });
const newsletters = loadJSON(NEWSLETTERS_FILE, { newsletters: [] });
const activeUsers = prefs.preferences.filter(p => p.active !== false);

if (activeUsers.length === 0) {
  return [{ json: { status: 'no_users_active' } }];
}

const fetchPromises = RSS_SOURCES.map(async (source) => {
  try {
    const response = await fetch(source.url, { signal: AbortSignal.timeout(10000) });
    const xml = await response.text();
    return parseRSS(xml, source.name);
  } catch(e) {
    return [];
  }
});

const results = await Promise.all(fetchPromises);
const allArticles = results.flat();

const now = new Date().toISOString();

for (const userPref of activeUsers) {
  const userTopics = (userPref.topics || []).map(t => t.toLowerCase());
  const userSources = (userPref.sources || []).map(s => s.toLowerCase());
  const existing = newsletters.newsletters.find(n => n.userId === userPref.userId);
  const existingUrls = new Set(existing ? existing.articles.map(a => a.url) : []);

  const matched = allArticles.filter(a => {
    if (existingUrls.has(a.link)) return false;
    if (userSources.length > 0 && !userSources.includes(a.source.toLowerCase())) return false;
    return matchTopics(a, userTopics);
  });

  const selected = matched.slice(0, userPref.articleCount || 5);
  if (selected.length > 0) {
    const entry = {
      userId: userPref.userId,
      fetchedAt: now,
      articles: selected.map(a => ({ title: a.title, summary: a.description.slice(0, 300), url: a.link, source: a.source }))
    };
    if (existing) {
      existing.fetchedAt = now;
      existing.articles.push(...entry.articles);
      if (existing.articles.length > 100) existing.articles = existing.articles.slice(-100);
    } else {
      newsletters.newsletters.push(entry);
    }
  }
}

saveJSON(NEWSLETTERS_FILE, newsletters);
return [{ json: { status: 'success', usersProcessed: activeUsers.length, totalArticlesFetched: allArticles.length } }];
