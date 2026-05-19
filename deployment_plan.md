# Deployment Plan: Backend on Railway

To deploy the backend of OmniRoute AI on Railway, we will use the existing Docker-based configuration. Since this is a monorepo, we've already set up a `railway.json` in the root and a `Dockerfile.railway` in the backend directory.

## 1. File Optimizations
- **railway.json**: Configured to point to the backend Dockerfile and sets up health checks.
- **Dockerfile.railway**: Handles the monorepo structure correctly for the build.
- **FastAPI Health Route**: Available at `/health` for Railway's health checks.

## 2. Infrastructure Setup
- **PostgreSQL**: Provision a managed PostgreSQL instance on Railway.
- **Environment Variables**: Configure all required secrets (API keys, Database URL, etc.) in the Railway dashboard.

## 3. Step-by-Step Deployment Guide
1. **Initialize Railway Project**: Create a new project on Railway.
2. **Link GitHub Repository**: Connect the `omniroute-ai` repository.
3. **Provision Database**: Add a PostgreSQL service.
4. **Configure Backend Service**: 
   - Set the Root Directory to the project root (where `railway.json` is).
   - Add environment variables.
5. **Deploy**: Railway will automatically detect the `railway.json` and start the build.

## 4. Environment Variables Checklist
The following variables must be set in Railway:
- `DATABASE_URL`: Automatically provided by Railway (the app handles the prefix conversion).
- `GROQ_API_KEY`: Your Groq API key.
- `OPENROUTER_API_KEY`: Your OpenRouter API key.
- `NVIDIA_NIM_API_KEY`: Your NVIDIA NIM API key, if routing any task to NVIDIA.
- `NVIDIA_NIM_BASE_URL`: Optional, defaults to `https://integrate.api.nvidia.com/v1`.
- `CODING_PROVIDER`, `REASONING_PROVIDER`, `FALLBACK_PROVIDER`: Optional route provider overrides. Use `nvidia` to route that task class through NVIDIA NIM.
- `AUTH_REQUIRED`: Set to `true`.
- `ENVIRONMENT`: Set to `production`.
- `ALLOWED_ORIGINS`: Add your Railway backend URL and Frontend URL.
- `FRONTEND_ORIGIN`: Your production frontend URL.
