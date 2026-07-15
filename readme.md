# Note Taker Application

Step8Up Bootcamp Week-7 Assignment. A full-stack note-taking application built with **Node.js**, **Express**, and **HTML/CSS/JavaScript**. Users can create, read, update, and delete notes.

## Features

- Create new notes with a title and content
- View all notes in a responsive layout
- Edit existing notes
- Delete notes

## Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** HTML, CSS, JavaScript (served by Express)
- **Storage:** JSON file (`data.json`)

## Project Structure

```
Step8Up_Week-7/
├── public/
│   ├── index.html        # Main HTML page
│   ├── styles.css        # Styling
│   └── script.js         # Frontend logic (fetch calls to the API)
├── server.js             # Express server + REST API
├── data.json             # Persisted notes data
├── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint          | Description         |
|--------|--------------------|----------------------|
| GET    | `/api/notes`       | Get all notes        |
| GET    | `/api/notes/:id`   | Get a single note    |
| POST   | `/api/notes`       | Create a new note     |
| PUT    | `/api/notes/:id`   | Update an existing note |
| DELETE | `/api/notes/:id`   | Delete a note         |


## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/deedaryani/Step8Up_Week-7
   cd Step8Up_Week-7
   ```

2. **Install dependencies**
   ```bash
   npm i
   ```

3. **Run the server**
   ```bash
   npm start
   ```

4. **Open in your browser**
   ```
   http://localhost:3000
   ```

## Live Links

- **GitHub Repository:**  https://github.com/deedaryani/Step8Up_Week-7
- **Deployed App (Render):**  https://note-taker-app-998p.onrender.com/

## Author
Dee Daryani

## License

MIT
