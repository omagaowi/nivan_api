const paymentSuccessTemmp = (emailData) => {
    const date = new Date(emailData.last_paid);
    const next_date = new Date(date.getTime() + 2592000000);
    const timeProcessed = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    const nextBillingDate = `${next_date.getDate()}/${next_date.getMonth()}/${next_date.getFullYear()} ${next_date.getHours()}:${next_date.getMinutes()}:${next_date.getSeconds()}`;
    const html = `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
        }
        .header {
            background-color: #7b00ff;
            padding: 20px;
            text-align: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
        }
        .content {
            text-align: center;
            padding: 20px;
        }
        .content h1 {
            color: #333;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .content p {
            font-size: 16px;
            color: #555;
        }
        .content .code {
            font-size: 32px;
            color: #333;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #777;
        }
        table{
            width: 100%;
        }
        td{
            margin: 0;
        }
        tr{
            width: 90%;
            height: 40px;
            background: #dddddd;
            margin: 0;
        }


        tr.head{
             background: #a8a8a8;
        }

        tr.body td{
            font-size: 13px;
        }

    </style>
</head>
<body>
    <div class="container">
        <div class="header">
           Payment Successful!
        </div>
        <div class="content">
            <h1>Please Verify your Transaction!</h1>
            <p>Your subscription for ${emailData.plan} is now active!</p>
            <h3>Transaction Details</h3>
            <table>
                <tr class="head">
                    <td>Time Processed</td>
                    <td>Card</td>
                    <td>Next Billing Date</td>
                    <td>Amount Paid</td>
                </tr>
                <tr class="body">
                    <td>${timeProcessed}</td>
                    <td>${emailData.card_details.brand} ${emailData.card_details.last4}</td>
                    <td>${nextBillingDate}</td>
                    <td>${emailData.amount}</td>
                </tr>
            </table>
            <p>Use the link below to verify your transaction and gain access  all the program resources and services</p>
            <a href="https://www.nivanfx.com/payment/verify?trxref=${emailData.reference}&reference=${emailData.reference}">https://www.nivanfx.com/payment/verify?trxref=${emailData.reference}&reference=${emailData.reference}</a>
        </div>
        <div class="footer">
            &copy; 2024 Nivan FX. All rights reserved.
        </div>
    </div>
</body>
</html>

    `;
return html;
}

module.exports = { paymentSuccessTemmp }