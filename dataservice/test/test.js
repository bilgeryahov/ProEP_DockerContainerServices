/* eslint-env node, mocha */
import { graphql } from 'graphql';

import {
  schema,
  authDb,
  model,
  root,
} from './../src/api';

const assert = require('assert');

describe('Graphql', () => {
  before(() =>
    authDb()
      .then(() => {
        console.log('Connection worked');
        return Promise.resolve();
      })
      .then(() =>
        model.User.destroy({ // Remove testdata before running
          where: {
            $or: [{ username: 'testuser' }, { username: 'george' }, { username: 'steve' }],
          },
        }))
      .catch((err) => {
        console.error('Unable to connect', err);
        return Promise.reject(Error('Initialization failed'));
      }));
  describe('basic', () => {
    it(
      'Succeed a promise',
      () => Promise.resolve(),
    );

    it(
      'Failed promise catch',
      () =>
        Promise.reject(Error('Some error'))
          .then(() => Promise.reject(Error('Previous error should have failed')))
          .catch(error => (error.message === 'Some error' ? Promise.resolve() : Promise.reject(error))),
    );

    it(
      'Can run graphql query',
      () =>
        graphql(schema, '{ hello }', root)
          .then(response =>
            new Promise((resolve, reject) => {
              if (response.data.hello === 'Hello world!') {
                resolve();
              } else {
                reject(Error(`Expected response hello world but got ${JSON.stringify(response)}`));
              }
            })),
    );
  });

  describe('users', () => {
    it(
      'Create a user',
      () =>
        graphql(schema, '{ registerUser (name: "testuser", email: "a@a.com", pass: "testpassword") { succeed message } }', root)
          .then((response) => {
            try {
              if (!response.data.registerUser.succeed) {
                return Promise.reject(Error('Couldn\'t create first user'));
              }
            } catch (err) {
              console.log(response);
              return Promise.reject(Error('Exception happened'));
            }
            return graphql(schema, '{ registerUser (name: "testuser", email: "a@a.com", pass: "testpassword") { succeed message } }', root);
          }).then(response =>
            new Promise((resolve, reject) => {
              if (!response.data.registerUser.succeed) {
                resolve();
              } else {
                reject(Error('User should already be registered, user could be made again'));
              }
            })),
    );

    it('Login a user', () =>
      graphql(schema, '{ user(name: "testuser", pass: "testpassword") { id } }', root)
        .then((response) => {
          assert.ok(Number.isInteger(response.data.user.id));
        }));

    it('Not login a user with wrong password', () =>
      graphql(schema, '{ user(name: "testuser", pass: "testwrongpassword") { id } }', root).then((response) => {
        assert.ok(response.data.user == null);
      }));
  });
});
