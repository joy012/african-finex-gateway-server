const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;



const uri = `mongodb+srv://finexGateway:50114400JoY@cluster0.ukskk.mongodb.net/african-finex-gateway?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(cors());
app.use(express.static('services'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const port = 3283;


client.connect(err => {
    const buyCollection = client.db("african-finex-gateway").collection("buy");
    const sellCollection = client.db("african-finex-gateway").collection("sell");

    app.get('/buy', (req, res) => {
        buyCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
// buy post
    app.post('/addBuy', (req, res) => {
        const newBuy = req.body;
        buyCollection.insertOne(newBuy)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })


    app.get('/sell', (req, res) => {
        sellCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    // sell post
    app.post('/addSell', (req, res) => {
        const newSell = req.body;
        
        sellCollection.insertOne(newSell)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

})

app.listen(process.env.PORT || port);