angular.module('app.settings', [])
   .value('$settings', {
     title: 'VIDAL DM', 
     hostname: 'http://localhost:8088',
     search_service: '/rest/imd/packages?page-size=10&q={term}',
     search_placeholder: 'Rechercher une référence'
   });

