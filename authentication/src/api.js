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
  user: ({ name, pass }) =>
    client.request(`{ user(name: "${name}", pass: "${pass}") { id } }`)
      .then(x => Promise.resolve(x.user))
      .catch(err => Promise.reject(err)),
  registerUser: ({ name, email, pass }) => {
    if (Isemail.validate(email)) {
      return client.request(`{ registerUser (name: "${name}", email: "${email}", pass: "${pass}") { succeed message } }`)
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
