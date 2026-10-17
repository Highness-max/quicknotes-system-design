# QuickNotes — System Design

A capstone project for the Web Foundations course. QuickNotes is a
simple note-taking app; this repository shows both a working
**front-end API client** and the **design documents** for turning the
app into a real online service used by 1 million people.

---

## What is in this repository

- `index.html`, `api.js`, `style.css` — a small front-end client that
  talks to the JSONPlaceholder practice API. It loads notes, creates
  notes, and deletes notes.
- `docs/api-design.md` — the REST API design the backend team will
  build.
- `docs/data-model.md` — the relational database design (tables, keys,
  relationships, SQL, indexes) and a justification for choosing SQL.
- `docs/architecture.md` — the scalable architecture for 1 million
  users: requirements, estimates, diagram, component explanations,
  request flows, trade-offs and single-point-of-failure handling.

---

## How to run the API client

1. Clone or download this repository.
2. Open the folder in VS Code.
3. Right-click `index.html` and choose **Open with Live Server**.
4. The page opens in your browser. Click **Load notes** to load 10
   notes, fill in the form to create a note, or click **Delete** on
   any note to remove it.

The API client uses [JSONPlaceholder](https://jsonplaceholder.typicode.com/),
a free fake REST API. It responds to `POST` and `DELETE` correctly but
does not actually store changes, so a page refresh returns the original
10 posts. This is expected and documented in `api.js`.

---

## Documentation

- [API design](docs/api-design.md)
- [Data model](docs/data-model.md)
- [Architecture](docs/architecture.md)

---

## What I learned

- **How the browser talks to a server.** Using `fetch` with `async` /
  `await`, `try` / `catch` / `finally`, and the `response.ok` check
  showed me that HTTP errors like `404` do not throw by themselves —
  I have to check the status myself.
- **Designing an API before writing code.** Writing the endpoint table,
  the request and response examples, and the error codes in
  `docs/api-design.md` made me think about the API as a _contract_
  between the front end and the back end, not just a set of URLs.
- **Modelling data properly.** Working through the four entities
  (`users`, `notes`, `tags`, `note_tags`) taught me why many-to-many
  relationships need a join table, and why an index on the column you
  filter by most often (here `notes.user_id`) makes such a difference.
- **Designing for scale.** Estimating reads, writes and storage for 1
  million users showed me that caching and read replicas matter far
  more than raw compute, because the app is read-heavy. I also learned
  to name trade-offs out loud instead of pretending there is one
  perfect design.
