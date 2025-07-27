import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Generate correct hash for aeisenmann@lohr.de with password "BauStructura2025!e6c650b4"
async function fixAeisemannPassword() {
  const password = "BauStructura2025!e6c650b4";
  const salt = "f7b2f859e7dfd86f7fa4a2071b22c477";
  
  try {
    const buf = await scryptAsync(password, salt, 64);
    const hash = `${buf.toString("hex")}.${salt}`;
    
    console.log('Korrekter Hash für aeisenmann@lohr.de:', hash);
    return hash;
  } catch (error) {
    console.error('Fehler bei Hash-Generierung:', error);
  }
}

fixAeisemannPassword();