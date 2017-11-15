/**
 * @file test.js
 *
 * Tests for the Payment Service.
 *
 * @author Bilger Yahov <bayahov1@gmail.com>
 * @version 1.0.0
 * @copyright © 2017 Code Ninjas, all rights reserved.
 */

// Dependencies.
const expect = require('chai').expect; // eslint-disable-line

// Testing...
const foo = 'bar';
const beverages = {
  tea: ['chai', 'matcha', 'oolong'],
};

expect(foo).to.be.a('string');
expect(foo).to.equal('bar');
expect(foo).to.have.lengthOf(3);
expect(beverages).to.have.property('tea').with.lengthOf(3);
