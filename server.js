const express = require('express');
const bodyParser = require('body-parser');
const port =  process.env.PORT || 3030;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();

const mongodbURI = process.env.MONGODB_URI;
const dbName = 'horarios';

const client = new MongoClient(mongodbURI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false,
      deprecationErrors: true,
    }
});
const db = client.db(dbName);


app.use(bodyParser.json());
app.use(express.static(__dirname +'/public'));

async function getHorasDia(dia){
    try {
        const collection = db.collection('horasDia');
        const documents = await  collection.findOne({ dia: dia });
        return documents;
    } catch (error) {
        console.error('Error al obtener las horas del dia:', error);
        throw error;
    }

}

async function getFechasMes(mes, year) {
    const collectionName = 'fechas';
    try {
        const collection = db.collection(collectionName);
        const documents = await collection.find({mes: mes, year: year}).toArray();
        return documents;
    } catch (error) {
        console.error('Error al obtener los documentos:', error);
        throw error;
    }
}

app.get("/", (req, res) => {
    let currentDate = new Date();
    res.sendFile(__dirname + "/views/main.html");
});

app.post('/horasDia', (req, res) => {
    let dayWeek = req.body.dayWeek;
    dayWeek = parseInt(dayWeek);
    getHorasDia(dayWeek)
    .then(response => {
        res.send(response);
    })
    .catch(error => {
        console.error(error);
        res.status(500).send('Error generando la respuesta.');
    });
});

app.post('/fechasMes', (req, res) => {
    let mes = req.body.mes;
    let year = req.body.year;
    getFechasMes(mes, year)
    .then(response => {
        res.send(response);
    })
    .catch(error => {
        console.error(error);
        res.status(500).send('Error generando la respuesta.');
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
