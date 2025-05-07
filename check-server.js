const http = require('http');

// Server URL
const SERVER_URL = 'http://localhost:5000';

// Function to check if server is running
function checkServer() {
  console.log(`Checking if server is running at ${SERVER_URL}...`);
  
  http.get(SERVER_URL, (res) => {
    const { statusCode } = res;
    
    if (statusCode === 200) {
      console.log('✅ Server is running successfully!');
      console.log(`Status code: ${statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          console.log('Server response:', JSON.stringify(parsedData, null, 2));
        } catch (e) {
          console.log('Response is not JSON. First 200 characters:');
          console.log(data.substring(0, 200) + '...');
        }
      });
    } else {
      console.error(`❌ Server responded with status code: ${statusCode}`);
    }
  }).on('error', (err) => {
    console.error('❌ Error connecting to server:', err.message);
    console.log('Make sure the server is running with: cd server && npm run dev');
  });
}

// Run the check
checkServer(); 