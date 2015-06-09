// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'firebase', 'starter.controllers', 'starter.services', 'ngAnimate'])

.run(function($ionicPlatform, $rootScope, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
    // We can catch the error thrown when the $requireAuth promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
      $state.go("login");
    } 
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('login', {
      url: '/login',
      templateUrl:'templates/login.html',
      controller: 'LoginCtrl'
  })

  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html",
    resolve: {
      "currentAuth": ["Auth", function(Auth) {
        return Auth.$requireAuth();
      }]
    }
  })

    // Each tab has its own nav history stack:

  .state('tab.current', {
    url: '/current',
    views: {
      'tab-current': {
        templateUrl: 'templates/tab-current.html',
        controller: 'CurrentCtrl'
      }
    }
  })

  .state('tab.past', {
      url: '/past',
      views: {
        'tab-past': {
          templateUrl: 'templates/tab-past.html',
          controller: 'PastCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });
  // setup an abstract state for the tabs directive

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});

