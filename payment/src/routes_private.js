/**
 * @file routes_private.js
 *
 * Private routes which will be accessed directly
 * from the Web-Facade service.
 *
 * @author Bilger Yahov <bayahov1@gmail.com>
 * @version 1.0.0
 * @copyright © 2017 Code Ninjas, all rights reserved.
 */

// Dependencies.
const paypal = require('paypal-rest-sdk');
const config = require('./../config.json');
const express = require('express');

const router = express.Router();

// Constants.
const PORT = 1996; // Publicly accessible one for the redirects.
const RETURN_URL = `http://40.68.124.79:${PORT}/success`;
const CANCEL_URL = `http://40.68.124.79:${PORT}/cancel`;

paypal.configure({
  mode: config.environment,
  client_id: config.clientID,
  client_secret: config.clientSecret,
});

router
  .route('/pay')
  .post((req, res) => {
    const CREATE_PAYMENT_JSON = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: RETURN_URL,
        cancel_url: CANCEL_URL,
      },
      transactions: [{
        item_list: {
          items: [{
            name: 'item',
            sku: 'item',
            price: '2.00',
            currency: 'EUR',
            quantity: 1,
          }],
        },
        amount: {
          currency: 'EUR',
          total: '2.00',
        },
        description: 'This is the payment description.',
      }],
    };

    paypal.payment.create(CREATE_PAYMENT_JSON, (error, payment) => {
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i += 1) {
          if (payment.links[i].rel === 'approval_url') {
            res.redirect(payment.links[i].href);
          }
        }
      }
    });
  });

module.exports = router;
