# Converso Platform

A full-stack multilingual real-time chat application built with the MERN stack, Socket.IO, JWT authentication, email verification, translation support, moderation tools, and an admin dashboard.

## Stack

- Backend: Node.js, Express, Socket.IO, MongoDB, Mongoose
- Frontend: React, Vite, React Router
- Auth: JWT, bcrypt
- Translation: LibreTranslate-compatible API
- Email: Nodemailer

## Folder Structure

```text
.
|-- client/
|-- server/
|-- package.json
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment files:

- Copy `server/.env.example` to `server/.env`
- Copy `client/.env.example` to `client/.env`

3. Start MongoDB locally or point `MONGO_URI` to your cluster.

4. Run the app:

```bash
npm run dev
```

5. Open the frontend at the Vite URL shown in the terminal.

## Environment Notes

### Server

- `JWT_SECRET`: long random secret
- `CLIENT_URL`: React app URL
- `TRANSLATION_API_URL`: LibreTranslate endpoint
- `EMAIL_FROM`: sender address used for verification emails
- `SMTP_*`: SMTP credentials

### Client

- `VITE_API_URL`: REST API base URL
- `VITE_SOCKET_URL`: Socket.IO server URL

## Features

- Email/password signup and login
- Email verification
- Anonymous public user IDs
- One-to-one real-time messaging
- Automatic message translation
- Typing indicators
- Dark/light theme
- Report and block functionality
- Admin review panel for moderation
- MongoDB indexes and paginated message loading

## Production Notes

- Add HTTPS, secure cookies, and a real mail provider before deployment.
- Replace demo moderation logic with a stronger provider if needed.
- Add background jobs for retries and mail queues at scale.
