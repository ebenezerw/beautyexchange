angular.module("beautyExchange", ['ui.router'])

.config([
    "$stateProvider",
    "$urlRouterProvider",
    function($stateProvider, $urlRouterProvider){
        $stateProvider

        .state('home', {
            url: '/home',
            templateUrl: '/home.html',
            controller: 'MainController',
            resolve: {
                productPromise: ["products", function (products) {
                    return products.getAll()
                }]
            }
        })

        .state("products", {
            url: "/products/{id}",
            templateUrl: "/products.html",
            controller: "ProductsController",
            resolve: {
                post: ["$stateParams", "products", function ($stateParams, products) {
                    return products.get($stateParams.id)
                }]
            }
        })

        $urlRouterProvider.otherwise("home")
    }
])

.factory("products", ["$http", function ($http) {
    var o = {
        products: []
    }

    o.getAll = function () {
        return $http.get("/products").success(function(data){
            angular.copy(data, o.products)
        })
    }

    o.get = function (id) {
        return $http.get("/products/" + id).then(function (res) {
            return res.data
        })
    }

    o.create = function (product) {
        return $http.post("/products", product).success(function (data) {
            o.products.push(data)
        })
    }
    o.upvote = function (product) {
        return $http.put("/products/" + product._id + "/upvote").success(function (data) {
            product.upvotes ++
        })
    }

    o.addComment = function (id, comment) {
        return $http.post("/products/" + id + "/comments", comment)
        }

    return o
}])

.controller("MainController", [
    "$scope",
    "products",
    function($scope, products){
        $scope.products = products.products
        $scope.addProduct = function () {
            if (!$scope.name) {
                swal("Oops...", "You must enter a Product Name", "error");
                return;
            }
            products.create({
                title: $scope.name,
                link: $scope.link,
                upvotes: 0,
            })
            $scope.name=""
            $scope.link= ""
        }

        $scope.incrementUpvotes = function (product) {
            products.upvote(product);
        }
    }
])

.controller("ProductsController", [
    "$scope",
    "$stateParams",
    "products",
    "product",
    function ($scope, $stateParams, products, product) {

        $scope.product = product

        $scope.addComment = function () {
            if (!$scope.body) {
                swal("Oops...", "Body of comment cannot be empty", "error");
                return;
            }
            products.addComment(product._id, {
                body: $scope.body,
                userName: "user",
                upvotes: 0
            }).success(function (comment) {
                $scope.product.comments.push(comment)
            })

            $scope.body = ""
        }

    }
])
