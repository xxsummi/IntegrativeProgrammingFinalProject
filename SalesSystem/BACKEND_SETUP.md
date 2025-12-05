# Backend Setup Guide

## 1. Create .env file in backend directory

Create a file named `.env` in the `/backend` directory with the following content:

```
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=sales_system

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Server Port
PORT=3000
```

## 2. Database Setup

1. Make sure MySQL is running
2. Run the schema.sql file to create the database and tables:
   ```bash
   mysql -u root -p < migrations/schema.sql
   ```

## 3. Install Dependencies

```bash
cd backend
npm install
```

## 4. Start the Backend Server

```bash
cd backend
npm start
# or
node src/server.js
```

## 5. Frontend Setup

The frontend is already configured to connect to the backend at `http://localhost:3000/api`.

## API Endpoints Available:

- `POST /api/auth/login` - Login with email and password
- `GET /api/products` - Get all products
- `GET /api/sales` - Get sales (admin only, requires auth)
- `POST /api/sales` - Create new sale (requires auth)

## Sample User Credentials:

Based on the schema, you can create a user with:
- Email: cheska@example.com
- Password: password123 (you'll need to generate the bcrypt hash)

## Frontend Integration:

The frontend now has:
- `src/services/api.js` - API service for backend communication
- `src/contexts/AuthContext.jsx` - Authentication context provider

You can now use these in your components to connect to the backend!
