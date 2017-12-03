import {
  initDb,
  schema,
  root,
} from './src/api';

const express = require('express');
const graphqlHTTP = require('express-graphql');

// Constants
const PORT = 1984;

// App
initDb().then(() => {
  const app = express();
  app.get('/', (req, res) => {
    res.send('Test: Hello world from Data Service!');
  });

  app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  }));


  app.listen(PORT);
});
// console.log(`Running on http://localhost:${PORT}`);
