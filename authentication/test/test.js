/* eslint-env node, mocha */
import { graphql } from 'graphql';

import {
  schema,
  root,
} from './../src/api';

const assert = require('assert');

describe('Authentication', () => {
  describe('Register', () => {
    it('should not register wrong email', () =>
      graphql(schema, '{ registerUser (name: "george", email: "georgeorwell.com", pass: "1984") { succeed message } }', root)
        .then((response) => {
          try {
            if (response.data.registerUser.succeed) {
              return Promise.reject(Error('User should not have been created'));
            }
          } catch (err) {
            console.log(response);
            return Promise.reject(Error('Exception happened'));
          }
          return Promise.resolve();
        }));

    it('should register a user', () =>
      graphql(schema, '{ registerUser (name: "george", email: "george@orwell.com", pass: "Animal Farm") { succeed message } }', root)
        .then((response) => {
          try {
            if (!response.data.registerUser.succeed) {
              return Promise.reject(Error('Couldn\'t create first user'));
            }
          } catch (err) {
            console.log(response);
            return Promise.reject(Error('Exception happened'));
          }
          return Promise.resolve();
        }));
  });

  describe('Login', () => {
    it('Login a user', () =>
      graphql(schema, '{ user(name: "george", pass: "Animal Farm") { id } }', root)
        .then((response) => {
          assert.ok(Number.isInteger(response.data.user.id));
        }));

    it('Not login a user with wrong password', () =>
      graphql(schema, '{ user(name: "george", pass: "The answer to 1984 is 1776") { id } }', root).then((response) => {
        assert.ok(response.data.user == null);
      }));
  });
});
