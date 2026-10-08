# Ink & Heart

A public-facing, static website prototype for a literary community and dating platform.

## Security improvements
This version adds several client-side hardening steps intended for a public deployment:

- Content Security Policy (CSP) header in `index.html`
- No inline JavaScript event handlers; actions are bound in `script.js`
- Input sanitization and length limits before saving to local storage
- Safe storage read/write wrappers to prevent crashes from malformed data
- HTML escaping for rendered user content to reduce XSS risk
- Security headers: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`

## Features
- Publish posts and stories
- Like and comment on writing
- Messaging between writers
- Dating interest requests and chat
- Editable profile and premium status
- Browser-based persistence using `localStorage`

## Run locally
Open `index.html` directly in your browser.

For a local web server you can use:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Publish publicly
This project is a static website, so it works well with GitHub Pages or Netlify.

### Option 1: GitHub Pages
1. Go to your GitHub repository
2. Open Settings
3. Go to Pages
4. Select the main branch
5. Set the folder to `/root`
6. Save

Your site will be published at:

```text
https://<your-username>.github.io/ink-and-heart/
```

### Option 2: Netlify
1. Drag and drop this project folder into Netlify
2. Deploy the site
3. Netlify will give you a live public URL

## Google visibility
To make the website show up on Google:
1. Publish it publicly
2. Submit the URL to Google Search Console
3. Add title and meta description in the HTML head
4. Ensure your pages are accessible and indexable

## Important note
This is still a frontend-only app. Real security requires a backend with authentication, a database, server-side validation, and secure session management. The protections above greatly reduce common client-side risks, but they are not a substitute for a secure backend.

## Project files
- `index.html` — main page structure and security metadata
- `styles.css` — styling
- `script.js` — app logic and safety checks
