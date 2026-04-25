require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const fs       = require('fs');
const path     = require('path');

const app        = express();
const PORT       = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

function getUsers() {
  const dbPath = path.join(__dirname, 'db.json');
  const raw    = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(raw).users;
}

app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const users = getUsers();
    const user  = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
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
      user: { id: user.id, name: user.name, email: user.email },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// Serve React frontend build
const frontendBuild = path.join(__dirname, '../frontend/build');
app.use(express.static(frontendBuild));

// React Router catch-all — must be last
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuild, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

module.exports = app;
