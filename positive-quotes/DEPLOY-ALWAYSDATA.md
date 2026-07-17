# Positive Quotes deployment on alwaysdata

## Upload location

Upload this folder's contents to:

```text
/home/acelyalejeune/www/positive-quotes
```

The final structure must contain:

```text
/home/acelyalejeune/www/positive-quotes/server.js
/home/acelyalejeune/www/positive-quotes/data/db.json
/home/acelyalejeune/www/positive-quotes/dist/positive-quotes-app/browser/index.html
```

## Site configuration

Create one Node.js site in **Web > Sites**.

Suggested address:

```text
quotes.acelyalejeune.com
```

Command:

```text
node /home/acelyalejeune/www/positive-quotes/server.js
```

Working directory:

```text
/home/acelyalejeune/www/positive-quotes
```

Choose a supported Node.js version 18 or newer.

## Environment variables

Create a long random secret locally:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Add the generated value in the site's Environment field:

```text
APP_SECRET=PASTE_THE_GENERATED_VALUE
```

Optional Unsplash background support:

```text
UNSPLASH_ACCESS_KEY=YOUR_NEW_RESTRICTED_KEY
```

Do not reuse the old key that was stored in the original Angular source.

alwaysdata supplies the `IP` and `PORT` variables automatically. The server reads both values.

## Demo account

```text
Email: demo@positivequotes.app
Password: Positive123!
```

The shared demo account cannot change its profile credentials. Visitors may create their own accounts.

## File permissions

Recommended permission for the data file:

```text
600
```

The Node process must be able to write to `data/db.json`.

## Tests

```text
https://quotes.acelyalejeune.com/api/health
https://quotes.acelyalejeune.com/login
https://quotes.acelyalejeune.com/favorites
```

The health endpoint should return:

```json
{"status":"ok"}
```

## Important later-deployment rule

Do not overwrite `data/db.json` during future code-only updates unless you intentionally want to reset all registered users, favorites, and history.
