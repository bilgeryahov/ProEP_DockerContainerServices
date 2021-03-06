import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient('http://authentication:9000/graphql', { headers: {} });
const clientStream = new GraphQLClient('http://stream:1950/graphql', { headers: {} });
const clientPayment = new GraphQLClient('http://payment:1997/graphql', { headers: {} });
const amqp = require('amqp');

// RabbitMQ stuff
const connection = amqp.createConnection({ host: 'amqp://user:user@rabbit:5672' });

// Join a queue
const connectionPromise = new Promise(resolve => connection.on('ready', resolve));
const queuePromise = connectionPromise
  .then(() => new Promise(resolve => connection.queue('phonemeta', resolve)))
  .catch((err) => {
    console.error(err);
    process.exit(1); // If can't connect, restart the server
  });

const streamersPromise = connectionPromise
  .then(() => new Promise(resolve => connection.queue('streamers', resolve)))
  .catch((err) => {
    console.error(err);
    process.exit(1); // If can't connect, restart the server
  });

const paymentPromise = connectionPromise
  .then(() => new Promise(resolve => connection.queue('payment', resolve)))
  .catch((err) => {
    console.error(err);
    process.exit(1); // If can't connect, restart the server
  });

const getSubsribers = userid => clientStream.request(
  'query getSubscribers($userid: String!){getSubscribers(userid: $userid){username,uuid}}',
  { userid },
);

export const newConnection = (socket, io) => {
  console.log('New connection');
  let userId = null;
  let username = null;
  let room = null;

  socket.on('joinRoom', (uuid) => {
    if (room == null) { // leave old room if other one is joined
      socket.leave(uuid);
    }
    socket.leave('streamers'); // unsub of list of streamers
    console.log(`Joined ${uuid}`);
    socket.join(uuid);
    room = uuid;
  });
  socket.on('leaveRoom', (uuid) => {
    socket.leave(uuid);
    room = null;
  });

  socket.on('login', (msg) => {
    // console.log(`Login: ${JSON.stringify(msg)}`);
    if ('name' in msg && 'pass' in msg) {
      client.request('query login($name: String!, $pass: String!) { user(name: $name, pass: $pass) { id } }', msg)
        .then((x) => {
          if (userId != null) {
            socket.emit('login', { succeed: false, message: 'Already logged in' });
          } else if (x.user != null && Number.isInteger(x.user.id)) {
            userId = x.user.id;
            username = msg.name;
            // Remember connection per username
            socket.join(username);

            socket.emit('login', { succeed: true, message: '', userData: username });
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

  socket.on('getStreamers', () => {
    clientStream.request('{getStreamers{username,uuid}}')
      .then((x) => {
        socket.join('streamers');
        socket.emit('getStreamers', { succeed: true, data: x.getStreamers });
        return getSubsribers(username);
      })
      .then((x) => {
        socket.emit('subsribers', { succeed: true, data: x.getSubscribers });
      })
      .catch((err) => {
        console.error(err);
        socket.emit('getStreamers', { succeed: false, message: `Error ${err}` });
      });
  });

  socket.on('pay', ({ subscribeTo }) => {
    clientPayment.request('query pay($subscriber: String!, $subscribeTo: String!) { pay(subscriber: $subscriber, subscribeTo: $subscribeTo) { succeed message url} }', { subscriber: username, subscribeTo })
      .then((x) => {
        if (x.pay.succeed) {
          socket.emit('redirect', { url: x.pay.url });
        } else {
          throw Error(x.pay.message);
        }
      })
      .catch((err) => {
        console.error(err);
        socket.emit('paymentFailed', { message: `Error ${err}` });
      });
  });

  socket.on('chatMessage', (message) => {
    io.sockets.in(room).emit('newMessage', { id: userId, user: username, msg: message });
  });
};

export const rabbitToSocket = (io) => {
  queuePromise.then((queue) => { // queue is loaded
    console.log('Connected to rabbitmq');
    queue.subscribe((message) => {
      console.log(`broadcast ${JSON.stringify(message)}`);
      io.sockets.in(message.uuid).emit('phonemeta', message.data);
      // console.log('send');
    }); // pass the event to socket
  })
    .catch(err => console.error(err));

  streamersPromise.then((queue) => { // queue is loaded
    console.log('Connected to rabbitmq streamers');
    queue.subscribe((message) => {
      console.log(`streamers ${JSON.stringify(message)}`);
      io.sockets.in('streamers').emit('getStreamers', { succeed: true, data: message });
      // console.log('send');
    }); // pass the event to socket
  })
    .catch(err => console.error(err));

  paymentPromise.then((queue) => { // queue is loaded
    console.log('Connected to rabbitmq payment');
    queue.subscribe((message) => {
      console.log(`payment ${JSON.stringify(message.subscriber)}`);
      const username = message.subscriber;
      getSubsribers(username).then((x) => {
        io.sockets.in(username).emit('subsribers', { succeed: true, data: x.getSubscribers });
      });
    }); // pass the event to socket
  })
    .catch(err => console.error(err));
};
