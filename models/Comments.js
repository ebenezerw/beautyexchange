var mongoose = require("mongoose")
mongoose.Promise = global.Promise;

var CommentSchema = new mongoose.Schema({
    body: String,
    username: String,
    product: {type: mongoose.Schema.Types.ObjectId, ref: "Product"}
})

mongoose.model("Comment", CommentSchema)
