# QuickNotes Architecture

A scalable design for QuickNotes at 1 million registered users.

---

## 1. Requirements

### Functional

- Users can sign up, log in and log out.
- A logged-in user can create, read, update and delete their own notes.
- Notes have a text (1–200 characters), a category and an optional set
  of tags.
- Users can search their notes by text.
- Users can read their notes from any device after logging in.

### Non-functional

- **Availability:** 99.9% ("three nines") — about 8.8 hours of downtime per year.
- **Latency:** `GET /notes` responds in under 200 ms for 95% of requests.
- **Scalability:** must handle 1 million registered users and busy-hour
  peaks without degradation.
- **Durability:** notes must never be lost; backups run nightly.
- **Security:** HTTPS only, tokens for authentication, passwords hashed.

---

## 2. Load estimate (1 million users)

Assumptions: 20% of users active per day → 200,000 DAU. Each active user
creates 5 notes per day and loads their note list 20 times per day. A
note is about 500 bytes.

- **Writes:** 200,000 × 5 = 1,000,000 writes/day ≈ **12 writes/sec average**,
  **~60 writes/sec at peak**.
- **Reads:** 200,000 × 20 = 4,000,000 reads/day ≈ **46 reads/sec average**,
  **~230 reads/sec at peak**.
- **Storage:** 1,000,000 × 500 bytes = 500 MB/day ≈ **180 GB per year**.

The system is **read-heavy** (about 4× more reads than writes), so the
biggest win is caching reads and adding read replicas.

---

## 3. Architecture diagram (text)

```text
        ┌──────────────┐
        │    DNS       │
        └──────┬───────┘
               │
   ┌───────────┴────────────┐
   │                        │
static files            API calls (HTTPS/JSON)
   │                        │
   ▼                        ▼
┌────────┐          ┌────────────────┐
│  CDN   │          │ LOAD BALANCER  │
└────────┘          └───────┬────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        ┌─────────┐   ┌─────────┐   ┌─────────┐
        │App srv 1│   │App srv 2│   │App srv 3│
        └────┬────┘   └────┬────┘   └────┬────┘
             │             │             │
             └──────┬──────┴──────┬──────┘
                    │             │
                    ▼             ▼
              ┌─────────┐   ┌──────────────┐
              │  CACHE  │   │  PRIMARY DB  │
              │ (Redis) │   │              │
              └────┬────┘   └──────┬───────┘
                   │               │ copy
                   │               ▼
                   │        ┌──────────────┐
                   │        │ READ REPLICA │
                   │        └──────┬───────┘
                   │               │
                   │               │  (reads)
                   └───────────────┘

   App servers also ──▶ ┌─────────┐ ──▶ ┌──────────┐
                       │  QUEUE  │     │  WORKER  │
                       └─────────┘     └──────────┘
                       (email jobs, exports, etc.)
```
