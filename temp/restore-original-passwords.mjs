// Restore original password functionality
import { createHash, scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Test original scrypt format for lea.zimmer@gmx.net with "Landau12#"
async function testScryptPassword() {
  const password = "Landau12#";
  const testSalts = [
    "e6c650b4ed3c4f3a", // Common format from previous systems
    "abc123def456", 
    "1234567890abcdef"
  ];
  
  console.log('Testing scrypt formats for password:', password);
  
  for (const salt of testSalts) {
    try {
      const buf = await scryptAsync(password, salt, 64);
      const hash = `${buf.toString("hex")}.${salt}`;
      console.log(`Salt: ${salt} => Hash: ${hash.substring(0, 50)}...`);
    } catch (error) {
      console.error(`Error with salt ${salt}:`, error.message);
    }
  }
  
  // Test with exact salt from expected format
  const salt = "e6c650b4ed3c4f3a";
  const buf = await scryptAsync(password, salt, 64);
  const storedHash = `${buf.toString("hex")}.${salt}`;
  
  console.log('\nGenerated hash for lea.zimmer@gmx.net:', storedHash);
  return storedHash;
}

testScryptPassword().catch(console.error);