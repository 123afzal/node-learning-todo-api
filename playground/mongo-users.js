/**
 * Created by Syed Afzal
 */
const {MongoClient} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if (err) {
        return console.log('Unable to connect to Server');
    }
    console.log("Connection established successfully");
    const db = client.db("Users");


    // db.collection("todos").insert({
    //     name: "Syed Afzal Hasan",
    //     age: 22,
    //     status: "unmarried"
    // }, (err, result) => {
    //     if (err) return console.log("Internal Server Error");
    //     console.log(JSON.stringify(result.ops));
    // });

    db.collection("todos").findOneAndUpdate(
        {name: "Syed Afzal Hasan"},
        {$set: {status: "married"}, $inc: {age: 1}},
        {$new: true}
    ).then(result=>{
        console.log(JSON.stringify(result));
    });


    // client.close();
});