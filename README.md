# Responsive Task Manager

A full-stack task management application built with **React**, **Django REST Framework**, **JWT authentication**, and **PostgreSQL-ready deployment configuration**.

The app lets users securely manage their own tasks, track work by status and priority, and filter tasks through a responsive dashboard that works cleanly on desktop and mobile screens.

## Features

- User registration and login with JWT authentication
- Private task dashboard for each authenticated user
- Create, read, update, and delete tasks
- Filter tasks by status and priority
- Search tasks by title or description
- Track total tasks, in-progress tasks, and completion percentage
- Responsive React UI built with Vite
- Django REST API with user-specific task ownership
- PostgreSQL-ready database configuration using `DATABASE_URL`
- Render deployment blueprint for frontend, backend, and managed PostgreSQL

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, CSS |
| Backend | Django, Django REST Framework |
| Authentication | Simple JWT |
| Database | SQLite for local development, PostgreSQL for production |
| Deployment | Render, Gunicorn, WhiteNoise |

## Project Structure

```text
Responsive-Task-Manager/
├── backend/
│   ├── task_manager/
│   ├── tasks/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── render.yaml
├── .gitignore
└── README.md
```

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The backend runs at:

```text
http://127.0.0.1:8000
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

By default, the frontend calls:

```text
http://127.0.0.1:8000/api
```

To use a deployed backend, create `frontend/.env`:

```env
VITE_API_URL=https://your-backend-url/api
```

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register/` | Create a new user |
| `POST` | `/api/auth/login/` | Get JWT access and refresh tokens |
| `POST` | `/api/auth/refresh/` | Refresh access token |
| `GET` | `/api/tasks/` | List authenticated user's tasks |
| `POST` | `/api/tasks/` | Create a task |
| `GET` | `/api/tasks/<id>/` | Get task details |
| `PUT` | `/api/tasks/<id>/` | Update a task |
| `DELETE` | `/api/tasks/<id>/` | Delete a task |

## Task Filters

```text
/api/tasks/?status=todo
/api/tasks/?status=in_progress
/api/tasks/?priority=high
/api/tasks/?search=deadline
```

Filters can be combined:

```text
/api/tasks/?status=in_progress&priority=high&search=report
```

## Environment Variables

Backend:

```env
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-backend-host.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend-host.onrender.com
DATABASE_URL=postgresql://user:password@host:port/database
```

Frontend:

```env
VITE_API_URL=https://your-backend-host.onrender.com/api
```

## Deployment

This repository includes `render.yaml`, which defines:

- A Django API service
- A React static frontend service
- A managed PostgreSQL database

On Render, create a new Blueprint from this repository. Render will read `render.yaml`, install dependencies, run migrations, and deploy both services.

## Resume Summary

```text
Responsive Task Manager | Self Project (Jun'25 - Jul'25)
- Built a full-stack task manager with CRUD and filtering using React, Django REST Framework, and PostgreSQL-ready configuration.
- Implemented JWT authentication and REST APIs for secure user-specific task workflows.
- Added Render deployment configuration with separate frontend/API services and managed PostgreSQL support.
```

## Live Demo

Try the deployed application: [Responsive Task Manager](https://responsive-task-manager-web-0lgv.onrender.com/)

Register an account to create and manage your own tasks.
