import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Book, Database, RefreshCw, Users, CheckCircle, X, BookOpen, Search, RotateCcw, LogOut, Lock } from 'lucide-react';

function App() {
  // --- LOGIN STATES ---
  const [currentUser, setCurrentUser] = useState(null); // Agar null hai, matlab login screen dikhao
  const [loginEmail, setLoginEmail] = useState('');

  // --- APP STATES ---
  const [books, setBooks] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [issuedCount, setIssuedCount] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');

  // --- LOGIN FUNCTION ---
  const handleLogin = (e) => {
    e.preventDefault();
    if(!loginEmail) return alert("Please enter an email!");
    
    axios.post('http://localhost:5000/api/login', { email: loginEmail })
      .then(res => {
        setCurrentUser(res.data.user); // User data save kar liya
      })
      .catch(err => alert(err.response?.data?.message || "Login Failed!"));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginEmail('');
  };

  // --- DATA FETCHING (Sirf tab chalega jab login ho jaye) ---
  const fetchData = () => {
    if (!currentUser) return;
    setLoading(true);
    axios.get('http://localhost:5000/api/books').then(res => setBooks(res.data)).catch(err => console.error(err));
    
    // Sirf Admin ko ye data chahiye
    if (currentUser.UserType === 'Admin') {
      axios.get('http://localhost:5000/api/users').then(res => setUsersList(res.data)).catch(err => console.error(err));
      axios.get('http://localhost:5000/api/issued-count').then(res => setIssuedCount(res.data)).catch(err => console.error(err));
      axios.get('http://localhost:5000/api/transactions').then(res => { setTransactions(res.data); setLoading(false); }).catch(err => console.error(err));
    } else {
      setLoading(false); // Student ke liye sirf books aayengi
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]); // Jab user login karega, tab data aayega

  const openModal = (book) => { setSelectedBook(book); setSelectedUserId(''); setIsModalOpen(true); };

  const confirmIssue = () => {
    if (!selectedUserId) return alert("Bhai, pehle dropdown se ek User toh select kar!");
    axios.post('http://localhost:5000/api/issue', { bookId: selectedBook.BookID, userId: selectedUserId })
    .then(res => { alert("Transaction Successful!"); setIsModalOpen(false); fetchData(); })
    .catch(err => alert("Error: " + (err.response?.data?.message || err.message)));
  };

  const handleReturn = (transactionId, bookId) => {
    if(window.confirm("Are you sure you want to return this book?")) {
      axios.post('http://localhost:5000/api/return', { transactionId, bookId })
      .then(res => { alert(res.data.message); fetchData(); })
      .catch(err => console.error(err));
    }
  };

  // ==========================================
  // 1. LOGIN SCREEN (Agar user null hai)
  // ==========================================
  if (!currentUser) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', width: '350px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ background: '#eff6ff', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <Lock size={30} color="#2563eb" />
          </div>
          <h2 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Library Portal</h2>
          <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '14px' }}>Login with your email</p>
          
          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              placeholder="e.g. admin@library.com" 
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px', fontSize: '16px' }}
            />
            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              Login Securely
            </button>
          </form>
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#94a3b8' }}>
            Hint: admin@library.com OR rahul@example.com
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. MAIN DASHBOARD (Agar user login ho gaya)
  // ==========================================
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh', position: 'relative' }}>
      
      {/* HEADER WITH LOGOUT */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: '#fff', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Database size={35} color="#2563eb" />
          <h1 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>Library Management 4.0</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#1e293b' }}>{currentUser.FullName}</p>
            <span style={{ fontSize: '12px', background: currentUser.UserType === 'Admin' ? '#fee2e2' : '#dcfce7', color: currentUser.UserType === 'Admin' ? '#991b1b' : '#166534', padding: '2px 8px', borderRadius: '12px' }}>
              {currentUser.UserType} Role
            </span>
          </div>
          <button onClick={handleLogout} style={{ background: '#f87171', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* ADMIN ONLY: Stats Section */}
      {currentUser.UserType === 'Admin' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '5px solid #2563eb' }}>
            <Book size={20} color="#2563eb" />
            <h3 style={{ margin: '10px 0 5px 0', color: '#64748b' }}>Total Books</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{books.length}</p>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '5px solid #10b981' }}>
            <Users size={20} color="#10b981" />
            <h3 style={{ margin: '10px 0 5px 0', color: '#64748b' }}>Total Users</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{usersList.length}</p>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '5px solid #f59e0b' }}>
            <BookOpen size={20} color="#f59e0b" />
            <h3 style={{ margin: '10px 0 5px 0', color: '#64748b' }}>Books Issued</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{issuedCount}</p>
          </div>
          <button onClick={fetchData} style={{ cursor: 'pointer', border: 'none', background: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <RefreshCw size={20} /> Refresh
          </button>
        </div>
      )}

      {/* COMMON: Books Catalog */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 10px 15px rgba(0,0,0,0.05)', overflow: 'hidden', padding: '20px', marginBottom: '40px' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>Library Catalog</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', background: '#f1f5f9', padding: '12px 15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <Search size={20} color="#64748b" />
          <input 
            type="text" placeholder="Search books by title or genre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '16px', flex: 1, cursor: 'text' }}
          />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '15px' }}>Title</th>
              <th style={{ padding: '15px' }}>Genre</th>
              <th style={{ padding: '15px' }}>Status</th>
              {currentUser.UserType === 'Admin' && <th style={{ padding: '15px', textAlign: 'center' }}>Action</th>}
            </tr>
          </thead>
          <tbody>
            {books.filter(b => b.Title.toLowerCase().includes(searchTerm.toLowerCase()) || (b.Genre && b.Genre.toLowerCase().includes(searchTerm.toLowerCase()))).map(book => (
              <tr key={book.BookID} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px', fontWeight: '600' }}>{book.Title}</td>
                <td style={{ padding: '15px', color: '#64748b' }}>{book.Genre || 'N/A'}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', backgroundColor: book.AvailableCopies > 0 ? '#dcfce7' : '#fee2e2', color: book.AvailableCopies > 0 ? '#166534' : '#991b1b' }}>
                    {book.AvailableCopies > 0 ? `${book.AvailableCopies} left` : 'Out of Stock'}
                  </span>
                </td>
                {/* Sirf Admin ko Issue Button dikhega */}
                {currentUser.UserType === 'Admin' && (
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <button onClick={() => openModal(book)} disabled={book.AvailableCopies <= 0} style={{ padding: '8px 15px', backgroundColor: book.AvailableCopies > 0 ? '#2563eb' : '#94a3b8', color: 'white', border: 'none', borderRadius: '5px', cursor: book.AvailableCopies > 0 ? 'pointer' : 'not-allowed', margin: '0 auto' }}>
                      Issue Book
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADMIN ONLY: Active Transactions */}
      {currentUser.UserType === 'Admin' && (
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 10px 15px rgba(0,0,0,0.05)', overflow: 'hidden', padding: '20px' }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>Active Issued Books</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '15px' }}>Book Title</th>
                <th style={{ padding: '15px' }}>Issued To</th>
                <th style={{ padding: '15px' }}>Due Date</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map(t => (
                  <tr key={t.TransactionID} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px', fontWeight: '600' }}>{t.Title}</td>
                    <td style={{ padding: '15px' }}>{t.FullName}</td>
                    <td style={{ padding: '15px', color: '#ef4444' }}>{new Date(t.DueDate).toLocaleDateString()}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button onClick={() => handleReturn(t.TransactionID, t.BookID)} style={{ padding: '8px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', margin: '0 auto' }}>
                        <RotateCcw size={16} /> Return
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No books are currently issued. All clear!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ADMIN ONLY: Issue Modal */}
      {isModalOpen && currentUser.UserType === 'Admin' && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>Issue Book</h2>
              <X size={24} style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '0 0 5px 0', color: '#64748b' }}>Selected Book:</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{selectedBook?.Title}</p>
            </div>
            <div style={{ marginBottom: '30px' }}>
              <p style={{ margin: '0 0 5px 0', color: '#64748b' }}>Select User:</p>
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '16px' }}>
                <option value="">-- Choose a User --</option>
                {usersList.filter(u => u.UserType !== 'Admin').map(user => <option key={user.UserID} value={user.UserID}>{user.FullName}</option>)}
              </select>
            </div>
            <button onClick={confirmIssue} style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              Confirm Transaction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;