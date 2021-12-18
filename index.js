const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ocrjv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db('car-rent');
        const toursCollection = database.collection('cars-info');
        const rentsCollection = database.collection('rents');
        const usersCollection = database.collection('users');

        // GET API
        app.get('/carscollection', async (req, res) => {
            const cursor = toursCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let tours = [];
            const count = await cursor.count();
            if (page) {
                tours = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                tours = await cursor.toArray();
            }
            res.send({
                count,
                tours
            });
        })

        app.get('/carscollection/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tour = await toursCollection.findOne(query);
            res.send(tour);
        })

        app.post('/rents', async (req, res) => {
            const newRent = req.body;
            const result = await rentsCollection.insertOne(newRent);
            res.json(result);
        })

        app.get('/rents', async (req, res) => {
            const cursor = rentsCollection.find({});
            users = await cursor.toArray();
            res.send(users);
        })
        // // DELETE API
        app.delete('/rents/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await rentsCollection.deleteOne(query);
            res.json(result);
        })

        // // UPDATE API
        app.put('/rents/:id', async (req, res) => {
            const id = req.params.id;
            const updateUser = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upset: true };
            const updateDoc = {
                $set: {
                    status: updateUser.status
                },
            }
            const result = await rentsCollection.updateOne(filter, updateDoc, options);
            console.log(result);
            res.json(result);
        })

        // Admin 
        // user get api
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        // user Post Api
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        // user Put Api
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // User Admin Put Api
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Prosenjit Car Rent Server is running successfully');
});

app.get('/test', (req, res) => {
    res.send('Prosenjit Car Rent Server is ok');
});

app.listen(port, () => {
    console.log('server is up and running at', port);
})