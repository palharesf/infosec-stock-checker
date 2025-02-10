const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    test('Viewing one stock', function (done) {
        chai.request(server)
            .get('/api/stock-prices/?stock=GOOG')
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, {
                  stockData: {
                    stock: "GOOG",
                    price: 187.14,
                    likes: 0,
                  },
                });
                done();
            });
    });

    test('Viewing one stock and liking it', function (done) {
        chai.request(server)
            .get('/api/stock-prices/?stock=GOOG&like=true')
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, {
                  stockData: {
                    stock: "GOOG",
                    price: 187.14,
                    likes: 1,
                  },
                });
                done();
            });
    });

    test('Viewing the same stock and liking it again', function (done) {
        chai.request(server)
            .get('/api/stock-prices/?stock=GOOG&like=true')
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, {
                  stockData: {
                    stock: "GOOG",
                    price: 187.14,
                    likes: 1,
                  },
                });
                done();
            });
    });

    test('Viewing two stocks', function (done) {
        chai.request(server)
            .get('/api/stock-prices/?stock=GOOG&stock=MSFT')
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, {
                  stockData: [
                    {
                      stock: "GOOG",
                      price: 187.14,
                      rel_likes: 1,
                    },
                    {
                      stock: "MSFT",
                      price: 409.75,
                      rel_likes: -1,
                    },
                  ],
                });
                done();
            });
    });

    test('Viewing two stocks and liking them', function (done) {
        chai.request(server)
            .get('/api/stock-prices/?stock=GOOG&stock=MSFT&like=true')
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, {
                  stockData: [
                    {
                      stock: "GOOG",
                      price: 187.14,
                      rel_likes: 0,
                    },
                    {
                      stock: "MSFT",
                      price: 409.75,
                      rel_likes: 0,
                    },
                  ],
                });
                done();
            });
    });

});

