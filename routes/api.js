// Privacy Considerations: Due to the requirement that only 1 like per IP should be accepted, you will have to save IP addresses.
// It is important to remain compliant with data privacy laws such as the General Data Protection Regulation.
// One option is to get permission to save the user's data, but it is much simpler to anonymize it.
// For this challenge, remember to anonymize IP addresses before saving them to the database.
// If you need ideas on how to do this, you may choose to hash the data, truncate it, or set part of the IP address to 0.

"use strict";

const request = require("request");

module.exports = function (app) {
  app.route("/api/stock-prices").get(function (req, res) {
    const stock = req.query.stock;
    const like_flag = req.query.like;
    const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
    const options = {
      stock: stock,
      like_flag: like_flag,
      method: "GET",
      uri: url,
      json: true,
    };

    request(options, function (error, response, body) {
      if (error) {
        res.send(error);
      } else {
        res.json({ stockData: { stock: stock, price: body.close, likes: "TBD" } });
      }
    });
  });
};
