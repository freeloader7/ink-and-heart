# Ink & Heart

A public-facing, static website prototype for a literary community and dating platform.

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

## Project files
- `index.html` — main page structure
- `styles.css` — styling
- `script.js` — app logic
