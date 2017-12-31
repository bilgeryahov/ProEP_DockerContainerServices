import { buildSchema } from 'graphql';

const amqp = require('amqp');
const uuidv4 = require('uuid/v4');
const redis = require('redis');

const client = redis.createClient('redis://redis/');

// RabbitMQ stuff
const connection = amqp.createConnection({ host: 'amqp://user:user@rabbit:5672' });
// add this for better debuging
connection.on('error', (e) => {
  console.log('Error from amqp: ', e);
});

// Redis stuff.
client.on('error', (err) => {
  console.log(`Error from redis: ${err}`);
  process.exit(1); // If can't connect, restart the server
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
  sendPhoneMeta(data: String!, uuid: String!): Boolean!
  initStream(username: String!): String!
  removeStream(uuid: String!): Boolean!
  getStreamers: [Streamer]!
}

type Streamer {
  uuid: String!
  username: String!
}
`);

const getStreamerList = () => new Promise((resolve, reject) =>
  client.hgetall('streamers', (err, res) => {
    if (err) {
      reject(err);
    }

    resolve(res);
  })).then((result) => {
  console.log(result);
  if (result == null) {
    return [];
  }
  return Object.keys(result).map(x => ({ uuid: x, username: result[x] }));
});

export const root =
  {
    hello: () => 'Hello world from stream!',
    sendPhoneMeta: (metadata) => {
      // console.log(`publish ${JSON.stringify(data)}`);
      connection.publish('phonemeta', { uuid: metadata.uuid, data: JSON.parse(metadata.data) });
      return true;
    },
    initStream: ({ username }) => {
      const uuid = uuidv4();
      client.hmset('streamers', { [uuid]: username });
      getStreamerList().then((data) => { // asynchronuosly notify webfacade of the new streamer list
        connection.publish('streamers', data);
      });
      return uuid;
    },
    removeStream: ({ uuid }) => {
      client.hdel('streamers', uuid);
      return true;
    },
    getStreamers: getStreamerList,
  };
