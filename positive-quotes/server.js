'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const HOST = process.env.IP || process.env.HOST || '127.0.0.1';
const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const ROOT_DIR = __dirname;
const DATA_FILE = path.resolve(
  process.env.DB_FILE || path.join(ROOT_DIR, 'data', 'db.json')
);
const STATIC_DIR_CANDIDATES = [
  path.join(ROOT_DIR, 'dist', 'positive-quotes-app', 'browser'),
  path.join(ROOT_DIR, 'dist', 'positive-quotes-app'),
  path.join(ROOT_DIR, 'docs'),
];
const STATIC_DIR = STATIC_DIR_CANDIDATES.find((candidate) =>
  fs.existsSync(path.join(candidate, 'index.html'))
);
const APP_SECRET =
  process.env.APP_SECRET || crypto.randomBytes(48).toString('hex');
const DEMO_EMAIL = (process.env.DEMO_EMAIL || 'demo@positivequotes.app')
  .trim()
  .toLowerCase();
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Positive123!';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const MAX_BODY_BYTES = 100 * 1024;

if (!process.env.APP_SECRET) {
  console.warn(
    'APP_SECRET is not set. Login sessions will be invalidated whenever the server restarts.'
  );
}

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function ensureDatabaseFile() {
  const directory = path.dirname(DATA_FILE);
  fs.mkdirSync(directory, { recursive: true });

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(
        { users: [], favorites: [], history: [], quotes: [] },
        null,
        2
      )
    );
  }
}

function readDatabase() {
  ensureDatabaseFile();
  const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

  return {
    users: Array.isArray(parsed.users) ? parsed.users : [],
    favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
    history: Array.isArray(parsed.history) ? parsed.history : [],
    quotes: Array.isArray(parsed.quotes) ? parsed.quotes : [],
  };
}

let database = readDatabase();
let writeQueue = Promise.resolve();

function persistDatabase() {
  writeQueue = writeQueue.then(async () => {
    const temporaryFile = `${DATA_FILE}.tmp`;
    const serialized = JSON.stringify(database, null, 2);
    await fs.promises.writeFile(temporaryFile, serialized, {
      encoding: 'utf8',
      mode: 0o600,
    });
    await fs.promises.rename(temporaryFile, DATA_FILE);
  });

  return writeQueue;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${derivedKey}`;
}

function verifyPassword(password, storedHash) {
  if (typeof storedHash !== 'string') {
    return false;
  }

  const [algorithm, salt, expectedHex] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !expectedHex) {
    return false;
  }

  const expected = Buffer.from(expectedHex, 'hex');
  const actual = crypto.scryptSync(password, salt, expected.length);

  return (
    expected.length === actual.length &&
    crypto.timingSafeEqual(expected, actual)
  );
}

function encodeBase64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function createToken(userId) {
  const payload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', APP_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) {
    return null;
  }

  const [encodedPayload, suppliedSignature] = token.split('.');
  const expectedSignature = crypto
    .createHmac('sha256', APP_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  const suppliedBuffer = Buffer.from(suppliedSignature || '');
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    );

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.exp !== 'number' ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isDemo: Boolean(user.isDemo),
  };
}

async function ensureDemoUser() {
  const existing = database.users.find(
    (user) => String(user.email).toLowerCase() === DEMO_EMAIL
  );

  if (existing) {
    return;
  }

  const now = new Date().toISOString();
  database.users.push({
    id: 'demo-user',
    username: 'Demo User',
    email: DEMO_EMAIL,
    passwordHash: hashPassword(DEMO_PASSWORD),
    isDemo: true,
    createdAt: now,
    updatedAt: now,
  });
  await persistDatabase();
}

function setSecurityHeaders(response) {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'SAMEORIGIN');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
}

function sendJson(response, statusCode, payload) {
  setSecurityHeaders(response);
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(payload));
}

function sendNoContent(response) {
  setSecurityHeaders(response);
  response.statusCode = 204;
  response.end();
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let raw = '';

    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      size += Buffer.byteLength(chunk);
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Request body is too large.'), {
          statusCode: 413,
        }));
        request.destroy();
        return;
      }
      raw += chunk;
    });
    request.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(Object.assign(new Error('Invalid JSON body.'), {
          statusCode: 400,
        }));
      }
    });
    request.on('error', reject);
  });
}

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function cleanText(value, maximumLength) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().slice(0, maximumLength);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClientAddress(request) {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return request.socket.remoteAddress || 'unknown';
}

const rateLimits = new Map();
function isRateLimited(request, key, maximum = 20, windowMs = 15 * 60 * 1000) {
  const identity = `${getClientAddress(request)}:${key}`;
  const now = Date.now();
  const previous = rateLimits.get(identity);

  if (!previous || previous.resetAt <= now) {
    rateLimits.set(identity, { count: 1, resetAt: now + windowMs });
    return false;
  }

  previous.count += 1;
  rateLimits.set(identity, previous);
  return previous.count > maximum;
}

function getAuthenticatedUser(request) {
  const authorization = request.headers.authorization || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice(7).trim()
    : '';
  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  return database.users.find((user) => user.id === payload.sub) || null;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function randomFallbackQuote(tags = '') {
  const normalizedTag = tags.trim().toLowerCase();
  const taggedQuotes = normalizedTag
    ? database.quotes.filter((quote) =>
        Array.isArray(quote.tags)
          ? quote.tags.some((tag) =>
              String(tag).toLowerCase().includes(normalizedTag)
            )
          : false
      )
    : [];
  const pool = taggedQuotes.length > 0 ? taggedQuotes : database.quotes;
  const quote = pool[Math.floor(Math.random() * pool.length)] || {
    id: 'fallback-default',
    content: 'A small positive step still moves the story forward.',
    author: 'Positive Quotes',
    tags: ['positive'],
  };

  return {
    _id: String(quote.id || crypto.randomUUID()),
    content: String(quote.content || ''),
    author: String(quote.author || 'Unknown'),
    tags: Array.isArray(quote.tags) ? quote.tags : [],
  };
}

async function handleQuoteRequest(request, response, url) {
  const tags = cleanText(url.searchParams.get('tags') || '', 80);
  const remoteUrl = new URL('https://api.quotable.io/random');
  if (tags) {
    remoteUrl.searchParams.set('tags', tags);
  }

  try {
    const remoteResponse = await fetchWithTimeout(remoteUrl, {
      headers: { Accept: 'application/json' },
    });

    if (!remoteResponse.ok) {
      throw new Error(`Quotable returned ${remoteResponse.status}`);
    }

    const quote = await remoteResponse.json();
    sendJson(response, 200, quote);
  } catch (error) {
    console.warn('Using a fallback quote:', error.message);
    sendJson(response, 200, randomFallbackQuote(tags));
  }
}

async function handleBackgroundRequest(response) {
  const key = process.env.UNSPLASH_ACCESS_KEY || '';

  if (!key) {
    sendJson(response, 200, {
      url: '/assets/images/default-background.jpg',
    });
    return;
  }

  try {
    const remoteUrl = new URL('https://api.unsplash.com/photos/random');
    remoteUrl.searchParams.set('query', 'nature');
    remoteUrl.searchParams.set('orientation', 'landscape');

    const remoteResponse = await fetchWithTimeout(remoteUrl, {
      headers: {
        Accept: 'application/json',
        Authorization: `Client-ID ${key}`,
      },
    });

    if (!remoteResponse.ok) {
      throw new Error(`Unsplash returned ${remoteResponse.status}`);
    }

    const photo = await remoteResponse.json();
    const imageUrl = photo?.urls?.regular || photo?.urls?.full;

    sendJson(response, 200, {
      url: imageUrl || '/assets/images/default-background.jpg',
    });
  } catch (error) {
    console.warn('Using the default background:', error.message);
    sendJson(response, 200, {
      url: '/assets/images/default-background.jpg',
    });
  }
}

async function handleApi(request, response, url) {
  const pathname = url.pathname;

  if (request.method === 'OPTIONS') {
    sendNoContent(response);
    return;
  }

  if (pathname === '/api/health' && request.method === 'GET') {
    sendJson(response, 200, { status: 'ok' });
    return;
  }

  if (pathname === '/api/quotes/random' && request.method === 'GET') {
    await handleQuoteRequest(request, response, url);
    return;
  }

  if (pathname === '/api/background' && request.method === 'GET') {
    await handleBackgroundRequest(response);
    return;
  }

  if (pathname === '/api/auth/register' && request.method === 'POST') {
    if (isRateLimited(request, 'register', 10)) {
      sendJson(response, 429, { message: 'Too many registration attempts.' });
      return;
    }

    const body = await readJsonBody(request);
    const username = cleanText(body.username, 60);
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';

    if (username.length < 3 || !isValidEmail(email) || password.length < 8) {
      sendJson(response, 400, {
        message: 'Enter a valid username, email, and password of at least 8 characters.',
      });
      return;
    }

    if (
      database.users.some(
        (user) => String(user.email).toLowerCase() === email
      )
    ) {
      sendJson(response, 409, { message: 'An account with this email already exists.' });
      return;
    }

    const now = new Date().toISOString();
    const user = {
      id: crypto.randomUUID(),
      username,
      email,
      passwordHash: hashPassword(password),
      isDemo: false,
      createdAt: now,
      updatedAt: now,
    };
    database.users.push(user);
    await persistDatabase();

    sendJson(response, 201, {
      user: publicUser(user),
      token: createToken(user.id),
    });
    return;
  }

  if (pathname === '/api/auth/login' && request.method === 'POST') {
    if (isRateLimited(request, 'login', 20)) {
      sendJson(response, 429, { message: 'Too many login attempts. Try again later.' });
      return;
    }

    const body = await readJsonBody(request);
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';
    const user = database.users.find(
      (candidate) => String(candidate.email).toLowerCase() === email
    );

    if (!user || !verifyPassword(password, user.passwordHash)) {
      sendJson(response, 401, { message: 'Invalid email or password.' });
      return;
    }

    sendJson(response, 200, {
      user: publicUser(user),
      token: createToken(user.id),
    });
    return;
  }

  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    sendJson(response, 401, { message: 'Authentication is required.' });
    return;
  }

  const userMatch = pathname.match(/^\/api\/users\/([^/]+)$/);
  if (userMatch && request.method === 'PUT') {
    const requestedUserId = decodeURIComponent(userMatch[1]);
    if (requestedUserId !== authenticatedUser.id) {
      sendJson(response, 403, { message: 'You cannot modify this account.' });
      return;
    }

    if (authenticatedUser.isDemo) {
      sendJson(response, 403, { message: 'The shared demo account settings are read-only.' });
      return;
    }

    const body = await readJsonBody(request);
    const username = cleanText(body.username, 60);
    const email = normalizeEmail(body.email);
    const currentPassword =
      typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword =
      typeof body.newPassword === 'string' ? body.newPassword : '';

    if (username.length < 3 || !isValidEmail(email)) {
      sendJson(response, 400, { message: 'Enter a valid username and email.' });
      return;
    }

    const duplicateEmail = database.users.some(
      (user) =>
        user.id !== authenticatedUser.id &&
        String(user.email).toLowerCase() === email
    );
    if (duplicateEmail) {
      sendJson(response, 409, { message: 'This email address is already in use.' });
      return;
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        sendJson(response, 400, { message: 'The new password must contain at least 8 characters.' });
        return;
      }
      if (!verifyPassword(currentPassword, authenticatedUser.passwordHash)) {
        sendJson(response, 401, { message: 'The current password is incorrect.' });
        return;
      }
      authenticatedUser.passwordHash = hashPassword(newPassword);
    }

    authenticatedUser.username = username;
    authenticatedUser.email = email;
    authenticatedUser.updatedAt = new Date().toISOString();
    await persistDatabase();
    sendJson(response, 200, { user: publicUser(authenticatedUser) });
    return;
  }

  if (pathname === '/api/favorites' && request.method === 'GET') {
    const quoteId = cleanText(url.searchParams.get('quoteId') || '', 120);
    let favorites = database.favorites.filter(
      (favorite) => favorite.userId === authenticatedUser.id
    );
    if (quoteId) {
      favorites = favorites.filter((favorite) => favorite.quoteId === quoteId);
    }
    sendJson(response, 200, favorites.map(({ userId, ...favorite }) => favorite));
    return;
  }

  if (pathname === '/api/favorites' && request.method === 'POST') {
    const body = await readJsonBody(request);
    const quoteId = cleanText(body.quoteId, 160);
    const content = cleanText(body.content, 1000);
    const author = cleanText(body.author, 160);
    const tags = Array.isArray(body.tags)
      ? body.tags.map((tag) => cleanText(tag, 80)).filter(Boolean).slice(0, 20)
      : [];

    if (!quoteId || !content || !author) {
      sendJson(response, 400, { message: 'The favorite quote is incomplete.' });
      return;
    }

    const existing = database.favorites.find(
      (favorite) =>
        favorite.userId === authenticatedUser.id &&
        favorite.quoteId === quoteId
    );
    if (existing) {
      const { userId, ...publicFavorite } = existing;
      sendJson(response, 200, publicFavorite);
      return;
    }

    const favorite = {
      id: crypto.randomUUID(),
      userId: authenticatedUser.id,
      quoteId,
      content,
      author,
      tags,
      favoritedAt: new Date().toISOString(),
    };
    database.favorites.push(favorite);
    await persistDatabase();
    const { userId, ...publicFavorite } = favorite;
    sendJson(response, 201, publicFavorite);
    return;
  }

  const favoriteMatch = pathname.match(/^\/api\/favorites\/([^/]+)$/);
  if (favoriteMatch && request.method === 'DELETE') {
    const id = decodeURIComponent(favoriteMatch[1]);
    const index = database.favorites.findIndex(
      (favorite) =>
        favorite.id === id && favorite.userId === authenticatedUser.id
    );
    if (index === -1) {
      sendJson(response, 404, { message: 'Favorite not found.' });
      return;
    }
    database.favorites.splice(index, 1);
    await persistDatabase();
    sendNoContent(response);
    return;
  }

  if (pathname === '/api/history' && request.method === 'GET') {
    const history = database.history
      .filter((item) => item.userId === authenticatedUser.id)
      .sort((first, second) =>
        String(second.viewedAt).localeCompare(String(first.viewedAt))
      )
      .map(({ userId, ...item }) => item);
    sendJson(response, 200, history);
    return;
  }

  if (pathname === '/api/history' && request.method === 'POST') {
    const body = await readJsonBody(request);
    const quoteId = cleanText(body.quoteId, 160);
    const content = cleanText(body.content, 1000);
    const author = cleanText(body.author, 160);
    const tags = Array.isArray(body.tags)
      ? body.tags.map((tag) => cleanText(tag, 80)).filter(Boolean).slice(0, 20)
      : [];

    if (!quoteId || !content || !author) {
      sendJson(response, 400, { message: 'The history entry is incomplete.' });
      return;
    }

    const item = {
      id: crypto.randomUUID(),
      userId: authenticatedUser.id,
      quoteId,
      content,
      author,
      tags,
      viewedAt: new Date().toISOString(),
    };
    database.history.push(item);
    await persistDatabase();
    const { userId, ...publicItem } = item;
    sendJson(response, 201, publicItem);
    return;
  }

  const historyMatch = pathname.match(/^\/api\/history\/([^/]+)$/);
  if (historyMatch && request.method === 'DELETE') {
    const id = decodeURIComponent(historyMatch[1]);
    const index = database.history.findIndex(
      (item) => item.id === id && item.userId === authenticatedUser.id
    );
    if (index === -1) {
      sendJson(response, 404, { message: 'History entry not found.' });
      return;
    }
    database.history.splice(index, 1);
    await persistDatabase();
    sendNoContent(response);
    return;
  }

  sendJson(response, 404, { message: 'API route not found.' });
}

function serveStatic(response, pathname) {
  if (!STATIC_DIR) {
    sendJson(response, 503, {
      message: 'The Angular production build is missing. Run npm run build first.',
    });
    return;
  }

  let requestedPath = pathname === '/' ? '/index.html' : pathname;
  try {
    requestedPath = decodeURIComponent(requestedPath);
  } catch {
    sendJson(response, 400, { message: 'Invalid URL.' });
    return;
  }

  const safeRelativePath = path
    .normalize(requestedPath)
    .replace(/^([.][.][/\\])+/, '')
    .replace(/^[/\\]+/, '');
  let filePath = path.resolve(STATIC_DIR, safeRelativePath);

  if (!filePath.startsWith(path.resolve(STATIC_DIR))) {
    sendJson(response, 403, { message: 'Forbidden.' });
    return;
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    filePath = path.join(STATIC_DIR, 'index.html');
  }

  const extension = path.extname(filePath).toLowerCase();
  setSecurityHeaders(response);
  response.statusCode = 200;
  response.setHeader(
    'Content-Type',
    MIME_TYPES[extension] || 'application/octet-stream'
  );
  response.setHeader(
    'Cache-Control',
    path.basename(filePath) === 'index.html'
      ? 'no-cache'
      : 'public, max-age=31536000, immutable'
  );
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer(async (request, response) => {
  try {
    const host = request.headers.host || 'localhost';
    const url = new URL(request.url || '/', `http://${host}`);

    if (url.pathname.startsWith('/api/')) {
      await handleApi(request, response, url);
      return;
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      sendJson(response, 405, { message: 'Method not allowed.' });
      return;
    }

    serveStatic(response, url.pathname);
  } catch (error) {
    const statusCode = Number.isInteger(error.statusCode)
      ? error.statusCode
      : 500;
    console.error(error);
    if (!response.headersSent) {
      sendJson(response, statusCode, {
        message:
          statusCode === 500
            ? 'An unexpected server error occurred.'
            : error.message,
      });
    } else {
      response.end();
    }
  }
});

ensureDemoUser()
  .then(() => {
    server.listen(PORT, HOST, () => {
      console.log(`Positive Quotes is listening on http://${HOST}:${PORT}`);
      console.log(`Data file: ${DATA_FILE}`);
      console.log(
        STATIC_DIR
          ? `Static build: ${STATIC_DIR}`
          : 'Static build not found. API-only mode is active.'
      );
    });
  })
  .catch((error) => {
    console.error('Unable to initialize the application:', error);
    process.exitCode = 1;
  });
