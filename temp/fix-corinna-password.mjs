import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Generate correct hash for firielster@googlemail.com with test password
async function fixCorinnaPassword() {
  const password = "test123";
  const salt = randomBytes(16).toString('hex');
  
  try {
    const buf = await scryptAsync(password, salt, 64);
    const hash = `${buf.toString("hex")}.${salt}`;
    
    console.log('Korrekter Hash für firielster@googlemail.com:', hash);
    console.log('Salt:', salt);
    console.log('Password:', password);
    return { hash, salt, password };
  } catch (error) {
    console.error('Fehler bei Hash-Generierung:', error);
  }
}

fixCorinnaPassword();