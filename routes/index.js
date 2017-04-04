var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

var mongoose = require("mongoose")
var Product = mongoose.model("Product")
var Comment = mongoose.model("Comment")


// GET request for all products
router.get("/products", function (req, res, next) {
    Product.find(function (err, products) {
        if (err) {next(err) }
        res.json(products)

    })
})


// POST request for new products
router.post("/products", function (req, res, next) {
    var product = new Product(req.body)

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
router.put("/products/:product/upvote", function (req, res, next) {
    req.product.upvote(function (err, product) {
        if (err) {
            return next(err)
        }

        res.json(product)
    })
})

// POST route for adding comments to a product
router.post("/products/:product/comments", function  (req, res, next) {
    var comment = new Comment(req.body)
    comment.post = req.product

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




module.exports = router;
