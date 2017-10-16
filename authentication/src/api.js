import { buildSchema } from 'graphql';

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
  user: ({ name, pass }) => ({ name, pass }),
  registerUser: ({ name, email, pass }) => ({ name, email, pass }),
};
