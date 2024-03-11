// const nodemailer = require("nodemailer");

// // Create a transporter object using SMTP transport
// let transporter = nodemailer.createTransport({
//   service: "Gmail",
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: "omagaowoicho@gmail.com",
//     pass: "lvlh xjhs gwwf ywls",
//   },
// });

// // Create email message
// let mailOptions = {
//   from: "omagaowoicho@gmail.com",
//   to: "omagaowi@gmail.com",
//   subject: "HTML Email Example",
//   html: "<h1>Hello!</h1><p>This is an HTML email sent from Node.js using nodemailer.</p>",
// };

// // Send mail with defined transport object
// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     console.log('gg')
//     return console.log(error);
//   }
//   console.log("Message sent: %s", info.messageId);
// });


const mail = require("mail").Mail({
  host: "smtp.gmail.com",
  username: "omagaowoicho@gmail.com",
  password: "lvlh xjhs gwwf ywls",
});

mail
  .message({
    from: "omagaowoicho@gmail.com",
    to: ["omagaowi@gmail.com"],
    subject: "Hello from Node.JS",
  })
  .body("Node speaks SMTP!")
  .send(function (err) {
    if(err){
        console.log(err)
    }else{
         console.log("Sent!");
    }
  });