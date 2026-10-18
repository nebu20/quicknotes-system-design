# QuickNotes Data Model

## Entities and Relationships

- **Users:** One user can own many notes and tags.
- **Notes:** Each note belongs to one user.
- **Tags:** Each tag belongs to one user.
- **Note_Tags:** Junction table supporting a many-to-many relationship between notes and tags.

## Relational Schema

### Users

| Column | Type | Constraint |
|---|---|---|
| id | BIGINT | Primary key |
| name | VARCHAR(100) | Not null |
| email | VARCHAR(255) | Unique, not null |
| password_hash | VARCHAR(255) | Not null |
| created_at | TIMESTAMP | Not null |

### Notes

| Column | Type | Constraint |
|---|---|---|
| id | BIGINT | Primary key |
| user_id | BIGINT | Foreign key to users |
| title | VARCHAR(100) | Not null |
| body | TEXT | Nullable |
| created_at | TIMESTAMP | Not null |
| updated_at | TIMESTAMP | Not null |

### Tags

| Column | Type | Constraint |
|---|---|---|
| id | BIGINT | Primary key |
| user_id | BIGINT | Foreign key to users |
| name | VARCHAR(50) | Not null |

### Note_Tags

| Column | Type | Constraint |
|---|---|---|
| note_id | BIGINT | Foreign key to notes |
| tag_id | BIGINT | Foreign key to tags |

The composite primary key is `(note_id, tag_id)`.

## SQL Table Definitions

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
    note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
```

## Example SQL Queries

### 1. List a user's notes

```sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 1
ORDER BY updated_at DESC
LIMIT 20;
```

### 2. Retrieve a note with its owner

```sql
SELECT n.id, n.title, n.body, u.name AS owner
FROM notes n
JOIN users u ON u.id = n.user_id
WHERE n.id = 101 AND n.user_id = 1;
```

### 3. List tags assigned to a note

```sql
SELECT t.id, t.name
FROM tags t
JOIN note_tags nt ON nt.tag_id = t.id
WHERE nt.note_id = 101;
```

## Indexing Strategy

```sql
CREATE INDEX idx_notes_user_updated
ON notes(user_id, updated_at DESC);

CREATE INDEX idx_note_tags_tag
ON note_tags(tag_id);
```

The first index helps retrieve a user's notes in update order. The second helps find notes associated with a tag.

## SQL vs. NoSQL

A relational database such as PostgreSQL is the preferred starting point because QuickNotes has clear relationships, ownership rules, foreign keys, and many-to-many tag assignments. Transactions and constraints help maintain consistency. A document database could also work, but duplicated user or tag data can make updates harder. The final choice should be validated against actual workload requirements.
