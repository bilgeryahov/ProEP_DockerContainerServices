/**
 * @file test.js
 *
 * Tests for the Payment Service.
 *
 * @author Bilger Yahov <bayahov1@gmail.com>
 * @version 1.0.0
 * @copyright © 2017 Code Ninjas, all rights reserved.
 */

`use strict`;

// Dependencies.
const should = require('chai').should();

// Testing...
const foo = 'bar';
const beverages = {
	tea: [ 'chai', 'matcha', 'oolong']
};

foo.should.be.a('string');
foo.should.equal('bar');
foo.should.have.lengthOf(3);
beverages.should.have.property('tea').with.lengthOf(3);