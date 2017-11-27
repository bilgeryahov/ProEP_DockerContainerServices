import { GraphQLClient } from 'graphql-request';

const rp = require('request-promise');

const client = new GraphQLClient('http://authentication:9000/graphql', { headers: {} });
const amqp = require('amqp');

// RabbitMQ stuff
const connection = amqp.createConnection({ host: 'amqp://user:user@rabbit:5672' });
const PAYMENT_URL = 'http://40.68.124.79:1997/pay';

// Join a queue
const queuePromise = new Promise(resolve => connection.on('ready', resolve))
  .then(() => new Promise(resolve => connection.queue('phonemeta', resolve)))
  .catch((err) => {
    console.error(err);
    process.exit(1); // If can't connect, restart the server
  });

export const newConnection = (socket) => {
  console.log('New connection');
  socket.join('singleroom'); // refactor later to work on multiple streams
  let userId = null;
  let userName = null;

  socket.on('login', (msg) => {
    console.log(`Login: ${JSON.stringify(msg)}`);
    if ('name' in msg && 'pass' in msg) {
      client.request('query login($name: String!, $pass: String!) { user(name: $name, pass: $pass) { id, subscribed } }', msg)
        .then((x) => {
          if (userId != null) {
            socket.emit('login', { succeed: false, message: 'Already logged in' });
          } else if (x.user != null && Number.isInteger(x.user.id)) {
            userId = x.user.id;
            userName = msg.name;
            socket.emit('login', { succeed: true, message: '', userData: x.user });
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

  socket.on('subscribeUser', (name) => {
    client.request('query subscribeUser($name: String!){ subscribeUser (name: $name) { subscribed } }', name)
      .then((x) => {
        if (x !== 0) {
          socket.emit('subscribeUser', { succeed: false, message: 'Cannot subscribe!' });
        } else {
          rp({
            uri: PAYMENT_URL,
            method: 'POST',
            resolveWithFullResponse: true,
          }).then((response) => {
            if (response.status === 201) {
              // Subscribe user.
            } else {
              socket.emit('subscribeUser', { succeed: false, message: 'Cannot subscribe!' });
            }
          })
            .catch((err) => {
              socket.emit('subscribeUser', { succeed: false, message: `Error ${err}` });
            });
        }
      })
      .catch((err) => {
        console.error(err);
        socket.emit('subscribeUser', { succeed: false, message: `Error ${err}` });
      });
  });
};

export const rabbitToSocket = (io) => {
  queuePromise.then((queue) => { // queue is loaded
    console.log('Connected to rabbitmq');
    console.log(io);
    console.log(queue);
    queue.subscribe((message) => {
      // console.log(`broadcast ${JSON.stringify(message)}`);
      io.sockets.in('singleroom').emit('phonemeta', message);
      // console.log('send');
    }); // pass the event to socket
  })
    .catch(err => console.error(err));
};
