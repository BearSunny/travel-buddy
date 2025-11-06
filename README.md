# Travel App 

## Quick Start with Docker

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- Git

### Installation & Running

1. **Clone the repository**
```bash
git clone <repository-url>
cd travel-app
```

2. **Start the application**
```bash
docker-compose up
```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

4. **Stop the application**
```bash
docker-compose down
```

---

## Development Guide

**First Time Setup:**
```bash
# Clone repo
git clone <your-repository-url>
cd travel-app

# Build and start
docker-compose up --build
```

**Daily Development:**
```bash
# Start services
docker-compose up

# Stop services
docker-compose down
```

### Working with Dependencies

**Adding Frontend Dependencies:**
```bash
docker-compose exec client npm install <package-name>
```

**Adding Backend Dependencies:**
```bash
docker-compose exec server npm install <package-name>
```

### Viewing Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f client
docker-compose logs -f server
```

### Restarting Services

```bash
# Rebuild everything (use after package.json changes)
docker-compose up --build

# Restart a specific service
docker-compose restart client
docker-compose restart server
```

### Working with database
**If cannot run database, try**
```bash
docker-compose exec db psql -U postgres -d travelbuddy

\i /docker-entrypoint-initdb.d/init.sql
```

**Every time database is updated, remove the old database so that the new data can be built**
```
docker volume rm travel-buddy_db-data
```

**You can also remove unused volumes**
```
docker volume prune
```

**Database structure**
1. users
```
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth0_id TEXT,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    picture TEXT
);
```
2. trips
```
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    CONSTRAINT fk_trips_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
```
3. trip_collaborators
```
CREATE TABLE trip_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    user_id UUID NOL NULL,
    role collab_role NOT NULL DEFAULT 'editor',
    status collab_status NOT NULL DEFAULT 'invited',
    invited_by UUID NOLL NULL,
    CONSTRAINT fk_tc_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_tc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tc_inviter FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uc_trip_user UNIQUE (trip_id, user_id)
);
```
4. trip_events
```
CREATE TABLE trip_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    creator_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time DATE,
    end_time DATE,
    address VARCHAR(512),
    city VARCHAR(255),
    country VARCHAR(255),
    status event_status NOT NULL DEFAULT 'planned',
    CONSTRAINT fk_te_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_te_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Expected http methods:**
1. Get the database: http://localhost:5001/debug/tables
2. users methods:
- Insert new user into table users: http://localhost:5001/api/users/create
- Read row from table users with the corresponding id: http://localhost:5001/api/users/read
- Update the row in table users with the corresponding id: http://localhost:5001/api/users/update
- Delete the row in table users with the corresponding id: http://localhost:5001/api/users/delete
3. trips methods:
- Insert new user into table trips: http://localhost:5001/api/trips/create
- Read row from table trips with the corresponding id: http://localhost:5001/api/trips/read
- Update the row in table trips with the corresponding id: http://localhost:5001/api/trips/update
- Delete the row in table trips with the corresponding id: http://localhost:5001/api/trips/delete
4. trip_collaborators methods:
- Insert new user into table trip_collabortors: http://localhost:5001/api/trip_collabortors/create
- Read row from table trip_collabortors with the corresponding id: http://localhost:5001/api/trip_collabortors/read
- Update the row in table trip_collabortors with the corresponding id: http://localhost:5001/api/trip_collabortors/update
- Delete the row in table trip_collabortors with the corresponding id: http://localhost:5001/api/trip_collabortors/delete
5. trip_events methods:
- Insert new user into table trip_events: http://localhost:5001/api/trip_events/create
- Read row from table trip_events with the corresponding id: http://localhost:5001/api/trip_events/read
- Update the row in table trip_events with the corresponding id: http://localhost:5001/api/trip_events/update
- Delete the row in table trip_events with the corresponding id: http://localhost:5001/api/trip_events/delete