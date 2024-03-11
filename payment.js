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
    id: "PLN_cu7k3ly30mwip4g",
  },
  {
    code: "exclusive",
    plan: "Exclusive Mentorship",
    price: 200,
    id: "PLN_cu7k3ly30mwip4g",
  },
];


const processTransaction = async (planCode, email, callback) => {
    const thisPlan = plans.filter(function(el){
      return el.code == planCode
    })[0]
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
        Authorization: "Bearer sk_live_3fe7ff54122f79596e91bdaea73372a09fab1e27",
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
          const result = JSON.parse(data)
          callback({
            result: result,
            error: false
          })
        });
      })
      .on("error", (error) => {
         callback({
           result: false,
           error: error,
         });
      });

    req.write(params);
    req.end();
}


module.exports = { processTransaction }