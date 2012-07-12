angular.module('app', ['app.filters', 'app.atom2json', 'app.settings'])
   .config(function($routeProvider, $locationProvider, $httpProvider) {
      $locationProvider.hashPrefix('!');
      $routeProvider.otherwise({controller:FeedCtrl, templateUrl:'partial/feed.html'});
   });

function MainCtrl($scope, $location, $settings) {
   document.title = $scope.title = $settings.title;
   $scope.placeholder = $settings.search_placeholder; 

   $scope.search = function() {
      $location.url( $settings.search_service.replace('{term}', $scope.query) );
   };

   $scope.$watch(function() { return $location.search(); },
                 function(querystring) { $scope.query = querystring.q; });
}

function FeedCtrl($rootScope, $scope, $location, $atom2json, $http, $settings) {
   $scope.toggleTableView = function() {
      $rootScope.tableview = (typeof $rootScope.tableview === "undefined") ? true : !$rootScope.tableview;
   };

   $scope.toggleSrcView = function() {
      return $scope.srcview = !$scope.srcview;
   };

   $scope.prettyPrint = prettyPrint;

   if ($location.url() !== "") {
      $scope.loading="true";

      $http.get( $settings.hostname+$location.url(), {headers: $settings.http_headers} )
         .success( function(data) { 
            delete $scope.loading;

            $scope.xml = data;
            $scope.feed = $atom2json(data).feed;
            document.title = $scope.feed.title;

            if (typeof $scope.feed._modules.opensearch !== "undefined") {
               var os = $scope.feed._modules.opensearch,
                   total = os.totalResults / os.itemsPerPage;
               $scope.opensearch = {
                  current: os.startIndex,
                  results: os.totalResults,
                  total: Math.floor(total) === total ? total : Math.floor(total) + 1,
                  offset: (os.startIndex-1) * os.itemsPerPage,
                  perpage: os.itemsPerPage
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
