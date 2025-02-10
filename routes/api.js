// Privacy Considerations: Due to the requirement that only 1 like per IP should be accepted, you will have to save IP addresses.
// It is important to remain compliant with data privacy laws such as the General Data Protection Regulation.
// One option is to get permission to save the user's data, but it is much simpler to anonymize it.
// For this challenge, remember to anonymize IP addresses before saving them to the database.
// If you need ideas on how to do this, you may choose to hash the data, truncate it, or set part of the IP address to 0.

"use strict";

const request = require("request");

let stock1 = "";
let stock2 = "";
let like_flag = false;
let url1 = "";
let url2 = "";
let singleStock = true;
let stockData1 = {};
let stockData2 = {};
let options1 = {};
let options2 = {};

module.exports = function (app) {
  app.route("/api/stock-prices").get(async function (req, res) {

    if (Array.isArray(req.query.stock)) {
      singleStock = false;
      stock1 = req.query.stock[0];
      stock2 = req.query.stock[1];
      url1 = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock1}/quote`;
      url2 = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock2}/quote`;
    } else {
      stock1 = req.query.stock;
      url1 = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock1}/quote`;
    }

    like_flag = req.query.like;

    options1 = {
        url: url1,
        json: true,
    };
    
    console.log("Options1: ", options1);

    await new Promise((resolve, reject) => {
      request(options1, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    }).then((body) => {
      stockData1 = { stock: stock1, price: body.close, likes: "TBD" };
      console.log("StockData1: ", stockData1);
    }).catch((error) => {
      res.send(error);
    })

    if (!singleStock) {
      options2 = {
        url: url2,
        json: true,
      };

      await new Promise((resolve, reject) => {
        request(options2, function (error, response, body) {
          if (error) {
            reject(error);
          } else {
            resolve(body);
          }
        });
      })
        .then((body) => {
          stockData2 = { stock: stock2, price: body.close, likes: "TBD" };
          console.log("StockData2: ", stockData2);
        })
        .catch((error) => {
          res.send(error);
        });
    }

    console.log("After requests...");
    console.log("Stock1: " + stock1);
    console.log("Stock2: " + stock2);
    console.log("Like_flag: " + like_flag);
    console.log("URL1: " + url1);
    console.log("URL2: " + url2);
    console.log("SingleStock: " + singleStock);
    console.log("StockData1: ", stockData1);
    console.log("StockData2: ", stockData2);

    res.json({ stockData: singleStock ? stockData1 : [stockData1, stockData2] });
  });
};
