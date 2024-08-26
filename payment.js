const https = require("https");

const plans = [
  {
    code: "intermediate",
    plan: "Intermediate Mentorship",
    price: 50,
    id: "PLN_cu7k3ly30mwip4g",
  },
  {
    code: "profitable",
    plan: "Profitable Trader",
    price: 100,
    id: "PLN_w9fggz2ezfe44u9",
  },
  {
    code: "exclusive",
    plan: "Exclusive Mentorship",
    price: 200,
    id: "PLN_omp4zkk597lbobe",
  },
  {
    code: "signals",
    plan: "Premium Signals",
    price: 30,
    id: "PLN_d87553b9gq8mhde",
  },
];


const processTransaction = async (planCode, email, paystackAPI, callback) => {
  const thisPlan = plans.filter(function (el) {
    return el.id == planCode;
  })[0];
  const params = JSON.stringify({
    email: email,
    amount: 100,
    plan: thisPlan.id,
  });

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: "/transaction/initialize",
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackAPI}`,
      "Content-Type": "application/json",
    },
  };

  const req = https
    .request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const result = JSON.parse(data);
        callback({
          result: result,
          error: false,
        });
      });
    })
    .on("error", (error) => {
      console.log(error)
      callback({
        result: false,
        error: error,
      });
    });

  req.write(params);
  req.end();
};

const verifyTransaction = async (ref, paystackAPI, callback) => {
  console.log('d', 
    paystackAPI)
  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: `/transaction/verify/${ref}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${paystackAPI}`,
    },
  };

  const req = https
    .request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const result = JSON.parse(data)
        callback({
          result: result,
          err: false
        })
      });
    })
    .on("error", (error) => {
        callback({
          result: false,
          err: error,
        });
    });

  req.end(); // Add this line to end the request
};



module.exports = { processTransaction, verifyTransaction }