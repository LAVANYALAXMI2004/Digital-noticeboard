# NGP Digital Notice Board

A real-time digital notice board system built with Express.js, React, and WebSockets. Displays notices with automatic cycling, supports image uploads, and includes an admin dashboard for managing notices.

## Features

- **Real-time Updates**: WebSocket-based live updates across all connected displays
- **Image Support**: Upload and display notices with images
- **Admin Dashboard**: Easy-to-use interface for creating and managing notices
- **Auto-cycling**: Notice board automatically cycles through notices every 10 seconds
- **Authentication**: Login-based access control for the admin panel
- **Crawler Integration**: Automated crawler to fetch events from Knowafest
- **Responsive Design**: Works on various screen sizes

## Architecture

### Backend (`digital-noticeboard-backend`)
- **Framework**: Express.js with WebSocket support (ws library)
- **Port**: 5000
- **Features**:
  - REST API for notices management (`GET`, `POST`, `DELETE`)
  - WebSocket server for real-time broadcasts
  - Image upload handling
  - Event crawler service
  - Persistent JSON-based storage

### Frontend (`digital-noticeboard-frontend`)
- **Framework**: React with Create React App
- **Port**: 3000
- **Features**:
  - Display board with real-time updates
  - Admin dashboard for notice management
  - Login authentication
  - Image upload with validation

## Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Backend Setup

```bash
cd digital-noticeboard-backend
npm install
```

### Frontend Setup

```bash
cd digital-noticeboard-frontend
npm install
```

## Environment Configuration

### Backend
Create a `.env` file in `digital-noticeboard-backend/`:
```
HF_TOKEN=your_huggingface_token_here
API_URL=http://localhost:5000
```

### Frontend
Create a `.env` file in `digital-noticeboard-frontend/`:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000/ws
REACT_APP_USERS=[{"email":"admin@example.com","password":"secret"}]
```

## Running the Application

### Start Backend
```bash
cd digital-noticeboard-backend
npm install
node server.js
```
Server runs on `http://localhost:5000`

### Start Frontend
```bash
cd digital-noticeboard-frontend
npm install
npm start
```
App opens on `http://localhost:3000`

## Usage

1. **View Notices**: Open `http://localhost:3000` to see the notice board display
2. **Admin Access**: Go to `http://localhost:3000/login` to access the admin panel
3. **Create Notice**: Use the admin dashboard to upload notices with images
4. **Auto-refresh**: The display board refreshes in real-time via WebSocket

## Project Structure

```
├── digital-noticeboard-backend/
│   ├── routes/
│   │   ├── notices.js          # Notice CRUD operations
│   │   └── crawler.js          # Event crawler endpoints
│   ├── services/
│   │   └── knowafestCrawler.js # Event fetching service
│   ├── data/
│   │   └── notices.json        # Persistent notice storage
│   └── server.js               # Express & WebSocket server
├── digital-noticeboard-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DisplayBoard.jsx # Notice display component
│   │   │   ├── Dashboard.jsx    # Admin panel
│   │   │   └── Login.jsx        # Authentication
│   │   └── services/
│   │       └── api.js           # Axios configuration
│   └── public/
└── README.md
```

## API Endpoints

### Notices
- `GET /api/notices` - Fetch all notices
- `POST /api/notices` - Create new notice (multipart/form-data with image)
- `DELETE /api/notices/:id` - Delete a notice

### Crawler
- `GET /api/crawler` - Fetch events from Knowafest

## Authentication

Admin authentication uses client-side credential validation via environment variables. Login credentials are configured through `REACT_APP_USERS` environment variable.

## File Storage

- **Images**: Stored in the configured uploads directory
- **Notices**: Persisted as JSON in `data/notices.json`

## Development Notes

- API URLs are currently configured for production domain `https://ngpdnb.infaverse.com`
- Update URLs in configuration for local development
- Ensure the uploads directory exists and has write permissions
- WebSocket connections broadcast full notice list to all connected clients

## License

This project is part of NGP Digital Systems.

## Support

For issues or questions, please contact the development team.
