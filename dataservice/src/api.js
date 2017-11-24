import { buildSchema } from 'graphql';

const models = require('../models');

// Create database if it doesn't exist
models.sequelize.sync();

export const schema = buildSchema(`
type Query {
  hello: String
  user(name: String!, pass: String!): User
  registerUser(name: String!, email: String!, pass: String!): Result
}

type User {
  id: Int!
  email: String!
  subscribed: Int!
}

type Result {
  succeed: Boolean!
  message: String
}
`);

export const root =
{
  hello: () => 'Hello world!',
  user: ({ name, pass }) => models.User.findOne({
    attributes: ['id', 'email', 'subscribed'],
    where: {
      username: name,
      password: pass,
    },
  }),
  registerUser: ({ name, email, pass }) =>
    models.User.count({ where: { $or: [{ username: name }, { email }] } })
      .then((count) => {
        if (count === 0) {
          models.User.create({
              username: name,
              email: email,
              password: pass,
              subscribed: 0
          });
          return ({ succeed: true, message: '' });
        }
        return ({ succeed: false, message: 'Name or email already exists' });
      }),
};

export const authDb = () => models.sequelize.authenticate();
export const model = models;
