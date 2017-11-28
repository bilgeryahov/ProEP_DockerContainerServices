import { buildSchema } from 'graphql';

const amqp = require('amqp');
const uuidv4 = require('uuid/v4');
const redis = require('redis');

const client = redis.createClient('redis');

// RabbitMQ stuff
const connection = amqp.createConnection({ host: 'amqp://user:user@rabbit:5672' });
// add this for better debuging
connection.on('error', (e) => {
  console.log('Error from amqp: ', e);
});

// Redis stuff.
client.on('error', (err) => {
  console.log(`Error from redis: ${err}`);
});
client.on('connect', () => {
  console.log('Connected to Redis');
});

// Join a queue
new Promise(resolve => connection.on('ready', resolve))
  .then(() => new Promise(resolve => connection.queue('phonemeta', resolve)))
  .then(() => console.log('Connected to rabbitmq'))
  .catch((err) => {
    console.error(err);
    process.exit(1); // If can't connect, restart the server
  });

export const schema = buildSchema(`
type Query {
  hello: String
  sendPhoneMeta(data: String!): Boolean!
  initStream(username: String!): String!
}
`);

export const root =
{
  hello: () => 'Hello world from stream!',
  sendPhoneMeta: (data) => {
    // console.log(`publish ${JSON.stringify(data)}`);
    connection.publish('phonemeta', JSON.parse(data.data));
    return true;
  },
  initStream: (username) => {
    const uuid = uuidv4();
    client.hmset('streamers', { [uuid]: username });

    return uuid;
  },
};

