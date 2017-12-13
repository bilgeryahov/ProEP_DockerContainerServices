/**
 * @file routes_public.js
 *
 * Public routes, which will be called from the PayPal sandbox
 * service.
 *
 * @author Bilger Yahov <bayahov1@gmail.com>
 * @version 2.0.0
 * @copyright © 2017 Code Ninjas, all rights reserved.
 */

// Dependencies.
import { GraphQLClient } from 'graphql-request';

const paypal = require('paypal-rest-sdk');
const config = require('./../config.json');
const express = require('express');

const client = new GraphQLClient('http://dataservice:1984/graphql', { headers: {} });

const router = express.Router();

paypal.configure({
  mode: config.environment,
  client_id: config.clientID,
  client_secret: config.clientSecret,
});

router
  .route('/success')
  .get((req, res) => {
    const { paymentId, PayerID, username } = req.query;

    const EXECUTE_PAYMENT_JSON = {
      payer_id: PayerID,
      transactions: [{
        amount: {
          currency: 'EUR',
          total: '2.00',
        },
      }],
    };

    paypal.payment.execute(paymentId, EXECUTE_PAYMENT_JSON, (error, payment) => {
      if (error) {
        console.log(error.response);
        res.status(500).json({ success: false });
      } else {
        console.log(JSON.stringify(payment));
        client.request('query subscribeUser($username: String!) { subscribeUser(name: $username) { succeed message } }', { username })
          .then(() => res.status(201).json({ success: true }))
          .catch(() => res.status(500).json({ success: false }));
      }
    });
  });

router
  .route('/cancel')
  .get((req, res) => {
    res.status(500).json({ success: false });
  });

module.exports = router;
