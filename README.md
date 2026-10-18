# QuickNotes System Design

A notes application and system-design capstone covering browser API integration, REST API design, relational data modeling, and scalable system architecture.

## Current Application

The frontend uses HTML, CSS, and JavaScript to interact with the JSONPlaceholder demonstration API.

Features:
- Load and display notes.
- Create notes using POST.
- Delete notes using DELETE.
- Display loading, success, and error messages.
- Validate note titles and handle failed requests.

**Demo limitation:** JSONPlaceholder simulates create and delete requests. Changes are not permanently saved on its server. The `/v1` API described in the documentation is a proposed production API, not a backend implemented in this repository.

## Run the Application

1. Clone or download this repository.
2. Open `index.html` in a browser, or use a local development server.
3. Click the load button to fetch demonstration notes.

An internet connection is required for JSONPlaceholder.

## Documentation

- [API Design](docs/api-design.md)
- [Data Model](docs/data-model.md)
- [System Architecture](docs/architecture.md)

## What I Learned

- Using asynchronous JavaScript and Fetch API for HTTP requests.
- Designing REST endpoints and handling HTTP status codes.
- Modeling relational data with primary keys, foreign keys, indexes, and joins.
- Understanding how caches, load balancers, read replicas, and queues support scalability.
- Estimating system capacity and evaluating architecture tradeoffs.
