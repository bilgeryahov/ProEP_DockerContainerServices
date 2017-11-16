/**
 * @file test.js
 *
 * Tests for the Payment Service.
 * TODO: Write proper tests.
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

describe('#payment: ', function () {
	it('tries an example test.', function (done) {
		expect(foo).to.be.a('string');
		expect(foo).to.equal('bar');
		expect(foo).to.have.lengthOf(3);
		expect(beverages).to.have.property('tea').with.lengthOf(3);

		return done();
	});
});
