'use strict';

angular.module('mean.system').controller('WorkSpaceController', ['$scope', '$state', '$http', '$location', '$stateParams', '$cookieStore', 
    '$modal', '$window', 
    function ($scope, $state, $http, $location, $stateParams, $cookieStore, $modal, $window) {
        $scope.username = $cookieStore.get('username');

        $scope.navClass = function (page) {
            var currentRoute = $location.path().substring(1) || 'home';
            return page === currentRoute ? 'active' : '';
        };
}]);