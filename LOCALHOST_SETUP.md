# NGP Digital Notice Board - Localhost Setup Guide

This guide will help you set up and run the NGP Digital Notice Board on your local machine.

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Project Structure

```
NGP-Digital-Notice-Board/
├── digital-noticeboard-backend/    # Backend server (Express + WebSocket)
├── digital-noticeboard-frontend/   # Frontend application (React)
└── LOCALHOST_SETUP.md             # This file
```

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd digital-noticeboard-backend

# Install dependencies
npm install

# Start the backend server (runs on http://localhost:5000)
node server.js
```

The backend server will:
- Run on `http://localhost:5000`
- Handle API requests at `/api/notices`
- Serve uploaded images from `/uploads`
- Provide WebSocket connection at `ws://localhost:5000/ws/`

### 2. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd digital-noticeboard-frontend

# Install dependencies
npm install

# Start the frontend development server (runs on http://localhost:3000)
npm start
```

The frontend will automatically open in your browser at `http://localhost:3000`

## Accessing the Application

### Display Board
- URL: `http://localhost:3000`
- Shows the digital notice board with real-time updates
- Automatically cycles through notices every 10 seconds

### Admin Panel
- Login URL: `http://localhost:3000/login`
- Admin Dashboard: `http://localhost:3000/admin`

### Default Admin Credentials
Configure admin users by setting the `REACT_APP_USERS` environment variable:
```bash
export REACT_APP_USERS='[{"email":"admin@example.com","password":"admin123"}]'
```

Or create a `.env` file in the `digital-noticeboard-frontend` directory:
```
REACT_APP_USERS=[{"email":"admin@example.com","password":"admin123"}]
```

## Important Notes

1. **Uploads Directory**: Make sure the `uploads/` directory exists in the backend folder. Create it if it doesn't:
   ```bash
   mkdir digital-noticeboard-backend/uploads
   ```

2. **Data Persistence**: Notices are stored in `digital-noticeboard-backend/data/notices.json`

3. **Image Assets**: Place required images in the `uploads/` folder:
   - `image.png` - Institution logo (left sidebar)
   - `logo.png` - NGP logo (right sidebar)
   - `admin_logo_black.png` - Admin panel logo
   - `icon.png` - Favicon
   - `no_notice.jpg` - Fallback image when no notices exist

4. **WebSocket Connection**: The frontend automatically connects to the WebSocket server for real-time updates

## Building for Production

### Frontend Build
```bash
cd digital-noticeboard-frontend
npm run build
```

This creates an optimized production build in the `build/` directory.

## Troubleshooting

### Port Already in Use
- Backend (5000): Change `PORT` in `.env` or `server.js`
- Frontend (3000): React will automatically suggest port 3001 if 3000 is busy

### WebSocket Connection Failed
- Ensure the backend server is running on port 5000
- Check that no firewall is blocking the connection

### Images Not Loading
- Verify images exist in `digital-noticeboard-backend/uploads/`
- Check file permissions on the uploads directory

## Technology Stack

- **Backend**: Express.js, WebSocket (ws), Multer
- **Frontend**: React, Axios, QRCode.react, dayjs
- **Real-time Updates**: WebSocket connection for live notice updates

## Development URLs

All URLs have been configured for localhost:

- **Backend API**: `http://localhost:5000/api`
- **WebSocket**: `ws://localhost:5000/ws/`
- **Static Files**: `http://localhost:5000/uploads/`
- **Frontend**: `http://localhost:3000`

---

For questions or issues, refer to the original README.md or documentation.
