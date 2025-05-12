const express = require('express');
const router = express.Router();
const https = require('https');

router.post('/verify-pan', async (req, res) => {
  const { PAN, DOB } = req.body;

  if (!PAN || !DOB) {
    return res.status(400).json({
      success: false,
      message: 'PAN and DOB are required'
    });
  }

  const options = {
    method: 'POST',
    hostname: 'pan-card-verification-at-lowest-price.p.rapidapi.com',
    path: '/verification/marketing/pan',
    headers: {
      'x-rapidapi-key': 'eb264817e8mshdb27ff451f6a4d4p15235cjsn0161b225ef85',
      'x-rapidapi-host': 'pan-card-verification-at-lowest-price.p.rapidapi.com',
      'Content-Type': 'application/json'
    }
  };

  const panReq = https.request(options, function (panRes) {
    const chunks = [];

    panRes.on('data', function (chunk) {
      chunks.push(chunk);
    });

    panRes.on('end', function () {
      try {
        const body = Buffer.concat(chunks);
        const response = JSON.parse(body.toString());
        
        // Check if PAN verification was successful
        if (response.status === 'success') {
          // Format the DOB from PAN response to match input DOB format
          const panDob = response.data.dob;
          const inputDob = new Date(DOB).toISOString().split('T')[0];
          
          // Compare DOBs
          if (panDob === inputDob) {
            res.json({
              success: true,
              message: 'PAN and DOB verification successful',
              data: response.data
            });
          } else {
            res.status(400).json({
              success: false,
              message: 'DOB does not match with PAN records'
            });
          }
        } else {
          res.status(400).json({
            success: false,
            message: 'Invalid PAN number'
          });
        }
      } catch (error) {
        console.error('Error processing PAN verification response:', error);
        res.status(500).json({
          success: false,
          message: 'Error processing verification response'
        });
      }
    });
  });

  panReq.on('error', function (error) {
    console.error('PAN verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying PAN'
    });
  });

  panReq.write(JSON.stringify({ PAN }));
  panReq.end();
});

module.exports = router; 