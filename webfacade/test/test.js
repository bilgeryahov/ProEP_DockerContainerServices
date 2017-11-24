/* eslint-env node, mocha */
// const assert = require('assert');
const socketioClient = require('socket.io-client');

const client = socketioClient.connect('http://127.0.0.1:9090', { forceNew: true, transports: ['websocket'] });
const connectionPromise =
  new Promise((resolve, reject) => {
    client.on('connect', () => {
      console.log('Connected');
      resolve();
    });

    client.on('disconnect', () => {
      console.log('Disconnected');
      reject(Error('Disconnect server'));
    });

    client.on('connect_error', () => {
      console.log('Error on connection');
      reject(Error('Could not connect to server'));
    });
  });

describe('Socketclient', () => {
  before(() => connectionPromise);
  describe('User', () => {
    it('should register and login', () => {
      const registerPromise = new Promise((resolve) => {
        client.once('register', resolve);
      });
      const loginPromise = new Promise((resolve) => {
        client.once('login', resolve);
      });
      client.emit('register', { name: 'steve', email: 'steve@me.com', pass: 'mypass' });
      return registerPromise
        .then((data) => {
          if (!data.succeed) {
            console.error(data);
            return Promise.reject(Error('Register failed'));
          }
          console.log('Registered');
          client.emit('login', { name: 'steve', pass: 'mypass' });
          return loginPromise;
        })
        .then((data) => {
          if (!data.succeed) {
            console.log(data);
            return Promise.reject(Error('login failed'));
          }
          return Promise.resolve();
        });
    });
  });
});
