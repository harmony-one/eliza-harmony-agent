# Postgres with pgvector Setup for Eliza Agent

Documentation of Postgres deployment with pgvector extension for the Eliza Harmony Agent project.

## Build and Deploy

Build and push the custom Postgres image with pgvector:
```bash
docker build -t <your-dockerhub-username>/fly-pg-pgvector16 .
docker push <your-dockerhub-username>/fly-pg-pgvector16
```

Create Postgres instance on Fly.io:
```bash
fly postgres create --name eliza-agent-postgres --image-ref <your-dockerhub-username>/fly-pg-pgvector16 
```

Attach Postgres to the Eliza agent app:
```bash
fly postgres attach --app eliza-harmony-agent eliza-agent-postgres
```

## Database Setup and Verification

Connect to the Postgres instance:
```bash
fly postgres connect -a eliza-agent-postgres
```

Create application database:
```sql
\c eliza-agent-postgres
CREATE EXTENSION vector;
```

Verify the vector extension:
```sql
-- Check extension in current database
\dx vector

-- Alternative verification query
SELECT * FROM pg_extension where extname = 'vector';
```

Expected output should show vector extension version 0.8.0.

## Connection Details

The database connection string will be automatically added to your app's secrets in the format:
```
postgres://eliza_harmony_agent:[password]@eliza-agent-postgres.flycast:5432/eliza_harmony_agent?sslmode=disable
```

View connection details:
```bash
fly postgres list
```

## Additional Notes

- Using Postgres 16 with pgvector 0.8.0
- Connection credentials are managed by Fly.io