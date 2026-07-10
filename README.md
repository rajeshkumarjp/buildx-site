# BuildX static site

## Structure
```
/index.html                     BuildX homepage
/nutrivend/index.html           NutriVend product page
/nutrivend/DEMO123/index.html   Example merchant page (template — copy this folder per merchant)
/terms.html                     Site-wide Terms & Conditions
/privacy.html                   Site-wide Privacy Policy
/refund.html                    Site-wide Refund Policy
/assets/style.css               Shared stylesheet used by every page
.nojekyll                       Tells GitHub Pages to serve folders as-is
```

## Adding a new merchant page
1. Copy the folder `nutrivend/DEMO123/` and rename it to the merchant's ID, e.g. `nutrivend/RZP_ABC123/`.
2. Open the copied `index.html` and edit only the sections marked `<!-- EDIT PER MERCHANT -->`:
   business name, address, phone, email, and price.
3. Commit and push. The page goes live at:
   `https://<your-domain>/nutrivend/<folder-name>/`

No other files need to change — every merchant page links to the same shared
`/terms.html`, `/privacy.html`, and `/refund.html`.

## Hosting on GitHub Pages
1. Push this folder to a GitHub repo (e.g. `buildx-site`).
2. Repo Settings → Pages → set source to the `main` branch, root folder.
3. Add a `CNAME` file at the repo root containing just your domain, e.g.:
   ```
   www.yourdomain.in
   ```
4. At your domain registrar, point the domain to GitHub Pages:
   - `A` records for the apex domain to GitHub's IPs (185.199.108.153,
     185.199.109.153, 185.199.110.153, 185.199.111.153), or
   - a `CNAME` record for `www` pointing to `<your-github-username>.github.io`.
5. Wait for DNS to propagate, then enable "Enforce HTTPS" in GitHub Pages settings.

## Domain name
`buildx.in` was already taken. See suggested alternatives in chat — verify
current availability at a registrar (e.g. GoDaddy, Namecheap, BigRock) before
buying, since availability changes.
