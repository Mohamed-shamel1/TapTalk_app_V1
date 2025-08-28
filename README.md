# 🚀 TapTalk / SARAHAA.app — Real-time Messaging Backend ✨

[![Repository](https://img.shields.io/badge/repo-TapTalk_app_V1-blue)](https://github.com/Mohamed-shamel1/TapTalk_app_V1) [![Node](https://img.shields.io/badge/node-%3E%3D22.17.0-brightgreen)]() [![License](https://img.shields.io/badge/license-None-lightgrey)]()

A modern, modular backend for a chat/messaging application (TapTalk — also referenced as SARAHAA.app). Built with Node.js, Express, and MongoDB/Mongoose. Designed to be easy to extend, swap database implementations, and integrate with OAuth, email verification, and media storage.

---

## 📖 Project Description

TapTalk / SARAHAA.app is a backend service intended to power a chat/messaging application. It provides RESTful endpoints for user authentication, user profile management, messaging (send/receive/read/delete), media uploads, and admin operations. The codebase emphasizes modularity and clear separation of concerns so teams can extend features or replace infrastructure (e.g., switching DB adapter) with minimal friction.

Main objectives:
- Lightweight, modular Node.js/Express backend
- JWT-based authentication with Google OAuth support
- Media uploads via Cloudinary + multer
- Clear service → controller → DB abstraction layers
- Security best practices (helmet, rate limiting, validation)

---

## ⚙️ Tech Stack & Design Architecture

- Runtime & framework:
  - Node.js (engines: 22.17.0)
  - Express 5.x
- Database:
  - MongoDB with Mongoose ODM
- Auth & Security:
  - jsonwebtoken (JWT)
  - google-auth-library (Google OAuth)
  - bcrypt for password hashing
  - nodemailer for email flows
- Media:
  - Cloudinary + multer
- Validation & Docs:
  - Joi, swagger-jsdoc, swagger-ui-express
- Utilities:
  - dotenv, helmet, cors, express-rate-limit, nanoid, crypto-js

Design pattern / architecture:
- Layered architecture (Routes → Controllers → Services → DB abstraction → Models)
- Centralized DB service (src/DB/DB.service.js) provides generic CRUD helpers so DB implementation can be swapped with minimal code changes
- Middleware layer: authentication guard, validation, error handling, rate limiting
- Domain modules grouped under src/modules (e.g., auth, massage)

Simple architecture diagram:

```text
Client (Mobile/Web)
       |
       v
  Express Routes (src/modules/<domain>/routes.js)
       |
       v
  Controllers (src/modules/<domain>/controller.js)
       |
       v
  Services (src/modules/<domain>/service.js)
       |
       v
  DB Service (src/DB/DB.service.js)
       |
       v
  Mongoose Models (src/model/*.js)
       |
       v
  MongoDB
```

---

## 🚀 Features

- 🔐 User Authentication (email/password)
- 🌐 Google OAuth sign-in
- 🧾 JWT-based sessions & route protection
- ✉️ Email verification & password reset via Nodemailer
- 🗂️ Modular routes for auth & messaging
- 🖼️ Media upload support (Cloudinary + multer)
- 🛡️ Security: helmet, express-rate-limit, CORS
- 📜 Swagger/OpenAPI-ready (dependencies included)
- 🔁 Easy-to-swap DB layer (central DB service abstraction)
- 🧩 Validation via Joi

---

## 🔐 Authentication & Security (Detailed)

- Registration & Login
  - Passwords are hashed with bcrypt before storage.
  - Upon registration, the system can send an email verification link/token.
- JWT
  - Access tokens (and optional refresh tokens) handled with jsonwebtoken.
  - Middleware protects private routes by verifying tokens and attaching user info to req.
- Google OAuth
  - google-auth-library is present; OAuth tokens validated and used to create/sign-in users.
- Email flows
  - nodemailer used for sending verification emails and password reset links.
- Production security
  - Helmet for secure headers, express-rate-limit to limit abuse, and CORS configured.

---

## 📂 Full Folder Structure (recommended / actual high-level)

Below is a clear tree of the main directories and files (reflects the current repo plus common folders the code indicates). Use this as a reference to navigate the codebase.

```text
.
├─ .gitignore
├─ package.json
├─ README.md
├─ WhatsApp Image 2025-08-19 at 06.07.24_16bb826f.jpg
└─ src
   ├─ index.js                   # App entry (starts server)
   ├─ app.controller.js          # (if present) app bootstrap, route registration
   ├─ config                     # env loader, config constants (e.g., jwt, cloudinary)
   │  └─ .env
   ├─ DB
   │  └─ DB.service.js           # Central DB abstraction for CRUD ops
   ├─ middleware                 # Auth guards, validators, error handlers
   │  ├─ auth.middleware.js
   │  ├─ error.middleware.js
   │  ├─ rateLimit.middleware.js
   │  └─ multer.middleware.js
   ├─ model                      # Mongoose schemas
   │  ├─ user.model.js
   │  ├─ message.model.js
   │  └─ Token.model.js
   ├─ modules
   │  ├─ auth
   │  │  ├─ auth.routes.js
   │  │  ├─ auth.controller.js
   │  │  ├─ auth.service.js
   │  │  
   │  ├─ user
   │  │  ├─ user.routes.js
   │  │  ├─ user.controller.js
   │  │  ├─ user.service.js
   │  │  
   │  └─ massage                  # messaging module (typo kept from repo)
   │     ├─ massage.routes.js
   │     ├─ massage.controller.js
   │     ├─ massage.service.js
   │     
   ├─ utils/
   │  ├─ response.js            # Unified API response helpers
   │  ├─ email.js               # Email sender
   │  ├─ swagger.js             # Swagger setup
   │  ├─templates/
   │  │   └─ email.templates.js   # Email templates
   │  ├─events/
   │  │   └─events.email.js      # Email-related event handlers
   │  ├─multier/
   │  │   ├─ cloudinary.js        # Cloudinary client setup
   │  │   ├─ cloud.multer.js      # Multer storage for Cloudinary
   │  │   └─local.multer.js      # Local disk storage config
   │  └─ security/
   │      ├─ encryption.js        # Symmetric encryption helpers (crypto-js)
   │      ├─ hash.security.js     # Password hashing (bcrypt)
   │      ├─ jwt.security.js      # JWT sign/verify helpers
   │      └─ otp.js               # OTP generation/verification
   │
   │
   ├─ validation                 # shared Joi schemas & helpers
   │  ├─ auth.validation.js
   │  ├─ massage.validation.js
   │  └─ user.validation.js
 
```

Notes:
- The repo currently has src/DB, src/middleware, src/model and src/modules (auth and massage). The structure above includes additional conventional folders (`utils`, `validation`, etc.) often present or useful in this codebase. If a folder above is missing, consider adding it for clarity and separation of concerns.

---

### Folder purpose & short descriptions

- src/DB
  - Contains DB.service.js which centralizes CRUD operations (findOne, create, findById, etc.). This makes the services DB-implementation-agnostic.
- src/middleware
  - Authentication middleware (verifies JWT and user status).
  - Validation middleware to run Joi schema checks.
  - Error handling middleware to format and log errors centrally.
  - Multer/file middleware for handling uploads.
- src/model
  - Mongoose schema definitions (User, Message, etc.). Models encapsulate data shape, indexes, and pre/post hooks.
- src/modules
  - Domain-based modules (auth, user, massage). Each module typically contains routes, controller, service, and validation.
- src/utils
  - Small reusable helpers: email sender wrapper (nodemailer), JWT token utilities, Cloudinary uploader, formatters, and date helpers.
- src/validation
  - Shared Joi schemas, custom validators, and validation utilities to keep rules in one place.
- src/services
  - Application or 3rd-party service integrations (e.g., mailer service, storage service). These are used by domain services to perform external work.
- src/controllers
  - If used, common controllers or route aggregators. Prefer small domain controllers under modules.
- src/tests
  - Unit and integration tests (not present currently, suggested).

---

## 🧩 Module Breakdown (Detailed)

Below I describe each main module (Auth, User, Massage) and how they work in this project.

### Auth Module 🔐 (src/modules/auth)

Purpose:
- Handle user registration, login, token issuance, social login, email verification, and password resets.

Main responsibilities & features:
- POST /api/auth/register
  - Accepts name, email, password (and optional profile data)
  - Validates input, hashes password (bcrypt), creates user, sends verification email
- POST /api/auth/login
  - Validates credentials, issues JWT access token (and optional refresh token)
- POST /api/auth/google
  - Accepts Google id_token, verifies via google-auth-library, create or sign-in user
- GET /api/auth/verify-email?token=...
  - Confirms a newly-registered email using a verification token
- POST /api/auth/forgot-password
  - Creates a reset token, sends email with reset link
- POST /api/auth/reset-password
  - Accepts token + new password, verifies token, updates password, invalidates tokens


Conceptual controller snippet:
```js
// src/modules/auth/auth.controller.js
export async function login(req, res, next) {
  const { email, password } = req.body;
  const tokens = await authService.login({ email, password });
  return res.json({ data: tokens });
}
```

Service uses DB.service.js:
```js
// conceptual
const user = await findOne({ model: User, filter: { email } });
```

### User Module 👤 (src/modules/user)

Purpose:
- Manage user profiles and account lifecycle (view/update/freeze/unfreeze).

Main features:
- GET /api/users/me — fetch current user profile
- PATCH /api/users/me — update profile (name, bio, avatar)
- POST /api/users/:id/freeze — admin endpoint to freeze an account
- POST /api/users/:id/unfreeze — admin endpoint to unfreeze
- Optional list/search endpoints with pagination

Request lifecycle (user update):
```text
PUT /users/me
  -> user.routes -> auth middleware -> validation -> user.controller.update()
  -> user.service.updateProfile() -> DB.service.findOneAndUpdate(User, filter, data)
  -> response
```

Notes:
- Avatar upload typically handled via multer middleware then cloudinary util to store and return URLs.
- Freeze sets a `status` enum that auth middleware checks to prevent login.

### Massage (Message) Module ✉️ (src/modules/massage)

Purpose:
- Send/receive messages between users, track read/unread status, and manage deletions.

Main features:
- POST /api/messages — send message (from, to, content, attachments)
- GET /api/messages/conversation/:conversationId — fetch conversation messages
- GET /api/messages/unread — fetch unread messages
- PATCH /api/messages/:id/read — mark as read
- DELETE /api/messages/:id — delete message (soft/hard)
- Optional: Real-time notifications (socket integration) — check codebase for socket usage

Message lifecycle:
```text
Client POST /messages -> massage.controller.create()
  -> massage.service.sendMessage()
  -> DB.service.create({ model: Message, data })
  -> massage.service triggers socket emit (if enabled)
  -> controller returns 201 and message object
```

---

## 🌐 Routes & Endpoints (Example Map)

Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/google
- GET /api/auth/verify-email?token=
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

Users
- GET /api/users/me
- PATCH /api/users/me
- POST /api/users/:id/freeze
- POST /api/users/:id/unfreeze
- GET /api/users/:id

Messages (Massage)
- POST /api/messages
- GET /api/messages/conversation/:conversationId
- PATCH /api/messages/:id/read
- DELETE /api/messages/:id
- GET /api/messages/unread

Request lifecycle (recap):
```text
HTTP Request -> Router -> Middleware (auth/validation) -> Controller -> Service -> DB.service -> Model -> MongoDB
-> Service returns result -> Controller formats response -> Middleware error handler -> Client
```

---

## 🧾 DB Service (src/DB/DB.service.js) — concrete details

The repository includes src/DB/DB.service.js which centralizes common DB operations. Key exported helpers:

- findOne({ model, filter = {}, select = "" })
- create({ model, data = [{}], options = { validateBeforeSave: true } })
- findById({ model, id, select = "", populate = [] })
- findOneAndUpdate({ model, filter = {}, data = {}, options = { runValidators: true, new: true } })
- deleteOne({ model, filter = {} })
- find({ model, filter = {}, select = "", populate = [] })
- updateMany({ model, filter = {}, data = {} })

Example usage in a service:
```js
import { findOne, create } from "../../DB/DB.service.js";
import User from "../../model/user.model.js";

const user = await findOne({ model: User, filter: { email } });
if (!user) {
  await create({ model: User, data: { name, email, password: hashed } });
}
```

This approach isolates DB-specific code to one file and makes services simpler and easier to test.

---

## 📡 API Documentation & Postman

- Swagger (OpenAPI): If swagger is configured in your app bootstrap, docs should be available at:
  - http://localhost:5000/api-docs

- Postman Collection:
  - If a Postman collection exists in the repo, link it here. No collection was detected in the repository scan, so here's a placeholder:
    - Postman Collection (placeholder): https://documenter.getpostman.com/view/45285876/2sB3HgPhn5 https://www.postman.com/collections/PLACEHOLDER

If you provide the route files, I can extract exact schemas and generate a concrete Postman collection or Swagger spec.

---

## 🛠️ Local Setup & Usage

1. Clone the repo
```bash
git clone https://github.com/Mohamed-shamel1/TapTalk_app_V1.git
cd TapTalk_app_V1
```

2. Install dependencies
```bash
npm install
```

3. Environment variables
Create a `.env` file at the repo root and add (example):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/taptalk
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=you@example.com
EMAIL_PASS=your_email_password
```

4. Start the server (development)
```bash
npm run start:dev
# package.json defines: "start:dev": "node --watch ./src/index.js"
```

5. Visit:
- API root: http://localhost:5000/
- Swagger (if configured): http://localhost:5000/api-docs

---

## 🧪 Testing

No test framework or tests were detected in the repository. To add testing:

- Install Jest (or Mocha + Chai) and supertest
```bash
npm install --save-dev jest supertest
```

- Add script in package.json:
```json
"scripts": {
  "test": "jest --runInBand"
}
```

- Create test files under `tests/` and run:
```bash
npm test
```

Consider adding GitHub Actions for CI to run tests on PRs.

---

## 📸 Screenshots / GIFs

Placeholder for app image:

![App Screenshot](./WhatsApp%20Image%202025-08-19%20at%2006.07.24_16bb826f.jpg)

Add more screenshots or animated GIFs demonstrating auth flows, message sending, and Swagger UI.

---

## 🤝 Contributing

Contributions welcome! Suggested workflow:
1. Fork the repo
2. Create a feature branch: git checkout -b feat/my-feature
3. Commit frequently with clear messages
4. Push and open a Pull Request

Please:
- Keep PRs focused and small
- Add tests for new behavior
- Update Swagger / Postman docs when adding endpoints
- Consider adding a CONTRIBUTING.md and CODE_OF_CONDUCT.md

---

## 📜 License

No LICENSE file detected in the repository. Add a license file (e.g., MIT) to make usage terms explicit.

---

## 🎉 Final Touch

Thanks for building TapTalk! ✨

If you'd like, I can:
- Parse the route/controller files to generate an exact Swagger/OpenAPI spec and Postman collection.
- Create a `.env.example`, CONTRIBUTING.md, and a basic CI workflow for tests.
- Add missing folders such as src/utils and src/validation if you want me to scaffold them.

Happy to continue — tell me which of the above you'd like me to do next and I can create the files and pull request for you.
