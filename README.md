# Sales Management System

A premium Sales and Account Management system built with React, PHP, and MySQL.

## Features
- **Dashboard**: Real-time stats with AI-powered sales prediction.
- **Client Management**: Full CRM for client data, contact info, and bill records.
- **Bill Management**: Track direct sales and bills from external stores with image attachment support.
- **Bank Management**: Maintain multiple bank accounts, track deposits/withdrawals, and view statements.
- **Financial Reports**: Overview of pending payments, recovery rates, and debtor lists.
- **Modern UI**: Glassmorphic design, smooth animations, and responsive layout.

## Tech Stack
- **Frontend**: React (Vite), Lucide Icons, Recharts, Axios.
- **Backend**: PHP (PDO), MySQL.
- **Styling**: Vanilla CSS with modern design tokens.

## Setup Instructions

### 1. Database Setup
- Open PHPMyAdmin or any MySQL client.
- Create a database named `sales_manage`.
- Import the SQL schema from `database/schema.sql`.

### 2. Backend Setup
- Ensure the project is in your XAMPP `htdocs` folder (`e:/xampp/htdocs/sales_manage`).
- The backend API is located in the `backend/` directory.
- Database configuration can be found in `backend/config/db.php`.

### 3. Frontend Setup
- Navigate to the `frontend/` directory.
- Install dependencies:
  ```bash
  npm install
  ```
- Start the development server:
  ```bash
  npm run dev
  ```

## Important Note
The backend is set to run on `http://localhost/sales_manage/backend/api/`. Ensure your local Apache server is running.

---
Built with ❤️ by Antigravity
