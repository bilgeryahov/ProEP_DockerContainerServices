/* eslint-env node, mocha */
import { graphql } from 'graphql';

import { schema, root } from './../src/api';

// const assert = require('assert');

describe('stream service', () => {
  describe('initStream', () => {
    it('can run graphql query', () =>
      graphql(schema, '{ hello }', root)
        .then(response =>
          new Promise((resolve, reject) => {
            if (response.data.hello === 'Hello world from stream!') {
              resolve();
            } else {
              reject(Error(`Expected response hello world but got ${JSON.stringify(response)}`));
            }
          })));

    it('should initialize stream', () =>
      graphql(schema, '{ initStream (username: "testuser") }', root)
        .then((response) => {
          console.log('Response: ', response);
          // assert.ok(typeof response.data.initStream === 'string');
        }));
  });
});
