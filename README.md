# OmniRoute AI

Intelligent Multi-Model Agent Orchestration Platform

OmniRoute AI is a production-style MVP for routing AI tasks across local open-source models through Ollama. It classifies prompts, selects a model, runs a multi-agent workflow, validates responses, records usage, and displays routing analytics.

## Architecture Plan

The system is split into two deployable apps plus infrastructure:

- `frontend/`: Next.js 15, React, TypeScript, Tailwind CSS, shadcn-style components.
- `backend/`: FastAPI, async Python services, routing engine, agent workflow, Ollama integration, PostgreSQL persistence.
- `database/`: PostgreSQL schema used by Docker initialization.
- `docker-compose.yml`: PostgreSQL, Ollama, backend, and frontend services.

Request flow:

1. User submits a prompt in the chat UI.
2. FastAPI `/chat` calls the Router Agent.
3. The classifier returns `{ task_type, complexity, confidence }`.
4. Routing rules select `llama3`, `mistral`, `deepseek-coder`, `deepseek-r1`, or fallback `phi3`.
5. Planner/Coding/Specialized agent generates the response through Ollama.
6. Validation Agent checks empty responses, malformed JSON, risk markers, and incomplete output.
7. Metrics are persisted to PostgreSQL and shown on the dashboard.

## Implementation Phases

1. Scaffold monorepo structure and environment configuration.
2. Implement FastAPI backend: schemas, router, agents, Ollama client, validation, analytics.
3. Implement frontend: chat, dashboard, models, workflows, settings.
4. Add Docker, database schema, and environment examples.
5. Verify imports, TypeScript structure, and runtime startup commands.

## Backend API

- `POST /chat`: routes and executes a prompt. Supports `stream: true` with newline-delimited JSON events.
- `POST /route`: returns only classification and selected model.
- `GET /analytics`: token usage, routing distribution, average latency, utilization, savings.
- `GET /models`: configured Ollama model mappings and local availability.
- `GET /health`: service health.

## Routing Defaults

- Simple prompts: `llama3`
- Medium prompts: `mistral`
- Coding/debugging: `deepseek-coder`
- Complex reasoning: `deepseek-r1`
- Validation repair/fallback: `phi3`

## Local Setup

### Docker

```bash
cp .env.example .env
docker compose up --build
```

Then open:

- Frontend: `http://localhost:3000`
- Backend docs: `http://localhost:8000/docs`
- Ollama: `http://localhost:11434`

Pull local models into the Ollama container:

```bash
docker compose exec ollama ollama pull llama3
docker compose exec ollama ollama pull mistral
docker compose exec ollama ollama pull deepseek-coder
docker compose exec ollama ollama pull phi3
```

If `deepseek-r1` is unavailable in your Ollama registry, set `REASONING_MODEL` to a locally installed reasoning-capable model in `backend/.env` or `docker-compose.yml`.

### Manual Development

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

## Environment Variables

Backend:

- `DATABASE_URL` using the async SQLAlchemy psycopg driver, for example `postgresql+psycopg://omniroute:omniroute@localhost:5432/omniroute`
- `OLLAMA_BASE_URL`
- `OLLAMA_STRICT`
- `SIMPLE_MODEL`
- `BALANCED_MODEL`
- `CODING_MODEL`
- `REASONING_MODEL`
- `FALLBACK_MODEL`
- `ROUTE_CONFIDENCE_THRESHOLD`

Frontend:

- `NEXT_PUBLIC_API_URL`

## Notes For Production Hardening

- Replace startup `create_all` with Alembic migrations.
- Add authentication, tenant isolation, and rate limits.
- Add a provider interface for GPT, Claude, and Gemini APIs.
- Add prompt/version telemetry and evaluation datasets.
- Add background job processing for long-running workflows.
