const https = require('https');
const fs = require('fs');
const path = require('path');

const url = "https://cdn.prod.website-files.com/63a2cd71f5ac0c484121eb40/64944cc0d708f2bf63b5a03b_truck.png";
const dest = path.join(__dirname, "public", "rescue-van.png");

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error("Failed to download:", res.statusCode);
    return;
  }
  const file = fs.createWriteStream(dest);
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log("Successfully downloaded truck.png to public/rescue-van.png, size:", fs.statSync(dest).size);
  });
}).on('error', err => {
  console.error("Error:", err.message);
});
