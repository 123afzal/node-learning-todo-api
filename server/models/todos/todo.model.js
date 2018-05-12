/**
 * Created by Syed Afzal
 */
const mongoose = require('mongoose');

var Todo = mongoose.model('Todo', {
    text : {
        type: String,
        trim: true,
        required: true
    },
    completed:{
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default:null
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

module.exports = {Todo};
