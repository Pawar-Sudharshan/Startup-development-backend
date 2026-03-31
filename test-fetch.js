fetch('http://localhost:8080/api/save-to-watchlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer 1234' },
    body: JSON.stringify({
        problemStatement: 'p',
        solution: 's',
        llmResponse: {}
    })
}).then(r => r.json().then(j => console.log(r.status, j))).catch(console.error);
