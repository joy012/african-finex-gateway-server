const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
var admin = require('firebase-admin');
const serviceAccount = require("./config/african-finex-gateway-firebase-adminsdk-m3aag-9a106308e1.json");
require('dotenv').config()

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `${process.env.SITE_NAME}`
});

const uri = `mongodb+srv://${process.env.DB_USER}:${precess.env.DB_PASS}@cluster0.ukskk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
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


    // get buy
    app.get('/buy', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    if (tokenEmail === queryEmail) {
                        buyCollection.find({ email: queryEmail })
                            .toArray((err, documents) => {
                                res.status(200).send(documents);

                            })
                    }
                    else {
                        res.status(401).send('Un-Authorized Access!!')
                    }
                }).catch(function (error) {
                    res.status(401).send('Un-Authorized Access!!')
                });
        }
        else {
            res.status(401).send('Un-Authorized Access!!')
        }
    })

    // post buy
    app.post('/addBuy', (req, res) => {
        const newBuy = req.body;
        buyCollection.insertOne(newBuy)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })



    // get sell
    app.get('/sell', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    if (tokenEmail === queryEmail) {
                        sellCollection.find({ email: queryEmail })
                            .toArray((err, documents) => {
                                console.log(documents)
                                res.status(200).send(documents);

                            })
                    }
                    else {
                        res.status(401).send('Un-Authorized Access!!')
                    }
                }).catch(function (error) {
                    res.status(401).send('Un-Authorized Access!!')
                });
        }
        else {
            res.status(401).send('Un-Authorized Access!!')
        }
    })


    // post sell
    app.post('/addSell', (req, res) => {
        const newSell = req.body;

        sellCollection.insertOne(newSell)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

})

app.listen(process.env.PORT || port);