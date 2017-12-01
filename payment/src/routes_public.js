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
const paypal = require('paypal-rest-sdk');
const config = require('./../config.json');
const express = require('express');

const router = express.Router();

paypal.configure({
  mode: config.environment,
  client_id: config.clientID,
  client_secret: config.clientSecret,
});

router
  .route('/success')
  .get((req, res) => {
    const payerID = req.query.PayerID; // eslint-disable-line
    const paymentId = req.query.paymentId; // eslint-disable-line

    const EXECUTE_PAYMENT_JSON = {
      payer_id: payerID,
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
        throw error;
      } else {
        console.log(JSON.stringify(payment));
        res.send('Success');
      }
    });
  });

router
  .route('/cancel')
  .get((req, res) => {
    res.send('Cancelled');
  });

module.exports = router;
