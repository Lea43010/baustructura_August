import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Generate correct hash for test users
async function generatePasswordHash(password) {
  const salt = randomBytes(16).toString('hex');
  
  try {
    const buf = await scryptAsync(password, salt, 64);
    const hash = `${buf.toString("hex")}.${salt}`;
    
    return { hash, salt, password };
  } catch (error) {
    console.error('Fehler bei Hash-Generierung:', error);
  }
}

async function fixAllPasswords() {
  console.log('Generiere Passwort-Hashes für Test-Users...');
  
  const users = [
    { email: 'zimmernrw@gmail.com', password: 'test123' },
    { email: 'test@example.com', password: 'test123' },
    { email: 'admin@test.de', password: 'admin123' }
  ];
  
  for (const user of users) {
    const result = await generatePasswordHash(user.password);
    console.log(`${user.email}: ${user.password} -> ${result.hash}`);
  }
}

fixAllPasswords();