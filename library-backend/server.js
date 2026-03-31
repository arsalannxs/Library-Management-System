const express = require('express');
const sql = require('mssql/msnodesqlv8'); 
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// YAHAN HAI ASLI JADUU: Direct Connection String
const dbConfig = {
    connectionString: 'Driver={SQL Server};Server=DESKTOP-O7MNOJA\\SQLEXPRESS;Database=LibraryDB;Trusted_Connection=yes;'
};

// Test Route
app.get('/', (req, res) => {
    res.send("Backend is running bro!");
});

// Books fetch karne ki API
app.get('/api/books', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT * FROM Books');
        res.json(result.recordset);
    } catch (err) {
        console.error("Database connection error:", err); 
        res.status(500).send("Database Error: " + err.message);
    }
});

// 1. Total Users fetch karne ki API
// Total Issued Books ka count laane ki API
app.get('/api/issued-count', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT COUNT(*) as total FROM Transactions');
        res.json(result.recordset[0].total); // Sirf number bhejega
    } catch (err) {
        res.status(500).send("Database Error: " + err.message);
    }
});

// Total Users fetch karne ki API
app.get('/api/users', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT * FROM Users');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send("Database Error: " + err.message);
    }
});

// 2. Book Issue karne ki API (Ye database mein minus karegi)
app.post('/api/issue', async (req, res) => {
    const { bookId, userId } = req.body; // Ab hume dono IDs milenge
    try {
        let pool = await sql.connect(dbConfig);
        
        // 1. Transaction shuru karo
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 2. Book count minus karo
            await transaction.request()
                .input('bid', sql.Int, bookId)
                .query('UPDATE Books SET AvailableCopies = AvailableCopies - 1 WHERE BookID = @bid AND AvailableCopies > 0');

            // 3. Transaction table mein entry daalo
            await transaction.request()
                .input('bid', sql.Int, bookId)
                .input('uid', sql.Int, userId)
                .query('INSERT INTO Transactions (BookID, UserID) VALUES (@bid, @uid)');

            await transaction.commit();
            res.json({ message: 'Transaction Successful!' });
        } catch (err) {
            await transaction.rollback(); // Agar kuch galat hua toh revert karo
            throw err;
        }
    } catch (err) {
        res.status(500).send("Database Error: " + err.message);
    }
});

// 1. Sirf 'Issued' books (Jo abhi wapas nahi aayi) laane ki API
app.get('/api/transactions', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        // JOIN query taaki Book ka naam aur User ka naam ek saath mile!
        let query = `
            SELECT t.TransactionID, t.BookID, b.Title, u.FullName, t.IssueDate, t.DueDate 
            FROM Transactions t
            JOIN Books b ON t.BookID = b.BookID
            JOIN Users u ON t.UserID = u.UserID
            WHERE t.Status = 'Issued'
        `;
        let result = await pool.request().query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send("Database Error: " + err.message);
    }
});

// 2. Book Return karne aur Fine calculate karne ki API
app.post('/api/return', async (req, res) => {
    const { transactionId, bookId } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // A. Pehle Due Date check karo Fine ke liye
            let checkData = await transaction.request()
                .input('tid', sql.Int, transactionId)
                .query("SELECT DueDate FROM Transactions WHERE TransactionID = @tid");
            
            let dueDate = new Date(checkData.recordset[0].DueDate);
            let today = new Date();
            let fine = 0;
            let message = "Book returned successfully!";

            // Agar aaj ki date Due Date se aage nikal gayi hai
            if (today > dueDate) {
                let diffTime = Math.abs(today - dueDate);
                let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                fine = diffDays * 10; // ₹10 per day late fine
                message = `Book returned! Lekin ₹${fine} ka LATE FINE laga hai.`;
            }

            // B. Transaction status ko 'Returned' kardo
            await transaction.request()
                .input('tid', sql.Int, transactionId)
                .query("UPDATE Transactions SET Status = 'Returned' WHERE TransactionID = @tid");

            // C. Book ki copies wapas badha do (+1)
            await transaction.request()
                .input('bid', sql.Int, bookId)
                .query("UPDATE Books SET AvailableCopies = AvailableCopies + 1 WHERE BookID = @bid");

            await transaction.commit();
            res.json({ message: message, fine: fine });
        } catch (err) {
            await transaction.rollback(); 
            throw err;
        }
    } catch (err) {
        res.status(500).send("Database Error: " + err.message);
    }
});

// Login API
app.post('/api/login', async (req, res) => {
    const { email } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query("SELECT UserID, FullName, UserType, Email FROM Users WHERE Email = @email");

        if (result.recordset.length > 0) {
            // User mil gaya!
            res.json({ success: true, user: result.recordset[0] });
        } else {
            // User nahi mila
            res.status(401).json({ success: false, message: "Invalid Email! (Try admin@library.com or rahul@example.com)" });
        }
    } catch (err) {
        res.status(500).send("Database Error: " + err.message);
    }
});

app.listen(5000, () => {
    console.log('Server is flying on port 5000 🚀 (Connection String Mode)');
});