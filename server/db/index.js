/**
 * Created by Syed Afzal
 */
var mongoose = require('mongoose');

mongoose.promise = global.promise;
mongoose.connect("mongodb://localhost:27017/TodoApp");


module.exports = {mongoose};