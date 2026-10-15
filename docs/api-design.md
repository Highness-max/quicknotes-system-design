# QuickNotes API Design

The REST API the backend team should build for QuickNotes. All requests
and responses use JSON over HTTPS. Every endpoint (except login) requires
an `Authorization: Bearer <token>` header.

Base URL: `https://api.quicknotes.com/v1`

---

## Endpoints

| #   | Method | Path                 | Description                           | Success |
| --- | ------ | -------------------- | ------------------------------------- | ------- |
| 1   | POST   | `/auth/login`        | Log in and receive a token            | 200     |
| 2   | GET    | `/notes`             | List the logged-in user's notes       | 200     |
| 3   | GET    | `/notes/:id`         | Get a single note by id               | 200     |
| 4   | POST   | `/notes`             | Create a new note                     | 201     |
| 5   | PATCH  | `/notes/:id`         | Update some fields of a note          | 200     |
| 6   | DELETE | `/notes/:id`         | Delete a note                         | 204     |
| 7   | GET    | `/notes?search=milk` | List notes whose text contains "milk" | 200     |
| 8   | GET    | `/tags`              | List all tags the user has used       | 200     |

---

## Example: create a note

**Request**

```http
POST /v1/notes HTTP/1.1
Host: api.quicknotes.com
Content-Type: application/json
Authorization: Bearer <token>

{
  "text": "Buy milk",
  "category": "personal"
}
```
