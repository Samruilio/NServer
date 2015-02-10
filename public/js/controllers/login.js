'use strict';

angular.module('mean.system').controller('LoginController', ['$scope', '$state', '$http', '$cookieStore', 
	function ($scope, $state, $http, $cookieStore) {
		$scope.username = '';
		$scope.password = '';

		$scope.submit = function() {
			if ($scope.username !== '' && $scope.password !== '') {
				var options = {
					url: '/scheduler/userLogin', 
					method: 'post', 
					headers: {'Content-Type': 'application/x-www-form-urlencoded'}, 
					transformRequest: function(obj) {
						var str = [];
						for(var p in obj)
							str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
						return str.join("&");
					}, 
					data: {
						username: $scope.username, 
						password: $scope.password
					}
				};

				$http(options).success(function(data, status, headers, config) {
					if(data.islogin === null || data.islogin === '' || data.islogin === 'false') {
						alert('This user does not exist!');
					} else if(data.islogin === 'true') {
						$cookieStore.put('username', $scope.username);
						//alert('Login successful!');
						$state.go('workspace.viewtasks');
					}
				}).error(function(data, status, headers, config) {
					alert('The resources requested do not exist!');
				});
			}
		};
	}]);