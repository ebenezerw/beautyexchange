var mongoose = require("mongoose")
var crypto = require("crypto")
var jwt = require("jsonwebtoken")

var UserSchema = new mongoose.Schema({
    userName: {type: String, lowercase: true, unique: true},
    hash: String,
    salt: String
})

UserSchema.methods.setPassword = function (password) {
    ths.salt = crypto.randomByte(16).toString("hex")

    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString("hex")
}

UserSchema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString("hex")

    return this.hash === hash
}

UserSchema.methods.generateJWT = function () {
    var today = new Date()
    var exp = new Date(today)
    exp.setDate(today.getDate() + 60)
    return jwt.sign({
        _id: this._id,
        userName: this.userName,
        exp: parseInt(exp.getTime() / 1000),

    }, 'SECRET')
}

mongoose.model("User", UserSchema)