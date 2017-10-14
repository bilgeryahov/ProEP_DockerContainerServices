const assert = require('assert');
import {
    schema,
    root
} from './../src/api';

describe('Graphql', function () {
    describe('users', function () {
        it('Create a user', function (done) {
            graphql(schema, '{ registerUser { "name": "testuser", "password": "testpassword" } }', root).then((response) => {
                assert.true(response.data.succeed);
                return graphql(schema, '{ registerUser { "name": "testuser", "password": "testpassword" } }', root);
            }).then((response) => {
                assert.false(response.data.succeed);
                done();
            });
        });

        it('Login a user', function (done) {
            graphql(schema, '{ users(name: "testuser", password: "testpassword") { id } }', root).then((response) => {
                assert.integer(response.data.users.id);
                done();
            });
        });

        it('Login a user wrong password', function (done) {
            graphql(schema, '{ users(name: "testuser", password: "testpassword") { id } }', root).then((response) => {
                assert.true(response.data.users == null);
                done();
            });
        });
    });
});