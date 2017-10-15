import { buildSchema } from 'graphql';

export const schema = buildSchema(`
type Query {
    hello: String
    user(name: String!, pass: String!): User
}

type User {
  id: Int!
}
`);

export const root =
{
  hello: () => 'Hello world!',
  user: ({ name, pass }) => ({ id: 5, a: name + pass }),
};
