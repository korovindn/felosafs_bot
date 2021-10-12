const mongoose = require("mongoose");
const config = require("./config.json")

async function initialize(){
    await mongoose.connect(config.mongo, {useNewUrlParser: true, useUnifiedTopology: true});
    console.log('База данных подключена');
}

const user = mongoose.model('user', { 
    id: Number,
    author: String,
    text: String,
    photoUrl: String,
 });

module.exports = {
    mongoose: mongoose,
    initialize: initialize,
    user: user,
};