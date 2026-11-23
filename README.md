# Pilon Coffee Roasters: online shop

Static website (HTML, CSS, JavaScript). No build step, no dependencies.

## Run locally
Open `index.html` in a browser, or run `npx serve .` in this folder.

## Deploy (free)
- **Vercel / Netlify:** drag this folder (or the .zip) into the dashboard. Done.
- **GitHub Pages:** push the files to a repo, then Settings > Pages > Deploy from branch.

## Make the form(s) work (newsletter form)
1. Create a free form at https://formspree.io (or https://web3forms.com).
2. Copy the endpoint URL they give you.
3. In the HTML, find the `<form ... data-endpoint="">` and paste the URL between the quotes.
4. Redeploy and send a test message.

## Take real payments (Stripe, no backend needed)
1. Create a Stripe account, then Payment Links > New.
2. Add your products and copy the link.
3. In `app.js`, paste it in `CONFIG.CHECKOUT_URL`.
4. For a multi-product cart, create one Payment Link per product or use Stripe Checkout with a small serverless function (Vercel Function).

## Customise
Colours and fonts are CSS variables at the top of `style.css`. Replace the placeholder names, texts and prices with the client's real content.
