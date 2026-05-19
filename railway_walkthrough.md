# Railway Deployment Walkthrough

Follow these steps to deploy your backend to Railway.

## 1. Prepare your Railway Project
1. Log in to [Railway.app](https://railway.app/).
2. Click **"New Project"**.
3. Select **"Deploy from GitHub repo"**.
4. Choose your `omniroute-ai` repository.

## 2. Provision PostgreSQL
1. Inside your new Railway project, click **"Add Service"**.
2. Select **"Database"** -> **"Add PostgreSQL"**.
3. Railway will automatically create a database and provide a `DATABASE_URL`.

## 3. Configure the Backend Service
1. Click on the service created from your GitHub repo.
2. Go to **Settings**:
   - **Root Directory**: Ensure this is set to `/` (the root of the repo).
   - **Railway JSON**: Railway will automatically detect the `railway.json` in the root and use it.
3. Go to **Variables**:
   - Add the following variables:
     - `ENVIRONMENT`: `production`
     - `AUTH_REQUIRED`: `true`
     - `ALLOWED_ORIGINS`: `https://your-frontend.vercel.app,http://localhost:3000` (Update with your actual frontend URL)
     - `FRONTEND_ORIGIN`: `https://your-frontend.vercel.app`
     - `GROQ_API_KEY`: `your_key_here`
     - `OPENROUTER_API_KEY`: `your_key_here`
     - `NVIDIA_NIM_API_KEY`: `your_key_here` if you want to use NVIDIA NIM
     - `NVIDIA_NIM_BASE_URL`: `https://integrate.api.nvidia.com/v1`
     - `CODING_PROVIDER`: `nvidia` to route coding prompts through NVIDIA NIM
     - `CODING_MODEL`: a NVIDIA NIM chat model available to your account
   - Note: `DATABASE_URL` is already linked if you added the Postgres service.

## 4. Verify Health Check
Railway will use the `/health` endpoint defined in `railway.json`.
- The build should succeed using `backend/Dockerfile.railway`.
- The service will start and wait for the health check to pass.

## 5. Domain & Networking
1. In the service **Settings**, click **"Generate Domain"** or add a custom domain.
2. This URL will be your `BACKEND_URL` for the frontend.
