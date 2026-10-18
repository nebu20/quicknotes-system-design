# QuickNotes API Design

Base URL: `/v1`

## REST Endpoints

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| POST | `/v1/auth/register` | Register a user | 201 Created |
| POST | `/v1/auth/login` | Authenticate a user | 200 OK |
| GET | `/v1/notes` | List the user's notes | 200 OK |
| GET | `/v1/notes/{id}` | Retrieve one note | 200 OK |
| POST | `/v1/notes` | Create a note | 201 Created |
| PUT | `/v1/notes/{id}` | Replace a note | 200 OK |
| PATCH | `/v1/notes/{id}` | Partially update a note | 200 OK |
| DELETE | `/v1/notes/{id}` | Delete a note | 204 No Content |
| GET | `/v1/tags` | List tags | 200 OK |
| POST | `/v1/notes/{id}/tags` | Assign tags to a note | 200 OK |

## List Notes

Request: `GET /v1/notes?limit=10&offset=0`

Example response:

```json
{
  "data": [
    {
      "id": 101,
      "title": "Meeting notes",
      "body": "Discuss project milestones",
      "createdAt": "2026-10-18T09:00:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 1
  }
}
```

## Create a Note

Request: `POST /v1/notes`

Header: `Content-Type: application/json`

Example request body:

```json
{
  "title": "Meeting notes",
  "body": "Discuss project milestones",
  "tagIds": [1, 2]
}
```

Example response — `201 Created`:

```json
{
  "id": 101,
  "title": "Meeting notes",
  "body": "Discuss project milestones",
  "tags": [
    {"id": 1, "name": "work"},
    {"id": 2, "name": "meeting"}
  ],
  "createdAt": "2026-10-18T09:00:00Z",
  "updatedAt": "2026-10-18T09:00:00Z"
}
```

## Error Responses

Example error response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The title field is required."
  }
}
```

| HTTP Status | Meaning | Example |
|---|---|---|
| 400 Bad Request | Invalid input | Missing title |
| 401 Unauthorized | Authentication required | Missing or invalid token |
| 403 Forbidden | Permission denied | User cannot access a resource |
| 404 Not Found | Resource not found | Note ID does not exist |
| 500 Internal Server Error | Unexpected server failure | Unhandled database error |

## Design Decisions

- Use nouns for resource paths and HTTP methods for actions.
- Validate all input on the server.
- Authenticate users and authorize access to each note.
- Use pagination to limit large responses.
- Return consistent errors without exposing internal stack traces.
- Require HTTPS in production.

**Implementation note:** The browser application uses JSONPlaceholder as a demonstration API. The `/v1` endpoints in this document describe a proposed production API; they are not implemented by JSONPlaceholder.
