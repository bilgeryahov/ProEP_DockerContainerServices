import { buildSchema } from 'graphql';

const amqp = require('amqp');

// RabbitMQ stuff
const connection = amqp.createConnection({ host: 'amqp://user:user@rabbit:5672' });
// add this for better debuging
connection.on('error', (e) => {
  console.log('Error from amqp: ', e);
});

// Join a queue
new Promise(resolve => connection.on('ready', resolve))
  .then(() => new Promise(resolve => connection.queue('phonemeta', resolve)));

export const schema = buildSchema(`
type Query {
  hello: String
  sendPhoneMeta(data: String!): Boolean!
}
`);

export const root =
{
  hello: () => 'Hello world from stream!',
  sendPhoneMeta: (data) => {
    connection.publish('phonemeta', data);
    return true;
  },
};
