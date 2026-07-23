# Backend Requirements

The service helps students explore occupations, skills, qualifications, majors, roadmaps, and source-based AI answers using public and school data.

Implemented backend scope:

- School-domain-restricted sign-up (no email verification step, per hackathon time constraints), sign-in, sign-out, authenticated user lookup, password change, and soft account deletion. Single long-lived access token, no refresh token rotation.
- User profile, activity list, and basic stats.
- School and catalog metadata lists with search and pagination.
- Occupation list, detail, suggestions, and 2-4 occupation comparison.
- Interest occupation save/list/delete with idempotent save/delete behavior.
- Dashboard aggregation.
- Roadmap creation model and API. If AI generation is not configured, the created roadmap is marked `FAILED` and no fake official content is generated.
- Conversation and message APIs. If AI generation is not configured, user and failed assistant messages are saved and no fake citations are generated.
- Source, source document, chunk, and citation data structures.

Not implemented:

- Admin features.
- Redis, Kafka, Elasticsearch, SSE, WebSocket, Kubernetes, AWS, EC2 deployment, or CD workflow.
- Real public data ingestion.
- Real AI provider contract.
