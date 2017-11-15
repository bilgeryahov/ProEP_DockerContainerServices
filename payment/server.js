/**
 * @file server.js
 *
 * Express Server setup for the Payment Service.
 *
 * @author Bilger Yahov <bayahov1@gmail.com>
 * @version 1.0.0
 * @copyright © 2017 Code Ninjas, all rights reserved.
 */

`use strict`;

const express = require('express');
const routes = require('./src/routes');

// Constants
const PORT = 1996;

const app = express();
app.set('port', PORT);
app.use(function(req, res, next){
	console.log(req.method, req.url);
	next();
});
app.use('/', routes);

const server = app.listen(app.get('port'), function(){
	let port = server.address().port;
	console.log('Info: Server listening on port: ', port);
});