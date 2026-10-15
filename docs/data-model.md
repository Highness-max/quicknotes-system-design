# QuickNotes Data Model

The relational schema for QuickNotes, designed for a **SQL** database
(PostgreSQL or SQLite).

---

## Entities

### `users`

| Column          | Type    | Notes                                            |
| --------------- | ------- | ------------------------------------------------ |
| `id`            | INTEGER | Primary key, auto-numbered                       |
| `name`          | TEXT    | `NOT NULL`                                       |
| `email`         | TEXT    | `NOT NULL`, `UNIQUE`                             |
| `password_hash` | TEXT    | `NOT NULL` — never store passwords in plain text |
| `created_at`    | TEXT    | Defaults to current timestamp                    |

### `notes`

| Column       | Type    | Notes                                     |
| ------------ | ------- | ----------------------------------------- |
| `id`         | INTEGER | Primary key                               |
| `user_id`    | INTEGER | Foreign key → `users(id)`, `NOT NULL`     |
| `text`       | TEXT    | `NOT NULL`, `CHECK (length(text) <= 200)` |
| `category`   | TEXT    | `NOT NULL`, default `'personal'`          |
| `created_at` | TEXT    | Defaults to current timestamp             |

### `tags`

| Column | Type    | Notes                |
| ------ | ------- | -------------------- |
| `id`   | INTEGER | Primary key          |
| `name` | TEXT    | `NOT NULL`, `UNIQUE` |

### `note_tags`

| Column    | Type    | Notes                                           |
| --------- | ------- | ----------------------------------------------- |
| `note_id` | INTEGER | Foreign key → `notes(id)`, part of composite PK |
| `tag_id`  | INTEGER | Foreign key → `tags(id)`, part of composite PK  |

---

## Relationships

- **`users` → `notes`** is **one-to-many**. One user has many notes;
  each note belongs to exactly one user. The foreign key `notes.user_id`
  points to `users.id`.
- **`notes` ↔ `tags`** is **many-to-many**. A note can have many tags
  and a tag can be on many notes. Because SQL cannot store lists in a
  single column, we use the **join table** `note_tags`, which stores one
  row per (note, tag) pair.
- `note_tags` has a **composite primary key** `(note_id, tag_id)` so the
  same tag cannot be attached to the same note twice.

---

## CREATE TABLE statements

```sql
CREATE TABLE users (
  id            INTEGER PRIMARY KEY,
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  created_at    TEXT    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
  id         INTEGER PRIMARY KEY,
  user_id    INTEGER NOT NULL,
  text       TEXT    NOT NULL CHECK (length(text) <= 200),
  category   TEXT    NOT NULL DEFAULT 'personal',
  created_at TEXT    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
  id   INTEGER PRIMARY KEY,
  name TEXT    NOT NULL UNIQUE
);

CREATE TABLE note_tags (
  note_id INTEGER NOT NULL,
  tag_id  INTEGER NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
);
```
