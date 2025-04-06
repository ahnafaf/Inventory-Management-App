# Stock Management Application

A comprehensive inventory control system for tracking items, stock batches, and movement operations with expiry date management.

## Quick Start Guide

Follow these steps to quickly test the application:

### Prerequisites

- Node.js v18 or higher
- PostgreSQL 13 or higher
- npm or yarn package manager

### 1. Clone the Repository

```bash
git clone https://github.com/ahnafaf/Inventory-Management-App.git
cd Inventory-Management-App
```

### 2. Setup and Run

#### Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE stock_app;
```

#### Backend Setup

1. Install dependencies and run migrations:

```bash
# Install backend dependencies
npm install

# Run database migrations and seed data
npm run migrate
npm run seed

# Start the server
npm start
```

The API server will be available at: http://localhost:3000

#### Frontend Setup

1. In a new terminal, navigate to the frontend directory and start the development server:

```bash
cd frontend
npm install
npm run dev
```

The web UI will be available at: http://localhost:5173

#### CLI Setup

1. In a new terminal, link the CLI globally:

```bash
# From the project root
npm run link-cli
```

2. Now you can use the CLI:

```bash
# Get help
stock --help

# List items
stock list-items

# Add an item
stock add-item --name "Test Item" --sku "TEST001" --desc "Test description"

# Receive stock
stock receive --item-id 1 --batch-number "BATCH001" --quantity 100 --expiry-date "2026-01-01"
```

## Testing the Application

### Web Interface

1. Open http://localhost:5173 in your browser
2. Use the navigation menu to access different sections:
   - **Items**: View and manage inventory items
   - **Batches**: View all stock batches
   - **Receive Stock**: Add new inventory
   - **Issue Stock**: Remove stock for use
   - **Movements**: Track inventory changes
   - **Expiring Stock**: Monitor soon-to-expire items

### CLI Testing

Try these commands to test the CLI functionality:

```bash
# Add a new item
stock add-item --name "Paracetamol" --sku "MED001" --desc "Pain relief medication"

# Receive stock for the item (note the item-id from the previous command)
stock receive --item-id 1 --batch-number "BATCH001" --quantity 100 --expiry-date "2026-04-06"

# List all batches
stock list-batches

# Issue some stock
stock issue --batch-id 1 --quantity 10 --reference "Hospital Order #123"

# Check movements
stock list-movements

# Check expiring batches (within next 365 days)
stock expiring --days 365
```

## Features

- **Item Management**: Create, update, and manage items in your inventory
- **Batch Tracking**: Track stock by batch number with expiry dates
- **Stock Receiving**: Record new stock with batch details and expiry information
- **Expiry Management**: Easily identify and manage stock nearing expiration
- **Stock Movements**: Record all inventory transactions:
  - Receiving new stock
  - Issuing stock for orders or production
  - Adjusting quantities (e.g., after stocktake)
  - Writing off expired or damaged stock
- **Reporting & Analytics**: 
  - Current stock levels by item and batch
  - Movement history with filtering options
  - Expiring stock reports
  - Movement summaries by day, week, or month
- **Multiple Interfaces**: Access through:
  - Modern web UI built with React
  - RESTful API for system integration
  - CLI tool for quick operations and automation

## System Architecture

The application follows a three-tier architecture:

1. **Database Layer**: PostgreSQL database stores all inventory data
2. **Backend Layer**: Node.js API built with Express provides business logic and data access
3. **Frontend Layer**: React-based web UI and CLI provide user interfaces

## Database Schema

The system uses three main tables:

### items
- `id`: Primary key
- `name`: Item name
- `sku`: Stock keeping unit (unique)
- `description`: Item description
- `active`: Whether the item is active
- `created_at`/`updated_at`: Timestamps

### stock_batches
- `id`: Primary key
- `item_id`: Foreign key to items
- `batch_number`: Batch identifier 
- `expiry_date`: When the batch expires
- `initial_quantity`: Original received quantity
- `current_quantity`: Current available quantity
- `created_at`/`updated_at`: Timestamps

### stock_movements
- `id`: Primary key
- `batch_id`: Foreign key to stock_batches
- `movement_type`: Type of movement (receive, issue, adjust, write_off)
- `quantity`: Amount moved (positive or negative)
- `reference`: External reference (e.g., order number)
- `notes`: Additional information
- `created_at`/`updated_at`: Timestamps

## Project Structure

```
/
├── frontend/                  # React frontend application
│   ├── public/                # Static assets
│   ├── src/                   # Source code
│   │   ├── assets/            # Images and other assets
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Application pages
│   │   └── services/          # API client services
│   └── package.json           # Frontend dependencies
│
├── src/                       # Backend application
│   ├── api/                   # API endpoints
│   │   └── routes/            # Route handlers
│   ├── cli/                   # Command-line interface
│   ├── config/                # Configuration files
│   ├── db/                    # Database related files
│   │   ├── migrations/        # Database schema migrations
│   │   ├── models/            # Data models
│   │   └── seeds/             # Seed data
│   └── services/              # Business logic services
│
├── package.json               # Backend dependencies
├── knexfile.js                # Database configuration
└── index.js                   # Application entry point
```

## Requirements

- Node.js v18 or higher
- PostgreSQL 13 or higher
- npm or yarn package manager

## Installation

### Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE stock_app;
CREATE USER stock_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE stock_app TO stock_user;
```

2. Configure database connection in `.env` file:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stock_app
DB_USER=stock_user
DB_PASSWORD=your_password
```

### Backend Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/stock_app.git
   cd stock_app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables by creating a `.env` file:
   ```
   NODE_ENV=development
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=stock_app
   DB_USER=stock_user
   DB_PASSWORD=your_password
   ```

4. Run database migrations:
   ```
   npm run migrate
   ```

5. Seed initial data (optional):
   ```
   npm run seed
   ```

6. Start the server:
   ```
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure API endpoint in `.env`:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

4. Start development server:
   ```
   npm run dev
   ```

5. For production build:
   ```
   npm run build
   ```

### CLI Setup

1. From the project root, link the CLI globally:
   ```
   npm run link-cli
   ```

2. Now you can use the CLI with the `stock` command:
   ```
   stock --help
   ```

## Usage

### Web Interface

Access the web interface at `http://localhost:5173` (development) or your configured production URL.

The UI provides access to:

- **Items Page**: Manage inventory items
- **Batches Page**: View all stock batches
- **Receive Stock**: Record new inventory receipts
- **Issue Stock**: Record stock issues
- **Movements Page**: View movement history 
- **Expiring Stock**: View batches nearing expiration

### CLI Commands

The CLI provides commands for all stock management operations:

```bash
# Get help
stock --help

# Item Management
stock list-items [--active] [--search <text>]
stock add-item --name "Item Name" --sku "SKU123" [--desc "Description"]
stock update-item --id 1 --name "New Name" [--sku "NEWSKU"] [--desc "New description"] [--active true|false]

# Stock Operations
stock list-batches [--item-id <id>] [--has-stock] [--expiring-within <days>]
stock receive --item-id <id> --batch-number "BATCH001" --quantity <qty> [--expiry-date "YYYY-MM-DD"]
stock issue --batch-id <id> --quantity <qty> [--reference "Order #123"] [--notes "Notes"]
stock adjust --batch-id <id> --quantity <qty> [--reference "Reason"] [--notes "Notes"]
stock write-off --batch-id <id> --quantity <qty> [--reference "Reason"] [--notes "Notes"]

# Reports
stock expiring --days <days>
stock list-movements [--item-id <id>] [--batch-id <id>] [--type <movement_type>] [--start-date "YYYY-MM-DD"] [--end-date "YYYY-MM-DD"] [--reference <text>]
stock summary --period <day|week|month> [--start-date "YYYY-MM-DD"] [--end-date "YYYY-MM-DD"]
```

### API Endpoints

The backend exposes a RESTful API:

#### Items

- `GET /api/items` - List items (query params: active, search, limit, offset)
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Deactivate item

#### Stock Batches

- `GET /api/stock/batches` - List batches (query params: itemId, hasStock, expiringWithin, limit, offset)
- `GET /api/stock/batches/:id` - Get batch by ID
- `GET /api/stock/batches/expiring/:days` - Get batches expiring within days

#### Stock Movements

- `GET /api/stock/movements` - List movements (query params: itemId, batchId, type, startDate, endDate, reference)
- `GET /api/stock/movements/:id` - Get movement by ID
- `GET /api/stock/movements/summary/:period` - Get movement summary by period

#### Stock Operations

- `POST /api/stock/receive` - Receive new stock
- `POST /api/stock/issue` - Issue stock
- `POST /api/stock/adjust` - Adjust stock
- `POST /api/stock/write-off` - Write off stock

## Development

### Running in Development Mode

- Run backend in development mode with auto-restart:
  ```
  npm run dev
  ```

- Run frontend in development mode:
  ```
  cd frontend
  npm run dev
  ```

### Database Migrations

- Create a new migration:
  ```
  npm run migrate:make migration_name
  ```

- Apply pending migrations:
  ```
  npm run migrate
  ```

- Roll back the latest migration:
  ```
  npm run migrate:rollback
  ```

### Seeding Data

- Run seed files to populate development data:
  ```
  npm run seed
  ```

- Create a new seed file:
  ```
  npm run seed:make seed_name
  ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
