import http from 'http';

const data = JSON.stringify({
  problemStatement: 'Test Problem',
  solution: 'Test Solution',
  llmResponse: { test: true }
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/save-to-watchlist',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 1234invalidtoken',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', console.error);
req.write(data);
req.end();
