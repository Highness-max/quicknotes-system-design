/* ============================================================
   QuickNotes API Client
   Talks to the JSONPlaceholder practice API.
   ============================================================ */

/* ------------------------------------------------------------
   Constants
   ------------------------------------------------------------ */
const API_URL = "https://jsonplaceholder.typicode.com/posts";

/* ------------------------------------------------------------
   Element references
   ------------------------------------------------------------ */
const loadBtn = document.querySelector("#load-btn");
const statusEl = document.querySelector("#status");
const listEl = document.querySelector("#notes-list");
const form = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitBtn = document.querySelector("#submit-btn");

/* ------------------------------------------------------------
   Status helpers
   ------------------------------------------------------------ */
function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.classList.remove("success", "error");
  if (type) statusEl.classList.add(type);
}

/* ------------------------------------------------------------
   Reusable request helper
   - Calls fetch
   - Throws on network failure OR on HTTP error status
   - Returns the parsed JSON body (or null for 204 No Content)
   ------------------------------------------------------------ */
async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Server responded with status ${response.status}`);
  }

  // 204 No Content has no body.
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/* ------------------------------------------------------------
   Render one note as an <li>
   ------------------------------------------------------------ */
function renderNote(note) {
  const li = document.createElement("li");

  const title = document.createElement("h3");
  title.textContent = note.title || "(no title)";

  const body = document.createElement("p");
  body.textContent = note.body || "(no body)";

  const del = document.createElement("button");
  del.type = "button";
  del.textContent = "Delete";
  del.classList.add("delete-btn");
  del.dataset.id = note.id;

  // Event delegation on the list handles the actual click,
  // but we also attach directly for simplicity.
  del.addEventListener("click", () => deleteNote(note.id, li, del));

  li.appendChild(title);
  li.appendChild(body);
  li.appendChild(del);

  return li;
}

/* ------------------------------------------------------------
   GET — Load 10 notes
   ------------------------------------------------------------ */
async function loadNotes() {
  setStatus("Loading notes...");
  loadBtn.disabled = true;
  listEl.innerHTML = "";

  try {
    const notes = await request(`${API_URL}?_limit=10`);

    if (!Array.isArray(notes) || notes.length === 0) {
      const li = document.createElement("li");
      li.classList.add("empty-state");
      li.textContent = "No notes found on the server.";
      listEl.appendChild(li);
      setStatus("Loaded 0 notes from the server.", "success");
      return;
    }

    notes.forEach((note) => listEl.appendChild(renderNote(note)));
    setStatus(`Loaded ${notes.length} notes from the server.`, "success");
  } catch (error) {
    console.error(error);
    setStatus("Could not load notes. Please try again.", "error");
  } finally {
    loadBtn.disabled = false;
  }
}

/* ------------------------------------------------------------
   POST — Create a note
   Validation happens in the form submit handler. JSONPlaceholder
   always responds with id: 101, because it does not really save
   posts. See https://jsonplaceholder.typicode.com/guide/.
   ------------------------------------------------------------ */

/* ------------------------------------------------------------
   POST — Create a note
   ------------------------------------------------------------ */
async function createNote(title, body) {
  submitBtn.disabled = true;
  setStatus("Creating note...");

  try {
    const created = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, userId: 1 }),
    });

    // JSONPlaceholder always returns id: 101. It does NOT really save,
    // so we tag the note with a "local-" flag so we know it is ours.
    const localNote = { ...created, _local: true };
    const li = renderNote(localNote);
    listEl.prepend(li);

    setStatus(`Note created (status 201, id ${created.id}).`, "success");

    // Clear the form.
    form.reset();
    titleInput.focus();
  } catch (error) {
    console.error(error);
    setStatus("Could not create the note. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
  }
}

/* ------------------------------------------------------------
   DELETE — Remove a note
   JSONPlaceholder responds with 200 for any DELETE /posts/:id,
   but does not actually remove the resource. Our client treats
   a successful response as "the user wants this gone", so we
   remove the <li> from the DOM. If the page is refreshed, the
   server will still return the original 10 posts. This is
   expected and documented for clarity.
   ------------------------------------------------------------ */
   
/* ------------------------------------------------------------
   DELETE — Remove a note
   JSONPlaceholder does not really delete posts, so we treat the
   request as a "simulated" delete: if the server returns 200/204
   we remove the note from the UI. This is documented here so
   future readers understand why the list may look different
   after a page refresh — the server never really changed.
   ------------------------------------------------------------ */
async function deleteNote(id, li, btn) {
  btn.disabled = true;
  setStatus(`Deleting note ${id}...`);

  try {
    await request(`${API_URL}/${id}`, { method: "DELETE" });

    li.remove();
    setStatus(`Deleted note ${id}.`, "success");
  } catch (error) {
    console.error(error);
    setStatus(`Could not delete note ${id}. Please try again.`, "error");
    btn.disabled = false;
  }
}

/* ------------------------------------------------------------
   Event listeners
   ------------------------------------------------------------ */
loadBtn.addEventListener("click", loadNotes);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  // Validation: title required, max 100 characters.
  if (title === "") {
    setStatus("Please enter a title for the note.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    setStatus("Title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }

  createNote(title, body);
});