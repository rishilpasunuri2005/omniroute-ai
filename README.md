# OmniRoute AI

Intelligent Multi-Model Agent Orchestration Platform

OmniRoute AI is a security-first AI SaaS platform for routing prompts across Groq and OpenRouter models, coordinating LangGraph agents, validating AI output, tracking token usage, and analyzing model performance.

## Architecture

- `frontend/`: Next.js 15, React, TypeScript, Tailwind CSS, shadcn-style components, Clerk authentication.
- `backend/`: FastAPI, LangGraph workflow orchestration, SQLAlchemy async ORM, SlowAPI rate limiting, Clerk JWT verification.
- `database/`: PostgreSQL schema for users, chats, workflows, routing logs, analytics, token usage, API keys, and model metrics.
- `docker-compose.yml`: PostgreSQL, backend, and frontend services.
- `railway.json`: Railway backend deployment configuration.

Request flow:

1. Clerk authenticates the user in Next.js.
2. Frontend sends only a Clerk bearer token to FastAPI.
3. FastAPI verifies the JWT using Clerk JWKS.
4. `/chat` rate limits the request at `10/minute` per token/IP.
5. Router classifies `{ task_type, complexity, confidence }`.
6. LangGraph runs Router -> Planner/Specialized Agent -> Validation Agent.
7. Groq/OpenRouter calls happen only on the backend.
8. PostgreSQL records routing logs, token usage, latency, and model metrics.

## Security Architecture

- Secrets stay server-side. Frontend uses only `NEXT_PUBLIC_*` values.
- Clerk handles authentication; no custom password auth is implemented.
- Backend verifies JWT issuer, signature, expiration, and optional audience.
- All public APIs have SlowAPI rate limits:
  - AI routes: `10/minute`
  - General APIs: `60/minute`
  - Auth endpoints are delegated to Clerk; no backend password endpoints exist.
- Pydantic validates API input size, enums, required fields, and history length.
- SQLAlchemy ORM is used for runtime database operations.
- CORS is allowlist-based via `ALLOWED_ORIGINS`.
- Backend and frontend emit CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy.
- AI prompts and outputs are sanitized before provider calls and rendering.
- Per-user daily token budget is enforced before model execution.
- Errors return generic messages; details are logged server-side.

## APIs

- `POST /chat`: authenticated, rate-limited AI workflow. Supports `stream: true` NDJSON.
- `POST /route`: authenticated route preview.
- `GET /analytics`: authenticated usage and routing analytics.
- `GET /models`: authenticated configured model/provider status.
- `POST /workflow/create`: authenticated workflow definition creation.
- `GET /health`: public health check.

## Routing Defaults

- Simple: Groq `llama-3.1-8b-instant`
- Medium: Groq `llama-3.3-70b-versatile`
- Coding/debugging: OpenRouter `deepseek/deepseek-coder`
- Complex reasoning: OpenRouter `deepseek/deepseek-r1`
- Validation fallback: OpenRouter `openai/gpt-oss-20b`

## Environment

Copy examples before running:

```powershell
copy .env.example .env
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env.local
```

Backend secrets:

- `DATABASE_URL`
- `AUTH_REQUIRED`
- `CLERK_ISSUER`
- `CLERK_JWKS_URL`
- `CLERK_AUDIENCE`
- `GROQ_API_KEY`
- `OPENROUTER_API_KEY`
- `NVIDIA_NIM_API_KEY`
- `NVIDIA_NIM_BASE_URL` (defaults to `https://integrate.api.nvidia.com/v1`)
- `SENTRY_DSN`
- `LANGSMITH_API_KEY`

Provider routing can be configured per route with:

- `SIMPLE_PROVIDER`
- `BALANCED_PROVIDER`
- `CODING_PROVIDER`
- `REASONING_PROVIDER`
- `FALLBACK_PROVIDER`

Supported provider values are `groq`, `openrouter`, and `nvidia`. To use NVIDIA NIM for a route, set the matching provider variable to `nvidia` and set that route's model variable to a model available to your NVIDIA NIM account.

Frontend public config:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

Frontend server config:

- `CLERK_SECRET_KEY`

## Local Development

Backend:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Docker:

```powershell
docker compose up --build
```

Open:

- Frontend: `http://localhost:3000`
- Backend docs: `http://localhost:8000/docs`

## Deployment

Backend on Railway:

1. Create a Railway service from this repository.
2. Use `railway.json`.
3. Set backend environment variables from `backend/.env.example`.
4. Provision PostgreSQL and set `DATABASE_URL`.

Frontend on Vercel:

1. Set project root to `frontend`.
2. Set `NEXT_PUBLIC_API_URL` to the Railway backend URL.
3. Set Clerk frontend/server keys.
4. Configure Clerk allowed origins and redirect URLs.

## Verification

```powershell
cd backend
.venv\Scripts\python.exe -m pytest

cd ..\frontend
npm run build
npm audit --audit-level=high
```

## Production Notes

- Replace startup `Base.metadata.create_all` with Alembic migrations before high-scale production.
- Use Redis-backed SlowAPI storage for multi-instance rate limiting.
- Add tenant-scoped analytics filters if organization-level Clerk accounts are enabled.
- Add provider key rotation workflows before exposing API key management in the UI.
