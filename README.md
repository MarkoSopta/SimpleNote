# Django + React Notes App

Full-stack notes application with JWT auth, block-based note content, and Dockerized local setup.

## Features

- User authentication (register, login, logout) with JWT access/refresh tokens.
- Protected frontend routes for authenticated users.
- Create, update, delete notes.
- Mark notes as done / undone.
- Block-based note editor:
  - Text blocks
  - Checkbox blocks
  - Reorder blocks while editing
- Inline delete confirmation and UI toast/error feedback.
- Dark-themed UI.

## Tech Stack

- Backend: Django, Django REST Framework, SimpleJWT, Gunicorn
- Frontend: React + Vite + React Router + Axios
- Database: MySQL 8.4 (Docker), SQLite fallback for non-Docker local backend
- Infra: Docker Compose (db + backend + frontend)

## Project Structure

- backend: Django API
- frontend: React app
- docker-compose.yml: local Docker orchestration

## Run Locally with Docker (Recommended)

### Prerequisites

- Docker Desktop (or Docker Engine + Compose)

### 1) Start the stack

From the repository root:

```bash
docker compose up --build -d
```

### 2) Open the app

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

### 3) Stop the stack

```bash
docker compose down
```

To also remove DB data volume:

```bash
docker compose down -v
```

## Environment Variables

Docker Compose already defines working defaults. For custom values, use these example files:

- backend/.env.example
- frontend/.env.example

Most important backend vars:

- DJANGO_SECRET_KEY
- DJANGO_DEBUG
- DJANGO_ALLOWED_HOSTS
- CORS_ALLOWED_ORIGINS
- CSRF_TRUSTED_ORIGINS
- USE_MYSQL
- MYSQL_DATABASE / MYSQL_USER / MYSQL_PASSWORD / MYSQL_HOST / MYSQL_PORT

Frontend var:

- VITE_API_URL

## Optional: Run Without Docker

### Backend

```bash
cd backend
../env/Scripts/python.exe -m pip install -r backend/requirements.txt
../env/Scripts/python.exe manage.py migrate
../env/Scripts/python.exe manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend dev URL: http://localhost:5173

## API Endpoints (Main)

- POST /api/user/register/
- POST /api/token/
- POST /api/token/refresh/
- GET /api/notes/
- POST /api/notes/
- PATCH /api/notes/modify/<id>/
- DELETE /api/notes/delete/<id>/

## Troubleshooting

### Browser says CORS failed in Docker

This can happen when backend is not actually serving (network errors sometimes appear as CORS in browser).

Check services:

```bash
docker compose ps
docker compose logs backend --tail=120
```

If backend fails MySQL auth with a message mentioning `caching_sha2_password` and `cryptography`, rebuild:

```bash
docker compose up --build -d backend
```

Then test preflight:

```bash
curl -i -X OPTIONS http://localhost:8000/api/user/register/ -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST"
```
