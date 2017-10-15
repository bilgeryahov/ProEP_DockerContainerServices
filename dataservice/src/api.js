import { buildSchema } from 'graphql';

export const schema = buildSchema(`
type Query {
  hello: String
  user(name: String!, pass: String!): User
  registerUser(name: String!, pass: String!): Result
}

type User {
  id: Int!
}

type Result {
  succeed: Boolean!
  message: String
}
`);

export const root =
{
  hello: () => 'Hello world!',
  user: ({ name, pass }) => ({ id: 5, a: name + pass }),
  registerUser: ({ name, pass }) => ({ succeed: true, message: name + pass }),
};
