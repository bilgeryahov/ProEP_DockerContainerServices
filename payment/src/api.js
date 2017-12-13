import { buildSchema } from 'graphql';

const config = require('./../config.json');
const paypal = require('paypal-rest-sdk');

const PORT = 1996; // Publicly accessible one for the redirects.
const RETURN_URL = `http://40.68.124.79:${PORT}/success`;
const CANCEL_URL = `http://40.68.124.79:${PORT}/cancel`;

paypal.configure({
  mode: config.environment,
  client_id: config.clientID,
  client_secret: config.clientSecret,
});

export const schema = buildSchema(`
type Query {
  hello: String
  pay(username: String!): Result!
}

type Result {
  succeed: Boolean!
  message: String
  url: String
}
`);

export const root =
{
  hello: () => 'Hello world from payment!',
  pay: ({ username }) => {
    const CREATE_PAYMENT_JSON = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: `${RETURN_URL}&userid=${username}`,
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

    return new Promise(resolve => paypal.payment.create(CREATE_PAYMENT_JSON, (error, payment) => {
      if (error) {
        resolve({
          succeed: false,
          message: JSON.stringify(error),
        });
      } else {
        for (let i = 0; i < payment.links.length; i += 1) {
          if (payment.links[i].rel === 'approval_url') {
            resolve({
              succeed: true,
              url: payment.links[i].href,
            });
          }
        }
      }
    }));
  },
};
