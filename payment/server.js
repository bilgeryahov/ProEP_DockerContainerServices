/**
 * @file server.js
 *
 * Express Servers setup for the Payment Service.
 *
 * @author Bilger Yahov <bayahov1@gmail.com>
 * @version 2.0.0
 * @copyright © 2017 Code Ninjas, all rights reserved.
 */
import {
  schema,
  root,
} from './src/api';

const express = require('express');
const routesPublic = require('./src/routes_public');
const graphqlHTTP = require('express-graphql');

// Constants
const PORT_PUBLIC = 1996;
const PORT_PRIVATE = 1997;

const appPublic = express();
const appPrivate = express();

appPublic.use('/', routesPublic);
appPrivate.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,
}));

appPublic.listen(PORT_PUBLIC, () => {});
appPrivate.listen(PORT_PRIVATE, () => {});
