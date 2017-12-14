/* eslint-env node, mocha */
import { graphql } from 'graphql';

import { schema, root } from './../src/api';

const assert = require('assert');

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

    it('should initialize stream and show list of all streamers, and then remove the streamer', () =>
      graphql(schema, '{ initStream (username: "testuser") }', root)
        .then((response) => {
          console.log('Response: ', response);
          const uuid = response.data.initStream;
          assert.ok(typeof uuid === 'string');
          return graphql(schema, '{ getStreamers { uuid, username } }', root)
            .then((result) => {
              console.log(result);

              return Promise.resolve({ uuid, result });
            });
        })
        .then(({ uuid, result }) => {
          console.log(result);
          assert.ok(result.data.getStreamers.some(x => x.uuid === uuid && x.username === 'testuser'));
          return graphql(schema, `{ removeStream(uuid: "${uuid}") }`, root);
        })
        .then((result) => {
          console.log(result);
          // assert.ok(result.data.removeStream);
          return graphql(schema, '{ getStreamers { uuid, username } }', root);
        })
        .then((result) => {
          console.log(result);
          assert.ok(!result.data.getStreamers.some(x => x.username === 'testuser'));
        }));
  });
});
