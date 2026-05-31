# HabitFlow

HabitFlow is a dark-mode habit tracking application designed as a calm personal habit companion. Users can create habits, mark them complete or missed, review weekly activity, track streak milestones, edit habits, and safely delete habits with confirmation.

## Features

- JWT authentication
- Create, edit, and delete habits
- Mark habits as complete or missed
- Safe delete confirmation modal
- Success and error toast notifications
- Current focus card
- Next milestone streak card
- Weekly activity grid
- Weekly review summary
- MongoDB persistence with habit log cleanup on delete

## Tech Stack

**Frontend**

- React
- TypeScript
- TailwindCSS
- Vite
- Zustand
- Axios

**Backend**

- NestJS
- TypeScript
- MongoDB
- Mongoose
- JWT authentication
- class-validator

## Project Structure

```txt
.
├── habitflow-frontend   # React + Vite client
├── habitflow-backend    # NestJS API
└── bkp                  # Backup folder
```

## Local Setup

### 1. Clone and install

```bash
cd habitflow-frontend
npm install

cd ../habitflow-backend
npm install
```

### 2. Backend environment

Create `habitflow-backend/.env`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/habitflow
JWT_SECRET=replace-with-a-strong-secret
FRONTEND_URL=http://localhost:5173
N8N_WEBHOOK_URL=
```

`N8N_WEBHOOK_URL` is optional. If it is empty, webhook delivery is skipped safely.

### 3. Frontend environment

Create `habitflow-frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 4. Run locally

Start the backend:

```bash
cd habitflow-backend
npm run start:dev
```

Start the frontend:

```bash
cd habitflow-frontend
npm run dev
```

Open:

```txt
http://localhost:5173
```

## Useful Scripts

Frontend:

```bash
npm run dev
npm run build
npm run preview
```

Backend:

```bash
npm run start:dev
npm run build
npm run start:prod
```

## API Overview

All habit routes are protected with JWT.

```txt
POST   /auth/register
POST   /auth/login

GET    /habits
POST   /habits
PATCH  /habits/:id
DELETE /habits/:id

POST   /habits/complete
POST   /habits/missed
```

Deleting a habit also deletes related `HabitLog` records to prevent orphaned completion history.

### Local n8n

If n8n is running locally at:

```txt
http://localhost:5678
```

Create a workflow in n8n with a **Webhook** trigger. Copy the webhook URL and set it in `habitflow-backend/.env`:

```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/habit-event
```

Use the test URL while developing. In production, use the production webhook URL from n8n.

### Hosted n8n

For a deployed app, your local n8n URL will not work because Render/Vercel cannot call `localhost` on your computer. You need a public n8n URL.

Good options:

- **n8n Cloud**: easiest, managed, paid.
- **Render**: can run n8n from the official Docker image.
- **Railway**: has n8n templates and Docker deployment.
- **VPS**: deploy n8n with Docker Compose if you are comfortable managing a server.

After deploying n8n, your webhook will look like:

```txt
https://your-n8n-domain.com/webhook/habit-event
```

Set this in your deployed backend environment:

```env
N8N_WEBHOOK_URL=https://your-n8n-domain.com/webhook/habit-event
```

### Important n8n Environment Variables

When self-hosting n8n behind Render, Railway, or a reverse proxy, set:

```env
WEBHOOK_URL=https://your-n8n-domain.com/
N8N_PROXY_HOPS=1
GENERIC_TIMEZONE=Asia/Kolkata
```

Also protect your n8n editor:

```env
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=use-a-strong-password
```

For production self-hosting, use persistent storage or PostgreSQL so workflows and credentials are not lost after redeploys.

### Recommended n8n Deployment Path

For this project:

1. Deploy frontend on Vercel or Netlify.
2. Deploy backend on Render.
3. Deploy database on MongoDB Atlas.
4. Deploy n8n on Render or Railway.
5. Copy the n8n production webhook URL.
6. Add it to backend env as `N8N_WEBHOOK_URL`.
7. Redeploy the backend.

If you do not want n8n automation yet, leave `N8N_WEBHOOK_URL` empty. HabitFlow will still work; webhook delivery will simply be skipped.

## Production Checklist

- Use a strong `JWT_SECRET`
- Set `FRONTEND_URL` to your deployed frontend URL
- Set `VITE_API_BASE_URL` to your deployed backend URL
- Add your deployment provider IP access rules in MongoDB Atlas, or allow access from anywhere for quick demos
- Keep secrets out of Git
- Run both builds before deploying

```bash
cd habitflow-frontend
npm run build

cd ../habitflow-backend
npm run build
```

## Credits

HabitFlow  
Small habits. Better days.  
Powered by Eram.

Here is the Sanapshots :
<img width="1849" height="1010" alt="image" src="https://github.com/user-attachments/assets/90f05f4f-1392-4b32-b620-566d9fc9ea26" />

