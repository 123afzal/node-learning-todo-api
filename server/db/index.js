/**
 * Created by Syed Afzal
 */
var mongoose = require('mongoose');

mongoose.promise = global.promise;
mongoose.connect(process.env.MONGODB_URI);


module.exports = {mongoose};