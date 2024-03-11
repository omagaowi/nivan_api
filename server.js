const express = require('express');
const { processTransaction } = require('./payment')

const app = express()

app.use(express.static('static'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.get('/redirect/payment/:plan', (req, res)=>{
    res.sendFile(__dirname + '/static/auth.html')
})

app.post('/submit/payment/:plan', (req, res)=>{
    const planCode = req.params.plan
    const body = req.body
    processTransaction(planCode, body.email, ({result, err})=>{
        if(!err){
            if(result.status){
                const responseData = result.data
                res.json({
                    status: true,
                    data: responseData
                })
            }else{
              res.json({
                status: false,
                data: 'an error occured',
              });
            }
        }else{
              res.json({
                status: false,
                data: "an error occured",
              });
        }
    })
})

app.listen(3000, (err)=>{
    if(!err){
        console.log('server is running at 3000')
    }else{
        console.log('ERROR STARTING SERVER')
        console.log(err)
    }
})