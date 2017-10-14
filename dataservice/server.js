const express = require('express');

// Constants
const PORT = 1984;

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Test: Hello world from Web Facade!');
});

app.listen(PORT);
console.log(`Running on http://localhost:${PORT}`);
