var mongoose = require("mongoose")

var ProductSchema = new mongoose.Schema({
    name: String,
    imageUrl: String,
    link: String,
    description: String,
    userName: String,
    userLocation: String,
    upvotes: {type: Number, default: 0},
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: "comment"}]
})


ProductSchema.methods.upvote = function (cb) {
    this.upvotes ++
    this.save(cb)
}
mongoose.model("Product", ProductSchema)
