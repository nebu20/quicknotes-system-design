# QuickNotes System Architecture

## Functional Requirements

1. Users can register and authenticate.
2. Users can create, read, update, and delete their notes.
3. Users can organize notes with tags.
4. Users can search and paginate through notes.
5. Users can access only resources they are authorized to use.

## Nonfunctional Requirements

- **Availability:** Target 99.9% monthly availability.
- **Performance:** Target p95 API latency below 300 ms under normal load.
- **Security:** HTTPS, secure password hashing, authorization, input validation, and rate limiting.
- **Scalability:** Add application servers horizontally as demand grows.
- **Durability:** Back up the database and test recovery.
- **Observability:** Centralized logs, metrics, and alerts.

These are proposed targets, not measured results.

## Capacity Estimates for One Million Users

Assumptions:
- 1,000,000 registered users.
- 10% are active daily.
- Each active user generates 20 reads and 2 writes per day.
- Each stored note averages 2 KB before indexes and replication.
- Each user creates 100 notes per year.

### Traffic

Daily active users:

1,000,000 × 10% = 100,000 users

Daily reads:

100,000 × 20 = 2,000,000 reads/day

Daily writes:

100,000 × 2 = 200,000 writes/day

Average read rate:

2,000,000 ÷ 86,400 ≈ 23 reads/second

Average write rate:

200,000 ÷ 86,400 ≈ 2.3 writes/second

### Storage

Annual notes:

1,000,000 × 100 = 100,000,000 notes

Annual raw note storage:

100,000,000 × 2 KB ≈ 200 GB/year

Actual peak traffic and storage will be higher after accounting for bursts, indexes, metadata, replicas, backups, and growth. These assumptions must be validated with measurements.

## High-Level Architecture

```text
Clients (Browser / Mobile)
          |
       DNS / HTTPS
          |
         CDN
          |
     Load Balancer
       /       \
 App Server 1  App Server 2
       \       /
     Shared Cache
          |
   Primary Database
          |
     Read Replica

 App Servers
      |
 Message Queue
      |
 Background Workers
```

## Component Responsibilities

- **Clients:** Display the user interface and send API requests.
- **DNS:** Resolves the API hostname.
- **CDN:** Caches static assets near users.
- **Load balancer:** Distributes requests across healthy application servers.
- **Application servers:** Authenticate users, enforce authorization, validate input, and implement business logic.
- **Shared cache:** Stores frequently accessed data to reduce database load.
- **Primary database:** Stores authoritative data and processes writes.
- **Read replica:** Handles eligible read traffic and reduces primary database load.
- **Message queue:** Buffers asynchronous jobs.
- **Background workers:** Process tasks such as notifications, exports, and cleanup.

## GET /v1/notes Request Flow

1. The client sends an authenticated HTTPS request.
2. DNS resolves the API hostname.
3. The load balancer routes the request to a healthy application server.
4. The server validates authentication and authorization.
5. The server checks the cache.
6. On a cache miss, it queries the database or an eligible read replica.
7. The server returns a paginated JSON response and updates the cache when appropriate.

## POST /v1/notes Request Flow

1. The client sends an authenticated HTTPS request with a JSON body.
2. The load balancer forwards it to an application server.
3. The server validates the user, permissions, title, and request body.
4. The server inserts the note into the primary database.
5. The server invalidates or updates relevant cached data.
6. The server returns `201 Created` with the created note.
7. Optional background tasks are sent to the queue.

## Tradeoffs and Reliability

### Cache vs. consistency

Caching improves performance but can return stale data. Use expiration policies and invalidate affected notes when they change. Avoid caching private data in a public CDN.

### Read replicas vs. fresh reads

Read replicas increase read capacity but may lag behind the primary database. Use the primary for operations requiring immediate consistency.

### Synchronous vs. asynchronous processing

Synchronous work provides immediate results but can increase latency. A queue is suitable for slow background tasks. Workers should support retries and idempotent processing.

### Avoiding single points of failure

- Run at least two application servers across separate failure domains.
- Use a highly available load-balancing service.
- Configure database backups and replication.
- Run redundant queue consumers.
- Monitor service health and test recovery procedures.
