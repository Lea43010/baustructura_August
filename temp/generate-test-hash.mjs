import bcrypt from 'bcryptjs';

const password = 'BauStructura2025!admin';

try {
  const hash = await bcrypt.hash(password, 12);
  console.log('Passwort:', password);
  console.log('Hash:', hash);
  
  // Test the hash
  const isValid = await bcrypt.compare(password, hash);
  console.log('Verifikation erfolgreich:', isValid);
} catch (error) {
  console.error('Fehler:', error);
}