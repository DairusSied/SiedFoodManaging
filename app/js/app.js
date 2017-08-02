(function () {
  'use strict';

  runApp.$inject = ['$ionicPlatform', '$ionicPickerI18n'];

  configApp.$inject = ['$stateProvider', '$urlRouterProvider', 'ChartJsProvider', '$ionicConfigProvider'];

  function runApp($ionicPlatform, $ionicPickerI18n) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        cordova.plugins.Keyboard.disableScroll(false);
      }

      if (window.StatusBar) {
        StatusBar.styleDefault();
      }

      // cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      // cordova.plugins.Keyboard.disableScroll(true);
      //
      // StatusBar.styleDefault();

      $ionicPickerI18n.weekdays = ["DO", "SE", "TE", "QA", "QI", "SE", "SA"];
      $ionicPickerI18n.months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      $ionicPickerI18n.ok = "Ok";
      $ionicPickerI18n.cancel = "Cancelar";
      $ionicPickerI18n.okClass = "button-light";
      $ionicPickerI18n.cancelClass = "button-light";
      $ionicPickerI18n.arrowButtonClass = "button-stable";
    });
  }

  function configApp($stateProvider, $urlRouterProvider, ChartJsProvider, $ionicConfigProvider) {
    $stateProvider
      .state('tab', {
        url: '/',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })
      .state('index', {
        url: '/inicio',
        templateUrl: 'templates/tab-index.html',
        controller: 'PrincipalCtrl'
      })
      .state('caixa', {
        url: "/caixa",
        templateUrl: "templates/tab-caixa.html",
        controller: 'CaixaCtrl'
      });

    ChartJsProvider.setOptions({colors: ['#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360']});

    $urlRouterProvider.otherwise("/inicio");

    $ionicConfigProvider.backButton.text('');

    $ionicConfigProvider.tabs.position('bottom');
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
