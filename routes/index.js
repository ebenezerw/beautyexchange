var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

var mongoose = require("mongoose");
var Product = mongoose.model("Product");
var Comment = mongoose.model("Comment");
var User = mongoose.model("User");

var auth = jwt({secret: 'SECRET', userProperty: 'payload'})

// GET request for all products
router.get("/products", function (req, res, next) {
    Product.find(function (err, products) {
        if (err) {next(err) }
        res.json(products)

    })
})


// POST request for new products
router.post("/products", auth, function (req, res, next) {
    var product = new Product(req.body)
    product.username = req.payload.username

    product.save(function (err, product) {
        if (err) {
            return next(err)
        }

        res.json(product)

    })
})

// preload product objects using params
router.param("product", function (req, res, next, id) {
    var query = Product.findById(id)

    query.exec(function (err, product) {
        if (err) { return next(err)}
        if (!product) { return next(new Error("can\'t find product"))}

        req.product = product
        return next()
    })
})

router.param("comment", function (req, res, next, id) {
    var query = Comment.findById(id)

    query.exec(function (err, comment) {
        if (err) { return next(err)}
        if (!comment) { return next(new Error("can\'t find comment"))}

        req.comment = comment
        return next()
    })
})

// GET route for individual products
router.get("/products/:product", function (req, res) {
    req.product.populate("comments", function (err, product) {
        res.json(product)
    })

})

// PUT request to update individual products with vote count
router.put("/products/:product/upvote", auth, function (req, res, next) {
    req.product.upvote(function (err, product) {
        if (err) {
            return next(err)
        }

        res.json(product)
    })
})

// POST route for adding comments to a product
router.post("/products/:product/comments", auth, function  (req, res, next) {
    var comment = new Comment(req.body)
    comment.post = req.product
    comment.username = req.payload.username

    comment.save(function (err, comment) {
        if (err) {
            return next(err)
        }

        req.product.comments.push(comment)
        req.product.save(function (err, product) {
            if (err) {
                return next(err)
            }

            res.json(comment)
        })
    })
})


router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
  });
});




module.exports = router;
