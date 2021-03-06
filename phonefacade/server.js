import { newConnection } from './src';

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// Constants
const PORT = 1903;

// App
app.get('/', (req, res) => {
  res.send('Test: Hello world from Phone Facade!');
});

io.on('connection', newConnection);

http.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
