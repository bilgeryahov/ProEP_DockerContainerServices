import { buildSchema } from 'graphql';
import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient('http://dataservice:1984/graphql', { headers: {} });

const Isemail = require('isemail');

export const schema = buildSchema(`
type Query {
  hello: String
  user(name: String!, pass: String!): User
  registerUser(name: String!, email: String!, pass: String!): Result
}

type User {
  id: Int!
  email: String!
}

type Result {
  succeed: Boolean!
  message: String
}
`);

export const root =
{
  hello: () => 'Hello world from authentication!',
  user: args =>
    client.request('query login($name: String!, $pass: String!) { user(name: $name, pass: $pass) { id email } }', args)
      .then(x => Promise.resolve(x.user))
      .catch(err => Promise.reject(err)),
  registerUser: (args) => {
    if (Isemail.validate(args.email)) {
      return client.request('query register($name: String!, $email: String!, $pass: String!){ registerUser (name: $name, email: $email, pass: $pass ) { succeed message } }', args)
        .then((data) => {
          console.log('Succeed request register');
          return Promise.resolve(data.registerUser);
        })
        .catch((err) => {
          console.log('Fail request register');
          console.error(err);
          return Promise.resolve({ succeed: false, message: 'Could not make request to dataservice' });
        });
    }
    return Promise.resolve({ succeed: false, message: 'E-mail address is invalid' });
  },
};
