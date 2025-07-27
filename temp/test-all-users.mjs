import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const testUsers = [
  { email: "lea.zimmer@gmx.net", password: "Landau12#", role: "admin", expectedProjects: 5 },
  { email: "aeisenmann@lohr.de", password: "BauStructura2025!e6c650b4", role: "manager", expectedProjects: 1 },
  { email: "firielster@googlemail.com", password: "test123", role: "manager", expectedProjects: 1 }
];

async function testUserProjects(user) {
  try {
    console.log(`\n=== Testing ${user.email} (${user.role}) ===`);
    
    // Login
    const loginCmd = `curl -X POST "http://localhost:5000/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${user.email}","password":"${user.password}"}' --cookie-jar cookies-${user.email.split('@')[0]}.txt -s`;
    const loginResult = await execAsync(loginCmd);
    
    const loginData = JSON.parse(loginResult.stdout);
    if (loginData.message === "Login successful") {
      console.log(`✅ Login erfolgreich für ${user.email}`);
    } else {
      console.log(`❌ Login fehlgeschlagen für ${user.email}: ${loginData.message}`);
      return;
    }
    
    // Get projects
    const projectsCmd = `curl -X GET "http://localhost:5000/api/projects" -b cookies-${user.email.split('@')[0]}.txt -s`;
    const projectsResult = await execAsync(projectsCmd);
    
    const projects = JSON.parse(projectsResult.stdout);
    
    if (Array.isArray(projects)) {
      console.log(`📊 ${user.email} sieht ${projects.length} Projekte (erwartet: ${user.expectedProjects})`);
      
      projects.forEach(project => {
        console.log(`   - ${project.name} (user_id: ${project.userId})`);
      });
      
      if (projects.length === user.expectedProjects) {
        console.log(`✅ Korrekte Anzahl Projekte für ${user.role}`);
      } else {
        console.log(`❌ Falsche Anzahl Projekte für ${user.role}`);
      }
    } else {
      console.log(`❌ Fehler bei Projektabfrage: ${JSON.stringify(projects)}`);
    }
    
  } catch (error) {
    console.log(`❌ Fehler bei ${user.email}: ${error.message}`);
  }
}

// Test alle Benutzer
async function testAllUsers() {
  console.log("🧪 Beginne systematischen Test aller Benutzer...");
  
  for (const user of testUsers) {
    await testUserProjects(user);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 Sekunde Pause
  }
  
  console.log("\n🏁 Test abgeschlossen!");
}

testAllUsers();