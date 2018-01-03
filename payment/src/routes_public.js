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
    const {
      paymentId, PayerID, subscriber, subscribeTo,
    } = req.query;

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
        res.status(500).json({ success: false, error });
      } else {
        console.log(JSON.stringify(payment));
        client.request('query subscribeUser($subscriber: String!, $subscribeTo: String!) { subscribeUser(subscriber: $subscriber, subscribeTo: $subscribeTo) { succeed message } }', { subscriber, subscribeTo })
          .then(() => res.status(201).json({ success: true }))
          .catch(err => res.status(500).json({ success: false, error: err }));
      }
    });
  });

router
  .route('/cancel')
  .get((req, res) => {
    res.status(500).json({ success: false });
  });

module.exports = router;
