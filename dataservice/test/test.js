/* eslint-env node, mocha */
import { graphql } from 'graphql';

import {
  schema,
  root,
} from './../src/api';

const assert = require('assert');

describe('Graphql', () => {
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
