# Note Taker Application

Step8Up Bootcamp Week-7 Assignment. A full-stack note-taking application built with **Node.js**, **Express**, and **HTML/CSS/JavaScript**. Users sign up, log in, and manage their own private notes.

## Features

- Sign up and log in with a username and password
- Each user only ever sees their own notes
- Create new notes with a title and content
- View all notes in a responsive layout
- Edit existing notes
- Delete notes

## Tech Stack

- **Backend:** Node.js, Express, express-session, bcryptjs
- **Frontend:** HTML, CSS, JavaScript (served by Express)
- **Storage:** JSON files (`data.json` for notes, `users.json` for accounts)

## Authentication

- Passwords are hashed with `bcryptjs` before being stored — plaintext passwords are never saved.
- Login state is kept with `express-session` and an `httpOnly` cookie, so the session token isn't reachable from frontend JavaScript.
- Every notes API route is protected: unauthenticated requests get a `401`, and notes are always filtered/looked up by the logged-in user's ID, so one user can never read, edit, or delete another user's notes.

## Project Structure

```
Note-Taker/
├── public/
│   ├──auth.js            # Middleware
│   ├── index.html        # Main HTML page
│   ├── login.html        # Login page  
│   ├── styles.css        # Styling
│   └── script.js         # Frontend logic (fetch calls to the API)
├── server.js             # Express server + REST API
├── data.json             # Persisted notes data
├── users.json            # user data
├── Dockerfile            # docker config file for deployment
├── package.json
└── README.md
```

## API Endpoints

### Auth

| Method | Endpoint             | Description                     |
|--------|-----------------------|----------------------------------|
| POST   | `/api/auth/signup`    | Create an account and log in    |
| POST   | `/api/auth/login`     | Log in to an existing account   |
| POST   | `/api/auth/logout`    | End the current session         |
| GET    | `/api/auth/me`        | Get the current logged-in user  |

### Notes (all require a logged-in session)

| Method | Endpoint          | Description         |
|--------|--------------------|----------------------|
| GET    | `/api/notes`       | Get the current user's notes |
| GET    | `/api/notes/:id`   | Get a single note (must be yours) |
| POST   | `/api/notes`       | Create a new note     |
| PUT    | `/api/notes/:id`   | Update an existing note (must be yours) |
| DELETE | `/api/notes/:id`   | Delete a note (must be yours) |


## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/deedaryani/Note-Taker
   cd Note-Taker
   ```

2. **Install dependencies**
   ```bash
   npm i
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and set `SESSION_SECRET` to a long random string (used to sign session cookies). 

     To generate a random string for a **Session_Secret** use:

         
       node -e "console.log(require('crypto').randomBytes(12).toString('hex'))"
         

 

4. **Run the server**
   ```bash
   npm start
   ```

5. **Open in your browser**
   ```
   http://localhost:3000
   ```

## Live Links

- **GitHub Repository:**  https://github.com/deedaryani/Note-Taker
- **Deployed App (alwaysdata):** http://deedaryani.alwaysdata.net/note-taker 

## Author
Dee Daryani

## License

MIT
