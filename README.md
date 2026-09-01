# Task Manager

A full-stack task-management web application with user accounts, real-time filtering/search, analytics, and browser notifications.

**Status:** 🚧 In development — functionally complete through Stage 12. GitHub documentation and deployment (Stages 13–14) are still pending, so this isn't yet presented as a finished portfolio piece.

## Tech Stack
- **Frontend:** React, React Router
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Communication:** REST API
- **Auth:** JWT stored in an httpOnly cookie, bcrypt password hashing
- **Testing:** Jest + React Testing Library (client), Jest (server)
- **Tools:** Git, GitHub, VS Code

## Project Structure
```
task-manager/
├── client/     # React frontend
├── server/     # Express backend + REST API
└── README.md
```

## Development Stages
1. Project Planning ✅
2. Project Setup ✅
3. Frontend Foundation ✅
4. Task Functionality ✅
5. Backend (Express + REST API) ✅
6. MySQL Database ✅
7. Connect Frontend → API → Database ✅
8. Search, Filtering & Sorting ✅
9. Authentication ✅
10. Dashboard Analytics ✅
11. Professional UI/UX ✅
12. Testing & Security ✅
13. GitHub documentation ✅
14. Deployment 

### Additional features (beyond the original 14-stage plan)
- ✅ Soft delete with a 10-second undo window
- ✅ Due-date browser notifications, with an on/off toggle
- ✅ Change password / profile settings page
  

## Setup (once cloned)
### Server
```bash
cd server
npm install
npm run dev
```
Copy `.env.example` to `.env` first and fill in your MySQL credentials and a `JWT_SECRET`.

### Client
```bash
cd client
npm install
npm start
```

### Tests
```bash
# server
cd server
npm test

# client
cd client
npm test
```

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /api/auth/register | Create an account |
| POST   | /api/auth/login | Log in, sets httpOnly auth cookie |
| POST   | /api/auth/logout | Clear the auth cookie |
| GET    | /api/auth/me | Get the current logged-in user |
| PUT    | /api/auth/me | Update name and/or password |

### Tasks — `/api/tasks` (all require login)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/tasks | Get all tasks for the logged-in user |
| POST   | /api/tasks | Create a task |
| GET    | /api/tasks/:id | Get a single task |
| PUT    | /api/tasks/:id | Update a task |
| DELETE | /api/tasks/:id | Delete a task (soft delete, undoable) |

### Analytics — `/api/analytics` (all require login)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/analytics/summary | Task counts by status/priority/category |
| GET    | /api/analytics/trend | Completion trend over time |

## Live Demo
_Not yet deployed._

## License
MIT
