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
   - Backend API: http://localhost:5000

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