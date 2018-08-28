(function() {

    'use strict';

    angular.module('appName')
      .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
          .state('photoUpload', {
            url: '/photoUpload',
            templateUrl: 'app/photoUpload/photoUpload.html',
            controller: 'photoUploadController'
          });
        $stateProvider
          .state('photoUploadRecruiter', {
            url: '/photoUpload',
            templateUrl: 'app/photoUpload/photoUpload.html',
            controller: 'photoUploadController',
            params:{
	            recruiterIcon:true
            }
          });
      }]);
      
})();
