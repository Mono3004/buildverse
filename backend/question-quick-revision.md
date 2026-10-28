# Heartbeat API Quick Revision (1-2 minute prep)

## Stack
- Node.js + Express
- MongoDB (Mongoose)
- Redis (cache)
- Kafka (events)
- BullMQ (queue worker)
- Socket.IO (realtime)
- JWT + bcrypt + Zod + Helmet + CORS

## API Count
- 16 business APIs under /api/v1
- + /health
- + /docs mount

## Layering
routes -> middlewares/validations -> controllers -> services -> repositories -> models

## Core Flow
Request -> global middleware -> route middleware -> controller -> service -> repository -> DB -> response

## Key Why
- Modular monolith for speed + maintainability
- Redis for performance
- Kafka for decoupled future scaling
- BullMQ for retryable async jobs
- Socket.IO for live communication

## Strong Points
- Clean startup bootstrap
- Graceful optional infra connections
- Clear route versioning

## Gaps to mention honestly
- OpenAPI partial
- Auth consistency improve karni hai
- Service/repository consistency all modules me laani hai

## 10 fast interview answers
1. Pattern? Modular monolith.
2. Versioning? /api/v1.
3. DB? MongoDB via Mongoose.
4. Cache? Redis list cache + invalidation.
5. Events? Kafka publish on course create.
6. Queue? BullMQ email worker.
7. Realtime? Socket.IO rooms.
8. Auth? JWT bearer token.
9. Validation? Zod.
10. Error handling? Central middleware + 404 middleware.
