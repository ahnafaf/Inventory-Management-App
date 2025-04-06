# Getting Started Guide

This guide will help you set up and run the complete Stock Management Application with its backend API, web UI, and CLI interface.

## Prerequisites

Before starting, ensure you have:

1. Node.js (v18+) installed
2. PostgreSQL database installed and running
3. Git (to clone the repository)

## Step 1: Database Setup

1. Create a PostgreSQL database for the application:

```sql
CREATE DATABASE stock_app;
```

2. Make sure your PostgreSQL server is running and accessible using the credentials specified in your `.env` file.

## Step 2: Application Setup

1. Clone the repository (if you haven't already):

```bash
git clone https://github.com/ahnafaf/Inventory-Management-App.git
cd Inventory-Management-App
```

2. Install backend dependencies:

```bash
npm install
```

3. Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

4. Configure environment variables by editing the `.env` file in the root directory:
   - Ensure database connection parameters are correct
   - Adjust other settings as needed

## Step 3: Initialize the Database

1. Run database migrations to create the tables:

```bash
npm run migrate
```

2. Seed the database with sample data:

```bash
npm run seed
```

## Step 4: Start the Application

### Option A: Development Mode (Backend and Frontend separately)

1. Start the backend API server:

```bash
npm run dev
```

2. In a separate terminal, start the frontend development server:

```bash
cd frontend
npm run dev
```

### Option B: Development Mode (Combined)

Run both the backend and frontend with one command:

```bash
npm run dev:all
```

## Step 5: Set Up the CLI

1. Link the CLI for global usage:

```bash
npm run link-cli
```

2. Test the CLI:

```bash
stock --help
```

## Access the Application

- **API**: http://localhost:3000/api
- **Web UI**: http://localhost:5173
- **CLI**: Use `stock` command in your terminal

## Sample Commands

### CLI Commands

```bash
# List all items
stock list-items

# Add a new item
stock add-item --name "New Item" --sku "ITEM001"

# Receive stock
stock receive --item-id 1 --batch-number "BATCH001" --quantity 100 --expiry-date "2025-12-31"

# List expiring stock
stock expiring --days 90
```

### API Endpoints

- `GET /api/items` - List all items
- `POST /api/items` - Create a new item
- `GET /api/stock/batches` - List all batches
- `GET /api/stock/expiring` - Get expiring batches
- `POST /api/stock/receive` - Receive new stock
- `GET /api/stock/movements` - List stock movements

## Troubleshooting

1. **Database Connection Issues**:
   - Verify PostgreSQL is running
   - Check connection parameters in `.env`
   - Ensure the database exists

2. **CLI Not Found**:
   - Run `npm run link-cli` again
   - Ensure the CLI script is executable (`chmod +x src/cli/index.js`)

3. **Frontend Connection to API**:
   - Check that the `VITE_API_URL` in `frontend/.env` points to your API server

4. **Port Conflicts**:
   - Change the `PORT` in `.env` if port 3000 is already in use
   - Change Vite port by editing `frontend/vite.config.js` if needed