import {
  schema,
  root,
} from './src/api';

const express = require('express');
const graphqlHTTP = require('express-graphql');

// Constants
const PORT = 1950;

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Test: Hello world from Stream Service!');
});

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,
}));


app.listen(PORT);
