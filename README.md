# AI StudyBuddy API

An AI-powered educational backend built with **Node.js, Express, MongoDB, and Gemini 3.8 Flash**.

## Features
- JWT auth stored in **HTTP-only cookies** (access + refresh tokens)
- Role-Based Access Control (student / admin)
- Upload study materials (.txt, .md, .pdf)
- AI-powered: summarize, flashcards, quiz, study plan via Gemini 3.8 Flash

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env` file
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai-studybuddy
CLIENT_URL=http://localhost:3000
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
GEMINI_API_KEY=AQ.Ab8RN6KtOAsPANA54OWBq0kWsiffkDaKrs_lGPQOcTrIeezDQg
GEMINI_MODEL=gemini-3.8-flash
NODE_ENV=development
```

For MongoDB Atlas, replace `MONGO_URI` with the connection string from Atlas and
replace `<db_password>` with the database user's password. Make sure the
machine's IP address is allowed in Atlas Network Access.

### 3. Run the server
```bash
node index.js
```

### 4. Run the frontend
The frontend reads `client/.env` and calls the backend at
`http://localhost:5000` by default.
```bash
cd client
npm run dev
```

---

## Project Structure
```
ai-studybuddy/
├── index.js                     # Entry point
├── uploads/                     # Temp file storage
└── src/
    ├── controllers/
    │   ├── authController.js    # register, login, refresh, logout
    │   ├── materialController.js# upload + all AI features
    │   └── adminController.js   # admin-only routes
    ├── middleware/
    │   ├── auth.js              # protect + adminOnly
    │   └── upload.js            # multer config
    ├── models/
    │   ├── User.js
    │   └── Material.js
    ├── routes/
    │   ├── auth.js
    │   ├── materials.js
    │   └── admin.js
    └── utils/
        ├── db.js                # MongoDB connection
        ├── gemini.js            # Gemini AI helper
        └── tokens.js            # JWT + cookie helpers
```

---

## API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint    | Body                              | Description          |
|--------|-------------|-----------------------------------|----------------------|
| POST   | /register   | `name, email, password, role`     | Register new user    |
| POST   | /login      | `email, password`                 | Login                |
| POST   | /refresh    | —                                 | Refresh tokens       |
| POST   | /logout     | —                                 | Clear cookies        |

> Tokens are stored in **HTTP-only cookies** (`accessToken` expires in 15m, `refreshToken` in 7d)

---

### Material Routes — `/api/materials` *(requires login)*

| Method | Endpoint              | Body / Notes                          | Description              |
|--------|-----------------------|---------------------------------------|--------------------------|
| POST   | /upload               | Form-data: `file` + optional `title`  | Upload study material    |
| GET    | /                     | —                                     | List your materials      |
| GET    | /:id                  | —                                     | Get one material         |
| DELETE | /:id                  | —                                     | Delete material          |
| POST   | /:id/summarize        | —                                     | AI summarize             |
| POST   | /:id/flashcards       | `{ count: 5 }`                        | Generate flashcards      |
| POST   | /:id/quiz             | `{ count: 5 }`                        | Generate MCQ quiz        |
| POST   | /:id/study-plan       | `{ goal, hoursPerDay, days }`         | Personalized study plan  |

---

### Admin Routes — `/api/admin` *(admin role only)*

| Method | Endpoint      | Description                        |
|--------|---------------|------------------------------------|
| GET    | /users        | List all users                     |
| DELETE | /users/:id    | Delete user + their materials      |
| GET    | /stats        | Total users & materials count      |

---

## Cookie Details

| Cookie         | Expiry   | Flags                        |
|----------------|----------|------------------------------|
| `accessToken`  | 15 min   | httpOnly, sameSite=strict    |
| `refreshToken` | 7 days   | httpOnly, sameSite=strict    |

In production, both cookies have `secure: true`.
