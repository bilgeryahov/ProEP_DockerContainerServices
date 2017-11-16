/* eslint-env node, mocha */

// const assert = require('assert');
const socketioClient = require('socket.io-client');

const clientPhone = socketioClient.connect('http://phonefacade:1903', { forceNew: true, transports: ['websocket'] });
const clientWeb = socketioClient.connect('http://webfacade:9090', { forceNew: true, transports: ['websocket'] });

const connectionPromise = client =>
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
      console.log(client.io.uri);
      reject(Error('Could not connect to server '));
    });
  });

describe('Socketclient', () => {
  before(() => Promise.all([connectionPromise(clientPhone), connectionPromise(clientWeb)]));
  describe('broadcast', () => {
    it('location should be shared', () => {
      const locdata = { location: { long: 5, lat: 6 } };
      // send location
      clientPhone.emit('phonemeta', locdata);
      return new Promise((resolve) => { // wait for reply
        clientWeb.once('register', resolve);
      })
        .then((data) => {
          if (data.location.long === locdata.location.long
            && data.location.long === locdata.location.long) {
            return Promise.resolve();
          }
          return Promise.reject(Error('Data is not as expected'));
        });
    });
  });
});
