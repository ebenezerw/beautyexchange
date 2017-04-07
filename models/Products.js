var mongoose = require("mongoose")
mongoose.Promise = global.Promise;

var ProductSchema = new mongoose.Schema({
    name: String,
    imageUrl: String,
    link: String,
    description: String,
    username: String,
    userLocation: String,
    upvotes: {type: Number, default: 0},
    created_at: { type: Date, default: Date.now },
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}]
})


ProductSchema.methods.upvote = function (cb) {
    this.upvotes ++
    this.save(cb)
}
mongoose.model("Product", ProductSchema)
