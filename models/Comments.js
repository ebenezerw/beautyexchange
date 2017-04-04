var mongoose = require("mongoose")

var CommentSchema = new mongoose.Schema({
    body: String,
    userName: String,
    product: {type: mongoose.Schema.Types.ObjectId, ref: "Product"}
})

mongoose.model("Comment", CommentSchema)
