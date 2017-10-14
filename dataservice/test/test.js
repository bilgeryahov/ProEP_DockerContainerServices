const assert = require('assert');

describe('Graphql', function () {
    describe('users', function () {
        it('Create a user', function () {
            graphql(schema, '{ registerUser { "name": "testuser", "password": "testpassword" } }', root).then((response) => {
                assert.true(response.data.succeed);
                return graphql(schema, '{ registerUser { "name": "testuser", "password": "testpassword" } }', root);
            }).then((response) => {
                assert.false(response.data.succeed);
            });
        });

        it('Login a user', function () {
            graphql(schema, '{ users(name: "testuser", password: "testpassword") { id } }', root).then((response) => {
                assert.integer(response.data.users.id);
            });
        });

        it('Login a user wrong password', function () {
            graphql(schema, '{ users(name: "testuser", password: "testpassword") { id } }', root).then((response) => {
                assert.true(response.data.users == null);
            });
        });
    });
});