require("dotenv").config();

const BASE_PATH = "/note-taker";
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.IP || process.env.HOST || '0.0.0.0';
const DATA_FILE = path.join(__dirname, "data.json");
const USERS_FILE = path.join(__dirname, "users.json");
const SALT_ROUNDS = 10;

app.set("trust proxy", 1);

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-only-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      // Only require HTTPS cookies when actually running behind HTTPS 
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

// Data helpers

function readJson(file) {
  try {
    const raw = fs.readFileSync(file, "utf-8");
    return raw.trim() ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const readData = () => readJson(DATA_FILE);
const writeData = (data) => writeJson(DATA_FILE, data);
const readUsers = () => readJson(USERS_FILE);
const writeUsers = (data) => writeJson(USERS_FILE, data);

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function publicUser(user) {
  return { id: user.id, username: user.username };
}

// Auth middleware

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

// Auth routes

app.post(`${BASE_PATH}/api/auth/signup`, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({ message: "Username is required" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const cleanUsername = username.trim().toLowerCase();
  const users = readUsers();

  if (users.some((u) => u.username === cleanUsername)) {
    return res.status(409).json({ message: "That username is already taken" });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = {
    id: generateId(),
    username: cleanUsername,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);

  req.session.userId = newUser.id;
  res.status(201).json({ message: "Account created", user: publicUser(newUser) });
});

app.post(`${BASE_PATH}/api/auth/login`, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const cleanUsername = username.trim().toLowerCase();
  const users = readUsers();
  const user = users.find((u) => u.username === cleanUsername);

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  req.session.userId = user.id;
  res.json({ message: "Logged in", user: publicUser(user) });
});

app.post(`${BASE_PATH}/api/auth/logout`, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

app.get(`${BASE_PATH}/api/auth/me`, (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const users = readUsers();
  const user = users.find((u) => u.id === req.session.userId);
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.json({ user: publicUser(user) });
});

// Notes routes (all scoped to the logged-in user)

app.get(`${BASE_PATH}/api/notes`, requireAuth, (req, res) => {
  const data = readData().filter((item) => item.userId === req.session.userId);
  res.json(data);
});

app.get(`${BASE_PATH}/api/notes/:id`, requireAuth, (req, res) => {
  const data = readData();
  const item = data.find(
    (item) => item.id === req.params.id && item.userId === req.session.userId
  );

  if (!item) {
    return res.status(404).json({ message: "Data not found" });
  }

  res.json(item);
});

app.post(`${BASE_PATH}/api/notes`, requireAuth, (req, res) => {
  const { title, content } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  const data = readData();
  const newItem = {
    id: generateId(),
    userId: req.session.userId,
    title: title.trim(),
    content: content ? content.trim() : "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.unshift(newItem);
  writeData(data);
  res.status(201).json({ message: "Data created successfully", data: newItem });
});

app.put(`${BASE_PATH}/api/notes/:id`, requireAuth, (req, res) => {
  const data = readData();
  const itemIndex = data.findIndex(
    (item) => item.id === req.params.id && item.userId === req.session.userId
  );

  if (itemIndex === -1) {
    return res.status(404).json({ message: "Data not found" });
  }

  const { title, content } = req.body;
  data[itemIndex] = {
    ...data[itemIndex],
    ...(title !== undefined ? { title } : {}),
    ...(content !== undefined ? { content } : {}),
    updatedAt: new Date().toISOString(),
  };
  writeData(data);
  res.json({ message: "Data updated successfully", data: data[itemIndex] });
});

app.delete(`${BASE_PATH}/api/notes/:id`, requireAuth, (req, res) => {
  const data = readData();
  const itemIndex = data.findIndex(
    (item) => item.id === req.params.id && item.userId === req.session.userId
  );

  if (itemIndex === -1) {
    return res.status(404).json({ message: "Data not found" });
  }

  data.splice(itemIndex, 1);
  writeData(data);
  res.json({ message: "Data deleted successfully" });
});

// Static files

app.use(`${BASE_PATH}`, express.static(path.join(__dirname, "public")));

// Fallback: serve index.html for any other route
app.get(`${BASE_PATH}/*splat`, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
});