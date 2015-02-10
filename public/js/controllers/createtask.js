'use strict';

angular.module('mean.system').controller('CreateTaskController', ['$scope', '$state', '$http', '$cookieStore', '$filter', 
	function ($scope, $state, $http, $cookieStore, $filter) {
		$scope.taskName = '';
		$scope.startTime = '';
		$scope.startTimePoint = new Date();
		$scope.exportStartDate = '';
		$scope.exportEndDate = '';

		$scope.isStartTimeOpened = false;
		$scope.isExportStartDateOpened = false;
		$scope.isExportEndDateOpened = false;

		$scope.exportDateFormat = 'dd-MM-yyyy';
		$scope.startTimeFormat = 'dd-MM-yyyy';
		$scope.dateOptions = {
			formatYear: 'yy',
		    startingDay: 1
		};
		$scope.minDate = new Date();

		$scope.hstep = 1;
  		$scope.mstep = 15;
  		$scope.ismeridian = true;

  		$scope.repeatMode = '';
  		$scope.repeatModes = [
  			{name: 'Once'}, 
			{name: 'Monthly'}, 
			{name: 'Monthly Previous Month'}, 
			{name: 'Weekly'}, 
			{name: 'Daily'}
  		];

  		$scope.accountName = '';
  		$scope.accountPass = '';

  		$scope.accountAddr = '';
  		$scope.accountAddrs = [
  			{name: 'communico'}, 
  			{name: 'traveledge'}, 
  			{name: 'thetraveldepartment'}, 
  			{name: 'gsstravel'}
  		];

  		$scope.exportType = '';
  		$scope.exportTypes = [
  			{name: 'PRISM'}, 
  			{name: 'CLIENT'}, 
  			{name: 'RAW_DATA'}, 
  			{name: 'CREDITOR'}, 
  			{name: 'iBank Extract'}, 
  			{name: 'DEBTOR'}
  		];

  		$scope.debtor = '';

  		$scope.dateType = '';
  		$scope.dateTypes = [
  			{name: 'Departure Date'}, 
  			{name: 'Booking Date'}, 
  			{name: 'Issue Date'}, 
  			{name: 'Invoice Date'}, 
  			{name: 'Service Date'}
  		];

  		$scope.segmentType = '';
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

  		$scope.emailto = '';
  		$scope.exportemailto = '';

  		$scope.createTask = function() {
  			if(!checkEmptyField()) {
  				return;
  			}
  			var options = {
  				url: '/scheduler/createTask', 
  				method: 'post', 
  				headers: {'Content-Type': 'application/x-www-form-urlencoded'}, 
  				transformRequest: function(obj) {
  					var str = [];
  					for(var p in obj)
  						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
  					return str.join("&");
  				}, 
  				data: {
  					name: $scope.taskName, 
  					creator: $cookieStore.get('username'), 
  					createtime: $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'), 
  					starttime: $filter('date')($scope.startTime, 'yyyy-MM-dd') + ' ' + 
  						$filter('date')($scope.startTimePoint, 'HH:mm:ss'), 
  					repeat: $scope.repeatMode, 
  					accountname: $scope.accountName, 
  					accountpass: $scope.accountPass, 
  					accountaddr: $scope.accountAddr, 
  					exporttype: $scope.exportType, 
  					debtor: $scope.debtor, 
  					datetype: $scope.dateType, 
  					startdate: $filter('date')($scope.exportStartDate, $scope.exportDateFormat), 
  					enddate: $filter('date')($scope.exportEndDate, $scope.exportDateFormat), 
  					segmenttype: $scope.segmentType, 
  					emailto: $scope.emailto, 
  					exportemailto: $scope.exportemailto
  				}
  			};
  			sendRequest(options);
  		};

  		var checkEmptyField = function() {
  			if($scope.taskName && $scope.startTime && $scope.repeatMode && 
  				$scope.accountName && $scope.accountPass && $scope.accountAddr && 
  				$scope.exportType && $scope.dateType && $scope.exportStartDate && 
  				$scope.exportEndDate && $scope.segmentType && $scope.emailto && 
  				$scope.exportemailto) {
  				return true;
  			} else {
  				return false;
  			}
  		};

  		var sendRequest = function(options) {
  			$http(options).success(function(data, status, headers, config) {
  				if(data.istaskcreated === null || data.istaskcreated === '' || data.istaskcreated === 'false') {
  					alert('Failed to create task!');
  				} else if(data.istaskcreated === 'true') {
  					//alert('Task created!');
  					$state.go('workspace.viewtasks');
  				}
  			}).error(function(data, status, headers, config) {
  				alert('The resources requested do not exist!');
  			});
  		}

		$scope.openStartTime = function($event) {
			$event.preventDefault();
		    $event.stopPropagation();
		    $scope.isStartTimeOpened = true;
		};

		$scope.openExportStartDate = function($event) {
			$event.preventDefault();
		    $event.stopPropagation();
		    $scope.isExportStartDateOpened = true;
		};

		$scope.openExportEndDate = function($event) {
			$event.preventDefault();
		    $event.stopPropagation();
		    $scope.isExportEndDateOpened = true;
		};
	}]);