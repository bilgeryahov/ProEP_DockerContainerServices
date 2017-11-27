import { buildSchema } from 'graphql';

const models = require('../models');

// Create database if it doesn't exist
models.sequelize.sync();

export const schema = buildSchema(`
type Query {
  hello: String
  user(name: String!, pass: String!): User
  registerUser(name: String!, email: String!, pass: String!): Result
  checkSubscribed(name: String!): Result
  subscribeUser(name: String!): Result
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
            email,
            password: pass,
            subscribed: 0,
          });
          return ({ succeed: true, message: '' });
        }
        return ({ succeed: false, message: 'Name or email already exists' });
      }),
  checkSubscribed: ({ name }) => models.User.findOne({
    attributes: ['subscribed'],
    where: {
      username: name,
    },
  }),
  subscribeUser: ({ name }) => models.User.findOne({
    attributes: ['subscribed'],
    where: {
      username: name,
    },
  }).then((user) => {
    if (user) {
      return user.updateAttributes({ subscribed: 1 })
        .then(() => Promise.resolve({ succeed: true, message: 'User subscribed' }));
    }
    return Promise.resolve({ succeed: false, message: 'Cant find user' });
  }),
};

export const authDb = () => models.sequelize.authenticate();
export const model = models;
