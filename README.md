# HealthCareNoteAssist

AI-powered clinical consultation note assistant. Paste rough doctor notes, get a structured medical summary, an action checklist, and a patient-friendly email — streamed in seconds.

---

## What it does

1. Doctor fills in patient name, visit date, specialty, and free-text consultation notes
2. Notes are sent to GPT-4o-mini via a streaming FastAPI endpoint
3. Three sections stream back in real time:
   - **Summary of visit** — structured record-ready notes
   - **Next steps** — numbered action checklist
   - **Draft patient email** — plain-language, personalised to the patient

Output can be copied to clipboard or downloaded as `.md`.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (Pages Router), TypeScript, Tailwind CSS |
| Auth + Billing | Clerk (`<Protect>`, `<PricingTable>`, JWT verification) |
| Backend | FastAPI (Python), SSE streaming via `StreamingResponse` |
| AI | OpenAI `gpt-4o-mini` with specialty-aware system prompts |
| Python deps | `uv` + `pyproject.toml` |
| Dev proxy | Next.js `rewrites()` → `http://localhost:8001` |

---

## Project structure

```
HealthCareNoteAssist/
├── pages/
│   ├── _app.tsx          # ClerkProvider wrapper
│   ├── _document.tsx     # HTML shell + meta
│   ├── index.tsx         # Landing page
│   └── product.tsx       # Protected consultation page
├── components/
│   └── ConsultationForm.tsx   # Form + SSE client + markdown output
├── api/
│   └── index.py          # FastAPI app (consultation endpoint + health check)
├── styles/
│   └── globals.css       # Tailwind + .markdown-content prose styles
├── next.config.ts        # Rewrites /api/* → FastAPI
└── pyproject.toml        # Python dependencies (uv)
```

---

## Local setup

### Prerequisites

- Node.js 18+
- Python 3.12+
- [uv](https://docs.astral.sh/uv/) — `curl -LsSf https://astral.sh/uv/install.sh | sh`
- A [Clerk](https://clerk.com) account (free)
- An [OpenAI](https://platform.openai.com) API key

### 1. Clone and install

```bash
# Frontend
npm install

# Backend
uv sync
```

### 2. Environment variables

Create `.env.local` in the project root:

```env
# Clerk — dashboard.clerk.com → Configure → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWKS_URL=https://<your-clerk-app>.clerk.accounts.dev/.well-known/jwks.json

# OpenAI — platform.openai.com
OPENAI_API_KEY=sk-proj-...
```

### 3. Clerk Billing setup

In the [Clerk Dashboard](https://dashboard.clerk.com):

1. Go to **Billing** → **Plans**
2. Create a plan with slug `premium_subscription`
3. Set a price (or $0 for testing) and publish it
4. Enable Billing on your application

This activates the `<Protect plan="premium_subscription">` gate and the `<PricingTable>` on the product page.

### 4. Run dev servers

**Terminal 1 — Next.js:**
```bash
npm run dev
```

**Terminal 2 — FastAPI:**
```bash
uv run uvicorn api.index:app --reload --port 8001
```

Open [http://localhost:3000](http://localhost:3000).

---

## How auth works

```
Browser → Clerk sign-in → JWT token
       → POST /api/consultation (Authorization: Bearer <jwt>)
       → Next.js rewrite → FastAPI :8001
       → fastapi-clerk-auth verifies JWT via JWKS
       → OpenAI stream → SSE back to browser
```

The `<Protect plan="premium_subscription">` component in `pages/product.tsx` gates access to the consultation form. Unauthenticated or free-tier users see the pricing table instead.

---

## Roadmap

| Status | Feature |
|---|---|
| ✅ | Clerk auth + JWT-verified API |
| ✅ | SSE streaming output |
| ✅ | Specialty-aware prompts (GP, Cardiology, Pediatrics, Psychiatry, Orthopedics) |
| ✅ | Clerk Billing gate + pricing table |
| ✅ | Copy / Download `.md` output |
| 🔜 | Voice input (Web Speech API / Whisper) |
| 🔜 | Image upload — handwritten notes via GPT-4o vision |
| 🔜 | Docker + AWS Lambda container deployment |

---

## Disclaimer

Demo only — not HIPAA compliant. Do not enter real patient data.
