/**
 * Created by Syed Afzal
 */
const {MongoClient} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if (err) {
        return console.log('Unable to connect to Server');
    }
    console.log("Connection established successfully");
    const db = client.db("TodosApp");

    db.collection("todos").find().count().then(count => {
        console.log("Count of TODOS collection : ", count);
    });

    // db.collection("todos").insert({
    //     name: "Listing the Cities",
    //     status: false
    // }, (err, result) => {
    //     if (err) return console.log("Internal Server Error");
    //     console.log(JSON.stringify(result.ops));
    // });


    client.close();
});