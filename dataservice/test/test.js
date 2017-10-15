/* eslint-env node, mocha */
import { graphql } from 'graphql';

import {
  schema,
  root,
} from './../src/api';

const assert = require('assert');

describe('Graphql', () => {
  describe('basic', () => {
    it(
      'Can run graphql query',
      () =>
        graphql(schema, '{ hello }', root)
          .then(
            response =>
              new Promise((resolve, reject) => {
                if (response.data.hello === 'Hello world!') {
                  resolve();
                } else {
                  reject(Error(`Expected response hello world but got ${JSON.stringify(response)}`));
                }
              }),
            error => Promise.reject(error),
          ),
    );
  });

  describe('users', () => {
    it('Create a user', (done) => {
      graphql(schema, '{ registerUser { "name": "testuser", "password": "testpassword" } }', root).then((response) => {
        assert.true(response.data.succeed);
        return graphql(schema, '{ registerUser { "name": "testuser", "password": "testpassword" } }', root);
      }).then((response) => {
        assert.false(response.data.succeed);
        done();
      });
    });

    it('Login a user', (done) => {
      graphql(schema, '{ users(name: "testuser", password: "testpassword") { id } }', root).then((response) => {
        assert.integer(response.data.users.id);
        done();
      });
    });

    it('Login a user wrong password', (done) => {
      graphql(schema, '{ users(name: "testuser", password: "testpassword") { id } }', root).then((response) => {
        assert.true(response.data.users == null);
        done();
      });
    });
  });
});
