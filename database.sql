-- 1. Authors Table
CREATE TABLE Authors (
    AuthorID INT PRIMARY KEY IDENTITY(1,1),
    AuthorName NVARCHAR(100) NOT NULL,
    Nationality NVARCHAR(50)
);

-- 2. Users Table
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(101,1),
    FullName NVARCHAR(100) NOT NULL,
    UserType NVARCHAR(20) CHECK (UserType IN ('Student', 'Faculty')),
    Email NVARCHAR(100) UNIQUE
);

-- 3. Books Table
CREATE TABLE Books (
    BookID INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(200) NOT NULL,
    AuthorID INT FOREIGN KEY REFERENCES Authors(AuthorID),
    Genre NVARCHAR(50),
    TotalCopies INT DEFAULT 5,
    AvailableCopies INT DEFAULT 5
);

-- Ab nayi fresh table banai
CREATE TABLE Transactions (
    TransactionID INT PRIMARY KEY IDENTITY(1,1),
    BookID INT FOREIGN KEY REFERENCES Books(BookID),
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    IssueDate DATE DEFAULT GETDATE(),
    DueDate DATE DEFAULT DATEADD(day, 14, GETDATE()), 
    Status NVARCHAR(20) DEFAULT 'Issued'
);