const https = require('https');

https.get('https://www.fedupfoodtrucks.com/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Find all occurrences of truck.png or truck
    const lines = data.split('\n');
    lines.forEach((l, i) => {
      if (l.toLowerCase().includes('truck')) {
        console.log(`Line ${i}:`, l.trim().slice(0, 300));
      }
    });
  });
});
