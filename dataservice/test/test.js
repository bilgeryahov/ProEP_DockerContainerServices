/* eslint-env node, mocha */
import { graphql } from 'graphql';
import { setTimeout } from 'timers';

import {
  schema,
  root,
} from './../src/api';

const assert = require('assert');

describe('Graphql', () => {
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
      'Create two users, subscribe one to the other.',
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
            return new Promise(resolve => setTimeout(resolve, 100));
          })
          .then(() => graphql(schema, '{ registerUser (name: "testuser", email: "a@a.com", pass: "testpassword") { succeed message } }', root))
          .then((response) => {
            if (!response.data.registerUser.succeed) {
              return graphql(schema, '{ registerUser (name: "testuser2", email: "aa@a.com", pass: "testpassword2") { succeed message } }', root);
            }
            return Promise.reject(Error('User should already be registered, user could be made again'));
          })
          .then((response) => {
            try {
              if (!response.data.registerUser.succeed) {
                return Promise.reject(Error('Couldn\'t create second user'));
              }
            } catch (err) {
              console.log(response);
              return Promise.reject(Error('Exception happened'));
            }
            return graphql(schema, '{ checkSubscribed (subscriber: "testuser", subscribeTo: "testuser2") }', root);
          })
          .then((response) => {
            if (response.data.checkSubscribed === 0) {
              return graphql(schema, '{ subscribeUser (subscriber: "testuser", subscribeTo: "testuser2") { succeed message } }', root);
            }
            return Promise.reject(Error('User is subscribed, should not be'));
          })
          .then((response) => {
            try {
              if (!response.data.subscribeUser.succeed) {
                return Promise.reject(Error('Couldn\'t subscribe user'));
              }
              return graphql(schema, '{ checkSubscribed (subscriber: "testuser", subscribeTo: "testuser2") }', root);
            } catch (err) {
              console.log(response);
              return Promise.reject(Error('Exception happened'));
            }
          })
          .then((response) => {
            if (response.data.checkSubscribed === 1) {
              return Promise.resolve();
            }
            return Promise.reject(Error('Could not verify that user has been subscribed'));
          }),
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
