import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient('http://authentication:9000/graphql', { headers: {} });
const amqp = require('amqp');

// RabbitMQ stuff
const connection = amqp.createConnection({ host: 'amqp://user:user@rabbit:5672' });

// Join a queue
const queuePromise = new Promise(resolve => connection.on('ready', resolve))
  .then(() => new Promise(resolve => connection.queue('phonemeta', resolve)));

export const newConnection = (socket) => {
  console.log('New connection');
  socket.join('singleroom'); // refactor later to work on multiple streams
  let userId = null;

  socket.on('login', (msg) => {
    console.log(`Login: ${JSON.stringify(msg)}`);
    if ('name' in msg && 'pass' in msg) {
      client.request('query login($name: String!, $pass: String!) { user(name: $name, pass: $pass) { id } }', msg)
        .then((x) => {
          if (userId != null) {
            socket.emit('login', { succeed: false, message: 'Already logged in' });
          } else if (x.user != null && Number.isInteger(x.user.id)) {
            userId = x.user.id;
            socket.emit('login', { succeed: true, message: '' });
          } else {
            socket.emit('login', { succeed: false, message: 'Wrong username or password' });
          }
        })
        .catch(err => socket.emit('login', { succeed: false, message: `Error ${err}` }));
    } else {
      socket.emit('login', { succeed: false, message: 'Give both username and password' });
    }
  });

  socket.on('register', (msg) => {
    if ('name' in msg && 'email' in msg && 'pass' in msg) {
      client.request('query register($name: String!, $email: String!, $pass: String!){ registerUser (name: $name, email: $email, pass: $pass ) { succeed message } }', msg)
        .then((x) => {
          if (x.registerUser != null) {
            socket.emit('register', x.registerUser);
          } else {
            socket.emit('register', { succeed: false, message: JSON.stringify(x) });
          }
        })
        .catch((err) => {
          console.error(err);
          socket.emit('register', { succeed: false, message: `Error ${err}` });
        });
    } else {
      socket.emit('register', { succeed: false, message: 'Give both username, email and password' });
    }
  });
};

export const rabbitToSocket = (io) => {
  queuePromise.then((queue) => { // queue is loaded
    queue.subscribe(message => io.sockets.in('singleroom').emit('phonemeta', JSON.parse(message))); // pass the event to socket
  });
};
