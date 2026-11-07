# Cloudflare Pages deployment

The repository now includes a root index.html, so a no-build deployment from the repository root serves a real page instead of HTTP 404. Its assets are loaded from public/.

Recommended Pages build settings:

- Production branch: main
- Root directory: repository root
- Framework preset: None
- Build command: npm run build
- Build output directory: dist

The build copies only browser assets to dist. Pages compiles the functions/ directory separately. The existing Node backend cannot run as a Cloudflare Pages static asset or Function without a separate migration.

## Connect the existing private backend

1. Host server.mjs on a Node.js 24 host with persistent storage as described in SETUP.md.
2. Configure that backend with APP_URL=https://trackervasystem.pages.dev, SETUP_CODE, ENCRYPTION_KEY and DATA_DIR. Set HOST=0.0.0.0. Use the host’s PORT.
3. In Cloudflare Pages Settings → Variables and Secrets, set VA_BACKEND_URL to the HTTPS origin of that backend, without a path (for example https://your-node-host.example).
4. Redeploy Pages. functions/[[path]].js forwards only /api/ and /auth/ to that configured backend. Requests remain same-origin from the browser; cookies and CSRF checks are retained.
5. Open the Pages URL. Create the owner account with your own private setup code. Configure Google/OpenAI on the Node host when ready. The Google redirect URI must use https://trackervasystem.pages.dev/auth/google/callback.

If no backend is connected, the frontend shows a prominent read-only DESIGN PREVIEW with sample records. It does not create an account, save client data, claim Google is connected, or replace your server records. This is a visible fallback, not a completed backend deployment.

Core application features remain available when the backend is connected. No account passwords, API keys, OAuth client secrets or database files belong in GitHub.
