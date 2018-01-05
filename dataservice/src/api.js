import { buildSchema } from 'graphql';

const models = require('../models');

// Create database if it doesn't exist
export const initDb = () => models.sequelize.sync().then(() =>
  models.User.destroy({ // Remove testdata before running
    where: {
      $or: [{ username: 'testuser2' }, { username: 'testuser' }, { username: 'george' }, { username: 'steve' }, { username: 'georgesoroz' }, { username: 'asana' }],
    },
  }));

export const schema = buildSchema(`
type Query {
  hello: String
  user(name: String!, pass: String!): User
  registerUser(name: String!, email: String!, pass: String!): Result
  checkSubscribed(subscriber: String!, subscribeTo: String!): Int!
  subscribeUser(subscriber: String!, subscribeTo: String!): Result
  getSubscribers(userid: Int!): [String]!
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
  hello: () => 'Hello world!',
  user: ({ name, pass }) => models.User.findOne({
    attributes: ['id', 'email'],
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
          });
          return ({ succeed: true, message: '' });
        }
        return ({ succeed: false, message: 'Name or email already exists' });
      }),
  checkSubscribed: ({ subscriber, subscribeTo }) => models.User.findOne({
    attributes: ['id', 'username'],
    where: {
      username: subscriber,
    },
  }).then((subscriberUser) => {
    if (subscriberUser) {
      return subscriberUser.getSubscribeTo();
    }
    throw new Error('Cannot find subscriberUser');
  }).then(users => (users.some(user => user.username === subscribeTo) ? 1 : 0)),
  subscribeUser: ({ subscriber, subscribeTo }) => {
    let subscriberUserHolder = null;
    let subscribeToUserHolder = null;

    return models.User.findOne({
      attributes: ['id', 'username'],
      where: {
        username: subscriber,
      },
    }).then((subscriberUser) => {
      if (subscriberUser) {
        subscriberUserHolder = subscriberUser;
        return models.User.findOne({
          attributes: ['id', 'username'],
          where: {
            username: subscribeTo,
          },
        });
      }
      return Promise.reject(new Error('Cannot find subscriberUser'));
    }).then((subscribeToUser) => {
      if (subscribeToUser) {
        subscribeToUserHolder = subscribeToUser;
        return subscriberUserHolder.addSubscribeTo(subscribeToUserHolder);
      }
      return Promise.reject(new Error('Cannot find subscribeToUser'));
    }).then(() => Promise.resolve({ succeed: true }))
      .catch(err => Promise.resolve({ succeed: false, message: JSON.stringify(err) }));
  },
  getSubscribers: ({ userid }) => models.User.findOne({
    attributes: ['id', 'username'],
    where: {
      id: userid,
    },
  }).then((subscriberUser) => {
    if (subscriberUser) {
      return subscriberUser.getSubscribeTo();
    }
    throw new Error('Cannot find subscriberUser');
  }).then(users => users.map(x => x.username)),
};

