import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient('http://authentication:9000/graphql', { headers: {} });
const streamClient = new GraphQLClient('http://stream:1950/graphql', { headers: {} });

export const newConnection = (socket) => {
  console.log('New connection');
  let userId = null;
  let username = null;
  let uuid = null;

  socket.on('login', (msg) => {
    console.log(`Login: ${JSON.stringify(msg)}`);
    if ('name' in msg && 'pass' in msg) {
      client.request('query login($name: String!, $pass: String!) { user(name: $name, pass: $pass) { id subscribed } }', msg)
        .then((x) => {
          if (userId != null) {
            socket.emit('login', { succeed: false, message: 'Already logged in' });
          } else if (x.user != null && Number.isInteger(x.user.id)) {
            userId = x.user.id;
            username = msg.name;
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

  socket.on('phonemeta', msg =>
    streamClient.request('query sendPhoneMeta($data: String!) { sendPhoneMeta(data: $data) }', { data: JSON.stringify(msg) })
      // .then(() => console.log(`send message ${JSON.stringify(msg)}`))
      .catch(err => console.error(err)));
  socket.on('initStream', () => {
    streamClient.request('query initStream($data: String!) { initStream(username: $data) }', { data: username })
      .then((x) => {
        uuid = x.initStream;
        socket.emit('initStream', { succeed: true, data: uuid });
      })
      .catch((err) => {
        console.error(err);
        socket.emit('initStream', { succeed: false, message: `Error ${err}` });
      });
  });

  socket.on('disconnect', () => {
    if (uuid !== null) {
      streamClient.request('query removeStream($data: String!) { removeStream(uuid: $data) }', { data: uuid });
    }
  });
};

export const superSecret = 'abc';
