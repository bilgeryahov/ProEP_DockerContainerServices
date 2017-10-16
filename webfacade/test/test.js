/* eslint-env node, mocha */
// const assert = require('assert');
const socketioClient = require('socket.io-client');

const client = socketioClient('http://127.0.0.1:9090/', { forceNew: true });

describe('Socketclient', () => {
  before(() => new Promise((resolve, reject) => {
    client.on('connect', () => {
      resolve();
    });

    client.on('disconnect', () => {
      reject(Error('Could not connect to server'));
    });
  }));
  describe('#indexOf()', () => {
    it('should register and login', () => {
      const registerPromise = new Promise((resolve) => {
        client.on('register', resolve);
      });
      const loginPromise = new Promise((resolve) => {
        client.on('login', resolve);
      });
      client.emit('register', { name: 'steve', email: 'steve@me.com', pass: 'mypass' });
      return registerPromise
        .then((data) => {
          if (!data.succeed) {
            return Promise.reject(Error('Register failed'));
          }
          client.emit('login', { name: 'steve', pass: 'mypass' });
          return loginPromise;
        })
        .then((data) => {
          if (!data.succeed) {
            return Promise.reject(Error('login failed'));
          }
          return Promise.resolve();
        });
    });
  });
});
