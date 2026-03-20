### 🐘 Create PostgreSQL DB
```bash
docker compose -f ./docker-compose.postgres.yml up -d
```
### Check DB
```bash
SET PGPASSWORD=123
psql -U postgres -d sample-app-mdl
psql -U postgres
#\l
```
### Delete
```bash
# container
docker stop sample-app-postgres
docker rm sample-app-postgres

# volume
docker rm -v sample-app-postgres
docker volume prune

# image
docker ps -a --filter "name=sample-app-postgres" --format "{{.Image}}"
docker images -a

#docker rmi REPOSITORY:TAG
docker rmi postgres:15

```

### Python DB
```bash
# Drop and re-Create schema manualy first
cd api
SET ENVIRONMENT=dev
npx tsx src/Scripts/Migrations/seed_db.ts -co

nd-db -co -e dev
psql -h localhost -U postgres -d sample-app-mdl
```
## Test Connection
```bash
SET PGPASSWORD=123
psql -U postgres
psql -U postgres -d sample-app
```
### With Schema (downloader) 
```sql
SET search_path TO downloader;
SHOW search_path;
```

```sql
\dt
\q
```

```sql
\c mediadl
```
