const bcrypt   = require('bcryptjs');
const low      = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db      = low(adapter);

db.defaults({ users: [] }).write();

const users = [
  { id: 1, name: 'Admin User',     email: 'admin@example.com', password: 'password123' },
  { id: 2, name: 'Test User',      email: 'test@example.com',  password: 'test1234'    },
  { id: 3, name: 'Juan dela Cruz', email: 'juan@example.com',  password: 'juan1234'    },
];

async function seed() {
  console.log('🌱 Seeding users...\n');

  for (const user of users) {
    const exists = db.get('users').find({ email: user.email }).value();
    if (exists) {
      console.log(`⚠️  Skipped (already exists): ${user.email}`);
      continue;
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    db.get('users').push({
      id: user.id,
      name: user.name,
      email: user.email,
      password: hashedPassword,
    }).write();
    console.log(`✅ Created: ${user.email} | password: ${user.password}`);
  }

  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Login with:');
  console.log('   Email:    admin@example.com');
  console.log('   Password: password123\n');
}

seed();