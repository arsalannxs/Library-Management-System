# 📚 Library Management System 4.0 (Enterprise Edition)

A robust, full-stack Relational Database Management application designed to streamline library operations. This system features Role-Based Access Control (RBAC), real-time inventory tracking, and an automated transaction engine with late fine calculations.

## 🚀 Key Features

* **Role-Based Access Control (RBAC):** * **Admin Portal:** Full access to dashboard analytics, inventory management, user tracking, and manual transaction overrides.
  * **Student Portal:** Clean, restricted interface to browse the catalog and check book availability.
* **Automated Transaction Engine:** Handles complex SQL transactions ensuring data integrity when issuing or returning books.
* **Smart Fine Calculation:** Automatically computes late return fines (₹10/day) based on dynamic due-date comparisons.
* **Live Catalog Search:** Instantaneous, zero-reload filtering of the library catalog by Title or Genre using React state management.
* **Real-time Analytics Dashboard:** Visual metrics tracking Total Books, Registered Users, and Active Transactions.

## 💻 Tech Stack

* **Frontend:** React.js, Lucide-React (Icons), Context/State Management
* **Backend:** Node.js, Express.js
* **Database:** Microsoft SQL Server (MSSQL)
* **API Communication:** Axios (RESTful Architecture)

## 🗄️ Database Schema highlights

The relational integrity is maintained across three core tables:
1. `Books`: Tracks BookID, Title, Genre, and AvailableCopies.
2. `Users`: Manages UserID, FullName, Email, and UserType (Admin/Student).
3. `Transactions`: Links Books and Users, tracking IssueDate, DueDate, and Status ('Issued'/'Returned').

## 🛠️ Installation & Setup

Follow these steps to run the application locally on your machine.

### Prerequisites
* Node.js installed
* Microsoft SQL Server & SSMS installed

### 1. Database Configuration
1. Open SSMS and create a new database named `LibraryDB`.
2. Execute the provided SQL scripts to create the `Books`, `Users`, and `Transactions` tables.
3. Insert an initial Admin user to

The server will run on http://localhost:5000

3. Frontend Setup
Bash
# Navigate to the frontend directory
cd library-frontend

# Install dependencies
npm install axios lucide-react

# Start the React development server
npm run dev
The application will open on http://localhost:5173

🔐 Default Credentials (Testing)
Admin Login: admin@library.com

Student Login: Use any registered student email from the database.

👨‍💻 Author
Arsalan - Computer Engineering Student & Full-Stack Developer
