'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', '$state', function ($scope, $state) {
    $scope.login = function(){
    	$state.go('login');
    };
}]);
