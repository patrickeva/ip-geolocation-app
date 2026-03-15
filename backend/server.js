require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const low     = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const app        = express();
const PORT       = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// ── Database setup (lowdb - saves to db.json file) ──
const adapter = new FileSync('db.json');
const db      = low(adapter);

db.defaults({ users: [] }).write();

// ── Middleware ──
app.use(cors({
  origin: '*',
  credentials: false,
}));
app.use(express.json());

// ── Routes ──
app.get('/', (req, res) => {
  res.json({ message: 'IP Geolocation API is running!' });
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = db.get('users').find({ email }).value();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

app.get('/api/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'No token.' });

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📋 Login endpoint: POST http://localhost:${PORT}/api/login`);
});