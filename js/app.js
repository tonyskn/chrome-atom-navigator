angular.module('app', ['app.filters', 'app.atom2json', 'app.settings'])
   .config(function($routeProvider, $locationProvider) {
      $locationProvider.hashPrefix('!');
      $routeProvider.otherwise({controller:FeedCtrl, templateUrl:'partial/feed.html'});
   });

function FormCtrl($scope, $location, $settings) {
   document.title = $scope.title = $settings.title;
   $scope.placeholder = $settings.search_placeholder; 

   $scope.search = function() {
      $location.url( $settings.search_service.replace('{term}', $scope.query) );
   };

   $scope.$watch(function() { return $location.search(); },
                 function(querystring) { $scope.query = querystring.q; });
}

function FeedCtrl($scope, $location, $atom2json, $http, $settings) {
   if ($location.url() !== "") {
      $scope.settings = $settings;
      $scope.loading="true";

      $http.get( $settings.hostname+$location.url() )
         .success( function(data) { 
            delete $scope.loading;

            $scope.feed = $atom2json(data).feed;
            document.title = $scope.feed.title;

            if (typeof $scope.feed._modules.opensearch !== "undefined") {
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
               msg: {'404': 'Not found', '403': 'Forbidden'}[''+status] || "Unexpected error",
               url: $location.url()
            };
         } );
   }
}
