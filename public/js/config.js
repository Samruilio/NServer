'use strict';

//Setting up route
angular.module('mean').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // For unmatched routes:
    $urlRouterProvider.otherwise('/');

    // states for my app
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'views/index.html'
    }).state('login', {
        url: '/login',
        templateUrl: 'views/login.html'
    }).state('workspace', {
        url: '/workspace',
        templateUrl: 'views/workspace.html'
    }).state('workspace.viewtasks', {
        url: '/viewtasks',
        templateUrl: 'views/viewtasks.html'
    }).state('workspace.createtask', {
        url: '/createtask',
        templateUrl: 'views/createtask.html'
    });
}
]);

//Setting HTML5 Location Mode
angular.module('mean').config(['$locationProvider',
  function($locationProvider) {
    $locationProvider.hashPrefix('!');
}
]);

angular.module('mean').run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});
