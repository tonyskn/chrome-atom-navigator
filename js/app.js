angular.module('app', ['app.filters', 'app.atom2json'])
   .config(function($routeProvider, $locationProvider) {
      $locationProvider.hashPrefix('!');
      $routeProvider.otherwise({controller:FeedCtrl, templateUrl:'partial/feed.html'});
   });

function FormCtrl($scope, $location) {
   document.title = $scope.placeholder = "Rechercher une référence...";

   $scope.search = function() {
      $location.url("/rest/imd/products?q="+$scope.query);
   };

   $scope.$watch(function() { return $location.search(); },
                 function(querystring) { $scope.query = querystring.q; });
}

function FeedCtrl($scope, $location, $atom2json, $http) {
   if ($location.url() !== "") {
      var link = "http://localhost:8088"+$location.url();

      $scope.loading="true";

      $http.get(link)
         .success( function(data) { 
            delete $scope.loading;

            $scope.feed = $atom2json(data).feed;
            document.title = $scope.feed.title;

            if ($scope.feed._modules.opensearch.startIndex) {
               var os = $scope.feed._modules.opensearch;
               $scope.opensearch = {
                  current: os.startIndex,
                  results: os.totalResults,
                  total: 1^os.totalResults/os.itemsPerPage,
                  offset: (os.startIndex-1) * os.itemsPerPage
               };
            } 
         })
         .error( function(err, status) { 
            delete $scope.loading;

            document.title = "Euh...";

            $scope.err = {
               msg: (status === 404) ?  "Not found" : "Unexpected error",
               url: $location.url()
            };
         } );
   }
}
