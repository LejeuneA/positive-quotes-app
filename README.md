# Positive Quotes

Positive Quotes is an Angular 19 portfolio application for discovering, saving, and revisiting uplifting quotations. The production version uses a small same-origin Node.js API, so the Angular frontend and persistent JSON data can be deployed together without CORS or localhost dependencies.

## Features

- Random quotes and category filtering
- User registration and login
- Password hashing and signed authentication tokens
- Per-user favorites and viewing history
- Account settings
- Responsive Angular Material interface
- Optional Unsplash backgrounds with a local fallback
- SPA route fallback for direct links and browser refreshes

## Technology

- Angular 19
- TypeScript
- SCSS
- Angular Material
- Node.js built-in HTTP server
- Persistent JSON storage
- Quotable API with local fallback quotes

## Local development

Install dependencies:

```bash
npm install
```

Start the local API in the first terminal:

```bash
npm run db
```

Start Angular in a second terminal:

```bash
npm start
```

Open `http://localhost:4200`.

## Production build

```bash
npm run build
```

The Node server automatically serves the Angular build from:

```text
dist/positive-quotes-app/browser
```

Start the production application:

```bash
APP_SECRET="replace-with-a-long-random-secret" node server.js
```

On Windows PowerShell:

```powershell
$env:APP_SECRET="replace-with-a-long-random-secret"
node server.js
```

## Environment variables

- `IP`: listening address supplied by the host
- `PORT`: listening port supplied by the host
- `APP_SECRET`: long random secret used to sign login tokens
- `DB_FILE`: optional absolute path to the writable JSON data file
- `DEMO_EMAIL`: optional demo account email
- `DEMO_PASSWORD`: optional demo account password
- `UNSPLASH_ACCESS_KEY`: optional Unsplash access key stored only on the server

When no Unsplash key is supplied, the app uses its bundled background image.

## Demo account

```text
Email: demo@positivequotes.app
Password: Positive123!
```

The shared demo account cannot change its profile credentials. Visitors may register their own account.

## Production data

Runtime data is stored in `data/db.json`. Keep this file writable by the Node process and do not replace it during later code-only deployments unless you intentionally want to reset the demo data.

## Security notes

- Passwords are stored as salted scrypt hashes.
- The API never exposes password hashes.
- Favorites and history are isolated by authenticated user.
- Authentication endpoints include basic rate limiting.
- The previously client-side Unsplash key has been removed from the Angular bundle.

## Copyright

© Açelya Lejeune. All rights reserved.
