const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Read all data from the JSON file
function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return raw.trim() ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

// Write all data to the JSON file
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Generate a unique ID for a new item
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Handle GET request to fetch all data
app.get("/api/notes", (req, res) => {
  const data = readData();
  res.json(data);
});

// Handle GET request to fetch data by ID
app.get("/api/notes/:id", (req, res) => {
  const data = readData();
  const item = data.find((item) => item.id === req.params.id);

  if (!item) {
    return res.status(404).json({ message: "Data not found" });
  }

  res.json(item);
});

// Handle POST request to create new data
app.post("/api/notes", (req, res) => {
  const { title, content } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  const data = readData();
  const newItem = {
    id: generateId(),
    title: title.trim(),
    content: content ? content.trim() : "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.unshift(newItem);
  writeData(data);
  res.status(201).json({ message: "Data created successfully", data: newItem });
});

// Handle PUT request to update data by ID
app.put("/api/notes/:id", (req, res) => {
  const data = readData();
  const itemIndex = data.findIndex((item) => item.id === req.params.id);

  if (itemIndex === -1) {
    return res.status(404).json({ message: "Data not found" });
  }

  data[itemIndex] = { ...data[itemIndex], ...req.body, updatedAt: new Date().toISOString() };
  writeData(data);
  res.json({ message: "Data updated successfully", data: data[itemIndex] });
});

// Handle DELETE request to delete data by ID
app.delete("/api/notes/:id", (req, res) => {
  const data = readData();
  const itemIndex = data.findIndex((item) => item.id === req.params.id);

  if (itemIndex === -1) {
    return res.status(404).json({ message: "Data not found" });
  }

  data.splice(itemIndex, 1);
  writeData(data);
  res.json({ message: "Data deleted successfully" });
});

// Fallback: serve index.html for any other route
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});