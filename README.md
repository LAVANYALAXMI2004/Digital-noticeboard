# NGP Digital Notice Board

A real-time digital notice board system with Express backend, React frontend, and WebSocket support for live updates.

## Features

- Real-time notice updates via WebSocket
- Image upload support
- Admin dashboard for managing notices
- Auto-cycling display (10s per notice)
- Client-side authentication

## Tech Stack

- **Backend**: Express.js, WebSockets (ws)
- **Frontend**: React (CRA)
- **Storage**: JSON-based persistence

## Installation

### Backend
```bash
cd digital-noticeboard-backend
npm install
node server.js
```
Runs on: `http://localhost:5000`

### Frontend
```bash
cd digital-noticeboard-frontend
npm install
npm start
```
Runs on: `http://localhost:3000`

## Environment Variables

### Backend (.env)
```
HF_TOKEN=your_token_here
```

### Frontend (.env)
```
REACT_APP_USERS=[{"email":"admin@example.com","password":"secret"}]
```

## Usage

- **Display**: `http://localhost:3000` (public notice board)
- **Admin**: `http://localhost:3000/login` → `/admin` (manage notices)

## API Endpoints

- `GET /api/notices` - Fetch all notices
- `POST /api/notices` - Create notice (multipart with image)
- `DELETE /api/notices/:id` - Delete notice

## License

NGP Digital Systems

