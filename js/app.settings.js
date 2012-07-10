angular.module('app.settings', [])
   .value('$settings', (localStorage.settings && JSON.parse(localStorage.settings)) || {
     title: 'Title', 

     hostname: 'http://localhost',

     search_service: '/rest/api/search?page-size=10&q={term}',
     search_placeholder: 'Search my API',

     http_headers: {
      'Authorization': 'my-authorization-header'     
     }
   });

