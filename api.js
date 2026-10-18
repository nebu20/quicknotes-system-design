const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.querySelector("#load-btn");
const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitButton = document.querySelector("#submit-btn");
const statusMessage = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");

let notes = [];

function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = type;
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status} ${response.statusText})`);
  }
  if (response.status === 204) return { data: null, status: response.status };
  const data = await response.json();
  return { data, status: response.status };
}

function renderNotes() {
  notesList.replaceChildren();

  if (notes.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No notes to display. Load notes or create one.";
    notesList.appendChild(emptyItem);
    return;
  }

  notes.forEach((note) => {
    const item = document.createElement("li");
    item.className = "note";

    const title = document.createElement("h3");
    title.textContent = note.title || "(Untitled note)";

    const body = document.createElement("p");
    body.textContent = note.body || "No body provided.";

    const id = document.createElement("small");
    id.textContent = `Note ID: ${note.id}`;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteNote(note.id, deleteButton));

    item.append(title, body, id, document.createElement("br"), deleteButton);
    notesList.appendChild(item);
  });
}

async function loadNotes() {
  loadButton.disabled = true;
  showStatus("Loading notes...", "loading");

  try {
    const result = await request(`${API_URL}?_limit=10`);
    notes = result.data;
    renderNotes();

    if (notes.length === 0) {
      showStatus("No notes were returned by the server.", "success");
    } else {
      showStatus(`Loaded ${notes.length} notes from the server.`, "success");
    }
  } catch (error) {
    showStatus(`Unable to load notes. ${error.message}`, "error");
    console.error(error);
  } finally {
    loadButton.disabled = false;
  }
}

async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    showStatus("Please enter a title.", "error");
    titleInput.focus();
    return;
  }
  if (title.length > 100) {
    showStatus("The title must be 100 characters or fewer.", "error");
    return;
  }

  submitButton.disabled = true;
  showStatus("Creating note...", "loading");

  try {
    const result = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ title, body, userId: 1 })
    });

    // JSONPlaceholder simulates creation; it does not persist the new note.
    notes.unshift(result.data);
    renderNotes();
    noteForm.reset();
    showStatus(`Note created (status ${result.status}, id ${result.data.id}).`, "success");
  } catch (error) {
    showStatus(`Unable to create note. ${error.message}`, "error");
    console.error(error);
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteNote(id, button) {
  button.disabled = true;
  showStatus("Deleting note...", "loading");

  try {
    const result = await request(`${API_URL}/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });

    // JSONPlaceholder confirms deletion but does not persist server changes.
    notes = notes.filter((note) => String(note.id) !== String(id));
    renderNotes();
    showStatus(`Note ${id} deleted (status ${result.status}).`, "success");
  } catch (error) {
    button.disabled = false;
    showStatus(`Unable to delete note. ${error.message}`, "error");
    console.error(error);
  }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);
