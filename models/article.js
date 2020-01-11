const mongoose = require("mongoose");

const Schema = mongoose.Schema
const articleSchema = new Schema ({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    comment: [{
        type: Schema.Types.ObjectId,
        ref: "comment"
    }]
});

var Article = mongoose.model("Article", articleSchema)
module.exports = Article;