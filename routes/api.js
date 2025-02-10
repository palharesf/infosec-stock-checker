// Privacy Considerations: Due to the requirement that only 1 like per IP should be accepted, you will have to save IP addresses.
// It is important to remain compliant with data privacy laws such as the General Data Protection Regulation.
// One option is to get permission to save the user's data, but it is much simpler to anonymize it.
// For this challenge, remember to anonymize IP addresses before saving them to the database.
// If you need ideas on how to do this, you may choose to hash the data, truncate it, or set part of the IP address to 0.

"use strict";

const request = require("request");
const crypto = require("crypto");

const likeDB = new Map();

const ipHash = (ip) => crypto.createHash("sha256").update(ip).digest("hex");

function addLike(hashedIp, stock) {
  if (!likeDB.has(stock)) {
    likeDB.set(stock, new Set());
  }
  likeDB.get(stock).add(hashedIp);
}

function getLikeCount(stock) {
  return likeDB.get(stock) ? likeDB.get(stock).size : 0;
}

module.exports = function (app) {
  app.route("/api/stock-prices").get(async function (req, res) {

    let stock1 = "";
    let stock2 = "";
    let like_flag = false;
    let url1 = "";
    let url2 = "";
    let singleStock = true;
    let stockData = {};
    let stockData1 = {};
    let stockData2 = {};
    let options1 = {};
    let options2 = {};
    let ip = "";
    let hashedIp = "";
    let rel_likes = 0;

    // IP Masking
    ip =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    hashedIp = await ipHash(ip);

    // Handler for single stock request or multi-stock comparison
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

    // Handler for likes
    if (like_flag === "true" && singleStock) {
      if (getLikeCount(stock1) === 0 || !likeDB.get(stock1).has(hashedIp)) {
        addLike(hashedIp, stock1);
      }
    } else if (like_flag === "true" && !singleStock) {
      if (getLikeCount(stock1) === 0 || !likeDB.get(stock1).has(hashedIp)) {
        addLike(hashedIp, stock1);
      }
      if (getLikeCount(stock2) === 0 || !likeDB.get(stock2).has(hashedIp)) {
        addLike(hashedIp, stock2);
      }
    } 

    // Setup for requests
    options1 = {
      url: url1,
      json: true,
    };

    await new Promise((resolve, reject) => {
      request(options1, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    })
      .then((body) => {
        stockData1 = { stock: stock1, price: body.close, likes: getLikeCount(stock1) };
      })
      .catch((error) => {
        res.send(error);
      });
    
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
          stockData2 = { stock: stock2, price: body.close, likes: getLikeCount(stock2) };
        })
        .catch((error) => {
          res.send(error);
        });
    }

    stockData = singleStock ? stockData1 : [stockData1, stockData2];

    if (!singleStock) {
      rel_likes = stockData1.likes - stockData2.likes;
      delete stockData1.likes;
      delete stockData2.likes;
      stockData1.rel_likes = parseInt(rel_likes);
      stockData2.rel_likes = parseInt(-rel_likes);
    }

    console.log (stockData);
    res.json({ stockData });
  });
};
