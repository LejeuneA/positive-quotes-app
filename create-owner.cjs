'use strict';

require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const DATA_FILE = path.resolve(
  process.env.DB_FILE ||
    path.join(
      __dirname,
      'data',
      'db.json'
    )
);

function normalizeEmail(value) {
  return typeof value === 'string'
    ? value.trim().toLowerCase()
    : '';
}

function hashPassword(password) {
  const salt = crypto
    .randomBytes(16)
    .toString('hex');

  const derivedKey = crypto
    .scryptSync(
      password,
      salt,
      64
    )
    .toString('hex');

  return `scrypt$${salt}$${derivedKey}`;
}

const ownerEmail = normalizeEmail(
  process.env.OWNER_EMAIL
);

const ownerPassword =
  typeof process.env.OWNER_PASSWORD ===
  'string'
    ? process.env.OWNER_PASSWORD
    : '';

const ownerUsername =
  typeof process.env.OWNER_USERNAME ===
    'string' &&
  process.env.OWNER_USERNAME.trim()
    ? process.env.OWNER_USERNAME.trim()
    : 'Açelya';

if (!ownerEmail) {
  console.error(
    'OWNER_EMAIL is missing from .env'
  );

  process.exit(1);
}

if (ownerPassword.length < 8) {
  console.error(
    'OWNER_PASSWORD must contain at least 8 characters.'
  );

  process.exit(1);
}

const database = fs.existsSync(DATA_FILE)
  ? JSON.parse(
      fs.readFileSync(
        DATA_FILE,
        'utf8'
      )
    )
  : {};

database.users = Array.isArray(
  database.users
)
  ? database.users
  : [];

database.favorites = Array.isArray(
  database.favorites
)
  ? database.favorites
  : [];

database.history = Array.isArray(
  database.history
)
  ? database.history
  : [];

database.quotes = Array.isArray(
  database.quotes
)
  ? database.quotes
  : [];

const now =
  new Date().toISOString();

let ownerUser =
  database.users.find(
    (user) =>
      !user.isDemo &&
      normalizeEmail(
        user.email
      ) === ownerEmail
  );

if (ownerUser) {
  ownerUser.username =
    ownerUsername;

  ownerUser.email =
    ownerEmail;

  ownerUser.passwordHash =
    hashPassword(
      ownerPassword
    );

  ownerUser.isDemo =
    false;

  ownerUser.updatedAt =
    now;

  console.log(
    'Existing owner account updated.'
  );
} else {
  ownerUser = {
    id:
      crypto.randomUUID(),

    username:
      ownerUsername,

    email:
      ownerEmail,

    passwordHash:
      hashPassword(
        ownerPassword
      ),

    isDemo:
      false,

    createdAt:
      now,

    updatedAt:
      now,
  };

  database.users.push(
    ownerUser
  );

  console.log(
    'New owner account created.'
  );
}

const directory =
  path.dirname(DATA_FILE);

fs.mkdirSync(
  directory,
  {
    recursive: true,
  }
);

const temporaryFile =
  `${DATA_FILE}.tmp`;

fs.writeFileSync(
  temporaryFile,
  JSON.stringify(
    database,
    null,
    2
  ),
  {
    encoding:
      'utf8',

    mode:
      0o600,
  }
);

fs.renameSync(
  temporaryFile,
  DATA_FILE
);

console.log(
  `Owner email: ${ownerEmail}`
);

console.log(
  `Database updated: ${DATA_FILE}`
);

console.log(
  'You can now remove OWNER_PASSWORD from .env.'
);
