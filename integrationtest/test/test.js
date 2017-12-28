/* eslint-env node, mocha */

// const assert = require('assert');
const socketioClient = require('socket.io-client');
const assert = require('assert');

const clientPhone = socketioClient.connect('http://phonefacade:1903', { forceNew: true, transports: ['websocket'] });
const clientPhoneB = socketioClient.connect('http://phonefacade:1903', { forceNew: true, transports: ['websocket'] });
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

describe('Streaming', () => {
  before(() => Promise.all([connectionPromise(clientPhone), connectionPromise(clientWeb)]));
  it('Register, login, initstream finally show list of streamers', () => {
    let uuid = '';
    clientWeb.emit('register', { name: 'asana', email: 'asana@mamoru.jp', pass: 'ding ding ding' });
    return new Promise(resolve => clientWeb.once('register', resolve))
      .then((data) => { // web register
        if (!data.succeed) {
          return Promise.reject(Error('Register failed'));
        }
        console.log('Web register');
        clientWeb.emit('login', { name: 'asana', pass: 'ding ding ding' });
        return new Promise(resolve => clientWeb.once('login', resolve));
      })
      .then((data) => { // web login
        if (!data.succeed) {
          return Promise.reject(Error('Login failed Web'));
        }
        console.log('Web login');
        clientPhone.emit('login', { name: 'asana', pass: 'ding ding ding' });
        return new Promise(resolve => clientPhone.once('login', resolve));
      })
      .then((data) => { // phone login
        if (!data.succeed) {
          return Promise.reject(Error('Login failed Phone'));
        }
        console.log('initstream');
        clientPhone.emit('initStream');
        return new Promise(resolve => clientPhone.once('initStream', resolve));
      })
      .then((data) => { // phone initStream
        if (!data.succeed) {
          return Promise.reject(Error('initStream failed Phone'));
        }
        console.log('getStreamers');
        uuid = data.data;
        clientWeb.emit('getStreamers');
        return new Promise(resolve => clientWeb.once('getStreamers', resolve));
      })
      .then((data) => { // web get stream list
        if (!data.succeed) {
          return Promise.reject(Error('Cant get list of streamers'));
        }
        console.log('Check');
        assert.deepEqual(data.data, [{ uuid, username: 'asana' }]);
        return Promise.resolve();
      });
  }).timeout(5000);
});


describe('Socketclient', () => {
  describe('broadcast', () => {
    it('location should be shared', () => {
      // send location
      const locdata = { location: { long: 5, lat: 6 } };
      clientPhoneB.emit('login', { name: 'asana', pass: 'ding ding ding' });
      return new Promise(resolve => clientPhoneB.once('login', resolve))
        .then((data) => { // phone login
          if (!data.succeed) {
            console.log(data);
            return Promise.reject(Error('Login failed Phone'));
          }
          console.log('Broadcast logged in');
          clientPhoneB.emit('initStream');
          return new Promise(resolve => clientPhoneB.once('initStream', resolve));
        })
        .then((data) => { // phone initStream
          if (!data.succeed) {
            return Promise.reject(Error('initStream failed Phone'));
          }
          const uuid = data.data;
          console.log('Got uuid:');
          console.log(uuid);
          clientWeb.emit('joinRoom', uuid);
          clientPhoneB.emit('phonemeta', locdata);
          return new Promise((resolve) => { // wait for reply
            clientWeb.once('phonemeta', resolve);
          });
        })
        .then((data) => {
          console.log(`Got ${JSON.stringify(data)}`);
          if (data.location.long === locdata.location.long
              && data.location.long === locdata.location.long) {
            return Promise.resolve();
          }
          return Promise.reject(Error('Data is not as expected'));
        });
    }).timeout(5000);
  });
});
