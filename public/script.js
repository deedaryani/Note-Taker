const BASE_URL = "/note-taker";
const API_URL = `${BASE_URL}/api/notes`;

const welcomeMsg = document.getElementById('welcome-msg');
const logoutBtn = document.getElementById('logout-btn');
const form = document.getElementById('note-form');
const idInput = document.getElementById('note-id');
const titleInput = document.getElementById('note-title');
const contentInput = document.getElementById('note-content');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const notesList = document.getElementById('notes-list');
const emptyState = document.getElementById('empty-state');
const noteCount = document.getElementById('note-count');
const toast = document.getElementById('toast');


let editingId = null;

// Auth guard: bounce to login if there's no active session
async function requireAuth() {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`);
    if (!res.ok) {
      window.location.href = `${BASE_URL}/login.html`;
      return;
    }
    const { user } = await res.json();
    welcomeMsg.textContent = `Hi, ${user.username}`;
    fetchNotes();
  } catch (err) {
    window.location.href = `${BASE_URL}/login.html`;
  }
}

logoutBtn.addEventListener('click', async () => {
  await fetch(`${BASE_URL}/api/auth/logout`, { method: 'POST' });
  window.location.href = `${BASE_URL}/login.html`;
});

// Toast
let toastTimer = null;
function showToast(message, isError = false) {
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 2200);
}

// Fetch & render notes
async function fetchNotes() {
  try {
    const res = await fetch(API_URL);
    if (res.status === 401) {
      window.location.href = `${BASE_URL}/login.html`;
      return;
    }
    if (!res.ok) throw new Error('Failed to fetch notes');
    const notes = await res.json();
    renderNotes(notes);
  } catch (err) {
    showToast(err.message, true);
  }
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function renderNotes(notes) {
  notesList.innerHTML = '';
  noteCount.textContent = `${notes.length} note${notes.length !== 1 ? 's' : ''}`;

  if (notes.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  notes.forEach((note) => {
    const card = document.createElement('div');
    card.className = 'note-card';

    const title = document.createElement('h3');
    title.textContent = note.title;

    const content = document.createElement('p');
    content.textContent = note.content;

    const meta = document.createElement('div');
    meta.className = 'note-meta';
    meta.textContent = `Updated ${formatDate(note.updatedAt)}`;

    const actions = document.createElement('div');
    actions.className = 'note-card-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEdit(note));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'icon-btn delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteNote(note.id));

    actions.append(editBtn, deleteBtn);
    card.append(title, content, meta, actions);
    notesList.appendChild(card);
  });
}

// Form handling
function startEdit(note) {
  editingId = note.id;
  idInput.value = note.id;
  titleInput.value = note.title;
  contentInput.value = note.content;
  submitBtn.textContent = 'Update Note';
  cancelBtn.classList.remove('hidden');
  titleInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  editingId = null;
  form.reset();
  idInput.value = '';
  submitBtn.textContent = 'Add Note';
  cancelBtn.classList.add('hidden');
}

cancelBtn.addEventListener('click', resetForm);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title) {
    showToast('Title is required', true);
    return;
  }

  try {
    let res;
    if (editingId) {
      res = await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
    } else {
      res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
    }

    if (res.status === 401) {
      window.location.href = `${BASE_URL}/login.html`;
      return;
    }

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Something went wrong');
    }

    showToast(editingId ? 'Note updated' : 'Note added');
    resetForm();
    fetchNotes();
  } catch (err) {
    showToast(err.message, true);
  }
});

// Delete
async function deleteNote(id) {
  if (!confirm('Delete this note? This cannot be undone.')) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (res.status === 401) {
      window.location.href = `${BASE_URL}/login.html`;
      return;
    }
    if (!res.ok) throw new Error('Failed to delete note');
    showToast('Note deleted');
    if (editingId === id) resetForm();
    fetchNotes();
  } catch (err) {
    showToast(err.message, true);
  }
}

// Init
requireAuth();