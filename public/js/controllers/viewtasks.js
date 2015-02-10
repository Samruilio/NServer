'use strict';

angular.module('mean.system').controller('ViewTasksController', ['$scope', '$state', '$http', '$cookieStore', '$filter', 
	function ($scope, $state, $http, $cookieStore, $filter) {

      $scope.booleans = [
        {value: 'true'}, 
        {value: 'false'}
      ];

      $scope.repeatModes = [
        {name: 'Once'}, 
        {name: 'Monthly'}, 
        {name: 'Monthly Previous Month'}, 
        {name: 'Weekly'}, 
        {name: 'Daily'}
      ];

      $scope.accountAddrs = [
        {name: 'communico'}, 
        {name: 'traveledge'}, 
        {name: 'thetraveldepartment'}, 
        {name: 'gsstravel'}
      ];

      $scope.exportTypes = [
        {name: 'PRISM'}, 
        {name: 'CLIENT'}, 
        {name: 'RAW_DATA'}, 
        {name: 'CREDITOR'}, 
        {name: 'iBank Extract'}, 
        {name: 'DEBTOR'}
      ];

      $scope.dateTypes = [
        {name: 'Departure Date'}, 
        {name: 'Booking Date'}, 
        {name: 'Issue Date'}, 
        {name: 'Invoice Date'}, 
        {name: 'Service Date'}
      ];

      $scope.segmentTypes = [
        {name: 'TKT, HTL & CAR only'}, 
        {name: 'All except Flight'}, 
        {name: 'Bus'}, 
        {name: 'Car'}, 
        {name: 'Cruise'}, 
        {name: 'Departure Tax'}, 
        {name: 'Ferry'}, 
        {name: 'Flight'}, 
        {name: 'Foreign Exchange'}, 
        {name: 'Hotel'}, 
        {name: 'Insurance'}, 
        {name: 'MISC Costing'}, 
        {name: 'Miscellaneous'}, 
        {name: 'Package'}, 
        {name: 'Service Fee'}, 
        {name: 'Ticket'}, 
        {name: 'Tour'}, 
        {name: 'Train'}, 
        {name: 'Transfer'}, 
        {name: 'Visa'}
      ];

  		$scope.fetchTasks = function() {
  			var options = {
  				url: '/scheduler/tasks', 
  				method: 'post'
  			};
  			sendRequest(options);
  		};

      $scope.deleteTask = function(task) {
        var index = $scope.tasks.indexOf(task);
        $scope.tasks.splice(index, 1);

        var options = {
          url: '/scheduler/deleteTask', 
          method: 'post', 
          data: {
            _id: task._id
          }
        };

        $http(options).success(function(data, status, headers, config) {
          if(data.task === null || data.task === '') {
            alert('Failed to delete task!');
          } else {
            //alert('Task deleted!');
          }
        }).error(function(data, status, headers, config) {
          alert('The resources requested do not exist!');
        });
      };

      $scope.modifyTask = function(task) {

      };

  		var sendRequest = function(options) {
  			$http(options).success(function(data, status, headers, config) {
  				if(data.tasks === null || data.tasks === '') {
  					alert('Failed to fetch tasks!');
  				} else {
  					//alert('Tasks fetched!');
            $scope.tasks = data.tasks;
  				}
  			}).error(function(data, status, headers, config) {
  				alert('The resources requested do not exist!');
  			});
  		};
	}]);