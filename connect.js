const mongoose = require('mongoose');
mongoose.set("strictQuery", true);


function connectToMongoDB(url) {
    return mongoose.connect(url);
};

module.exports = {
    connectToMongoDB
}