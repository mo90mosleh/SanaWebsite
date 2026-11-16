# Sanayar on Cloudflare

The public assistant uses `POST /api/sanayar/chat`. It sends only the question and six recent chat messages. The Worker supplies its own public device and consumable catalogue; it never sends customer, order, address or account records to Gemini.

Set `GEMINI_API_KEY` as a **Secret** on the `sanawebsite` Worker and deploy the change. Never place this key in a `VITE_` variable, source code or a client request. Optional plain variable `GEMINI_MODEL` selects the model; the default is `gemini-3.1-flash-lite`.

The Worker requires the `ASSETS` binding plus two native rate limit bindings:

- `SANAYAR_LIMIT`: namespace `11001`, 10 requests per 60 seconds per IP.
- `SANAYAR_GLOBAL_LIMIT`: namespace `11002`, 60 requests per 60 seconds using one application key. These native limits are approximate per Cloudflare location, not a global billing cap.

Keep existing secret bindings during upload using `keep_bindings: ["secret_text"]`. Set assets routing `run_worker_first: ["/api/*"]`; all ordinary site assets remain static. Preserve the existing compatibility date `2026-11-10`.

Build and validate:

```sh
node scripts/build-sanayar-worker.mjs
node --test tests/sanayar-worker.test.mjs
npm run build
node scripts/check-sanayar-gemini.mjs
```

The browser test defaults to Windows Edge; set `CHROMIUM_PATH` for another installation. It tests 390px and 1440px layouts and mocks Gemini success and failure.

Upload `dist/` through the Cloudflare assets API and the bundled `.sanayar-build/worker.mjs` as the Worker entrypoint. `scripts/sanayar-manifest.mjs` creates the manifest. `scripts/upload-sanayar-assets.mjs` accepts the short-lived asset upload session on hidden stdin, not arguments or a credential file. Do not commit generated upload sessions or completion tokens.

Readiness: `GET /api/sanayar/status` returns only a configured boolean and release identifier. A successful live chat must return `mode: "gemini"`; a local guide fallback does not verify the LLM connection. Pricing and clinical questions intentionally use fixed guidance. The frontend states when it falls back to the existing website guide.

No chat history is stored on the server. Upstream error logs contain only status codes, without keys, prompts or responses. Runtime requests expire after 20 seconds, and request bodies are bounded before JSON parsing.
