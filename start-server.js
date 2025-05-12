const { exec } = require('child_process');
const path = require('path');

console.log('Starting Cashfree Payment Server...');

// Get the current directory
const serverDir = path.join(__dirname, 'server');

// Start the server
const serverProcess = exec('npm run dev', { cwd: serverDir });

serverProcess.stdout.on('data', (data) => {
  console.log(`Server: ${data}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`Server Error: ${data}`);
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

console.log('Server startup script executed. Check for server output above.');
console.log('The server should be running at http://localhost:5003'); 