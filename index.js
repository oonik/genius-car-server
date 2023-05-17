const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bwrtzwz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const serviceCollection = client.db('geniusCar').collection('services');
    const orderCollection = client.db('geniusCar').collection('orders');
    // data read
    app.get('/services', async(req, res)=>{
        const query = {}
        const cursor = serviceCollection.find(query);
        const services = await cursor.toArray();
        res.send(services);
    });

    app.get('/services/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const service = await serviceCollection.findOne(query);
        res.send(service)
    });

    // orders api (data create)
    app.get('/orders', async(req, res)=>{
       let query = {}
       if(req.query.email){
         query = {
           email: req.query.email
         }
       }
       const cursor = orderCollection.find(query)
       const orders = await cursor.toArray();
       res.send(orders);
    });

    app.post('/orders', async(req, res)=>{
       const order = req.body;
       const result = await orderCollection.insertOne(order);
       res.send(result)
    });

    app.patch('/orders/:id', async(req, res)=>{
      const id = req.params.id ;
      const status = req.body.status;
      const query = {_id: new ObjectId(id)};
      const updateDoc = {
        $set: {
          status : status
        }
      }
      const result = await orderCollection.updateOne(query, updateDoc);
      res.send(result)
    })

    app.delete('/orders/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await orderCollection.deleteOne(query);
      res.send(result)
    })
  } finally {
    
  }
}
run().catch(err => console.error(err));


app.get('/', (req, res)=>{
    res.send('Genius car services is running');
});

app.listen(port, ()=>{
    console.log(`genius car service running on port: ${port}`)
})