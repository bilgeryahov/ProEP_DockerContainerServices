const express = require('express');

// Constants
const PORT = 9000;

// App
const app = express();
app.get('/', function (req, res) {
    res.send('Test: Hello world from Authentication Service!');
});

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);