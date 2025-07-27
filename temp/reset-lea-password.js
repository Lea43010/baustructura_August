const bcrypt = require('bcryptjs');

// Neues sicheres Passwort für lea.zimmer@gmx.net
const newPassword = 'BauStructura2025!admin';

// Passwort hashen
bcrypt.hash(newPassword, 12, (err, hash) => {
  if (err) {
    console.error('Fehler beim Hashen:', err);
    return;
  }
  
  console.log('Neues Passwort:', newPassword);
  console.log('Hash für Datenbank:', hash);
});