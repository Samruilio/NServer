'use strict';

angular.module('mean.system').controller('WorkSpaceController', ['$scope', '$state', '$http', '$location', '$stateParams', '$cookieStore', 
    '$modal', '$window', 
    function ($scope, $state, $http, $location, $stateParams, $cookieStore, $modal, $window) {
        $scope.username = $cookieStore.get('username');

        $scope.userLogout = function() {
        	var options = {
        		url: '/scheduler/userLogout', 
        		method: 'post'
        	};

        	$http(options).success(function(data, status, headers, config) {
        		$state.go('login');
        	}).error(function(data, status, headers, config) {
        		alert('The resources requested do not exist!');
        	});
    	}

        $scope.navClass = function (page) {
            var currentRoute = $location.path().substring(1) || 'home';
            return page === currentRoute ? 'active' : '';
        };
}]);