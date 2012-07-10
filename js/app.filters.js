angular.module('app.filters', [])
   .filter('capitalize', function() {
      return function(input) {
         return input.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
      };
   })
   .filter('feedid', function() {
      return function(input) {
         return input.match( /\/([0-9]+)$/ )[1];
      };
   });
