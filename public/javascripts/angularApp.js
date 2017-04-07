angular.module("beautyExchange", ['ui.router', 'ngAnimate'])
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
                product: ["$stateParams", "products", function ($stateParams, products) {
                    return products.get($stateParams.id)
                }]
            }
        })
        .state('login', {
            url: '/login',
            templateUrl: '/login.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'auth', function($state, auth){
                if(auth.isLoggedIn()){
                  $state.go('home');
                }
            }]
        })
        .state("register", {
            url: "/register",
            templateUrl: "/register.html",
            controller: "AuthCtrl",
            onEnter: ["$state", "auth", function ($state, auth) {
                if (auth.isLoggedIn()) {
                    $state.go("home")
                }
            }]
        })

        $urlRouterProvider.otherwise("home")
    }
])
.factory("products", ["$http", "auth", function ($http, auth) {
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
        return $http.post("/products", product, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function (data) {
            o.products.push(data)
        })
    }
    o.upvote = function (product) {
        return $http.put("/products/" + product._id + "/upvote", null, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function (data) {
            product.upvotes ++
        })
    }

    o.addComment = function (id, comment) {
        return $http.post("/products/" + id + "/comments", comment, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        })
        }

    return o
}])
.factory('auth', ['$http', '$window', '$rootScope', function($http, $window, $rootScope){
   var auth = {
    saveToken: function (token){
      $window.localStorage['flapper-news-token'] = token;
    },
    getToken: function (){
      return $window.localStorage['flapper-news-token'];
    },
    isLoggedIn: function(){
      var token = auth.getToken();

      if(token){
        var payload = JSON.parse($window.atob(token.split('.')[1]));

        return payload.exp > Date.now() / 1000;
      } else {
        return false;
      }
    },
    currentUser: function(){
      if(auth.isLoggedIn()){
        var token = auth.getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));

        return payload.username;
      }
    },
    register: function(user){
      return $http.post('/register', user).success(function(data){
        auth.saveToken(data.token);
      });
    },
    logIn: function(user){
      return $http.post('/login', user).success(function(data){
        auth.saveToken(data.token);
      });
    },
    logOut: function(){
      $window.localStorage.removeItem('flapper-news-token');
    }
  };

  return auth;
}])
.controller("MainController", [
    "$scope",
    "products",
    "auth",
    function($scope, products, auth){
        $scope.products = products.products
        $scope.addProduct = function () {
            if (!$scope.name) {
                swal("Oops...", "You must enter a Product Name", "error");
                return;
            }
            products.create({
                name: $scope.name,
                link: $scope.link,
                imageUrl: $scope.imageUrl,
                description: $scope.description,
                userLocation: $scope.userLocation
            })
            $scope.name=""
            $scope.link= ""
            $scope.imageUrl= ""
            $scope.description= ""
            $scope.userLocation= ""
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
    "auth",
    function ($scope, $stateParams, products, product, auth) {

        $scope.product = product

        $scope.addComment = function () {
            if (!$scope.body) {
                swal("Oops...", "Body of comment cannot be empty", "error");
                return;
            }
            products.addComment(product._id, {
                body: $scope.body,
                username: "user",
                upvotes: 0
            }).success(function (comment) {
                $scope.product.comments.push(comment)
            })

            $scope.body = ""
        }

    }
])
.controller('AuthCtrl', [
    '$scope',
    '$state',
    'auth',
    function($scope, $state, auth){
        $scope.user = {};

        $scope.register = function(){
            auth.register($scope.user).error(function(error){
                $scope.error = error;
            }).then(function(){
                $state.go('home');
            });
            };

            $scope.logIn = function(){
                auth.logIn($scope.user).error(function(error){
                    $scope.error = error;
                }).then(function(){
                    $state.go('home');
                });
      };
}])
.controller("NavCtrl", [
    "$scope",
    "auth",

    function ($scope, auth) {
        $scope.isLoggedIn = auth.isLoggedIn
        $scope.currentUser = auth.currentUser
        $scope.logOut = auth.logOut
    }
])
