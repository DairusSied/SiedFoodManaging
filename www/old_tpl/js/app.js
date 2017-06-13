(function () {
  'use strict';

  runApp.$inject = ['$ionicPlatform', '$ionicPickerI18n'];

  configApp.$inject = ['$stateProvider', '$urlRouterProvider', 'ChartJsProvider', '$ionicConfigProvider'];

  function runApp($ionicPlatform, $ionicPickerI18n) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }

      $ionicPickerI18n.weekdays = ["DO", "SE", "TE", "QA", "QI", "SE", "SA"];
      $ionicPickerI18n.months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      $ionicPickerI18n.ok = "Ok";
      $ionicPickerI18n.cancel = "Cancelar";
      $ionicPickerI18n.okClass = "button-balanced";
      $ionicPickerI18n.cancelClass = "button-balanced";
    });
  }

  function configApp($stateProvider, $urlRouterProvider, ChartJsProvider, $ionicConfigProvider) {
    $stateProvider
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })
      .state('tab.dash', {
        url: '/dash',
        views: {
          'tab-dash': {
            templateUrl: 'templates/tab-dash.html',
            controller: 'DashCtrl'
          }
        }
      })
      .state('tab.chats', {
        url: '/chats',
        views: {
          'tab-chats': {
            templateUrl: 'templates/tab-chats.html',
            controller: 'ChatsCtrl'
          }
        }
      })
      .state('tab.chat-detail', {
        url: '/chats/:chatId',
        views: {
          'tab-chats': {
            templateUrl: 'templates/chat-detail.html',
            controller: 'ChatDetailCtrl'
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

    ChartJsProvider.setOptions({colors: ['#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360']});

    $urlRouterProvider.otherwise('/tab/dash');

    $ionicConfigProvider.backButton.text('');
  }

  angular.module('sied.controllers', []);

  angular.module('sied.services', []);

  angular.module('sied.factories', []);

  angular.module('sied',
    [
      'ionic', 'ion-datetime-picker', 'ngCordova', 'chart.js', 'sied.controllers', 'sied.services', 'sied.factories'
    ])
    .run(runApp)
    .config(configApp);
})();
