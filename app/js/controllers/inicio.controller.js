(function () {
  'use strict';

  angular.module('sied.controllers')
    .controller('InicioCtrl', InicioCtrl);

  InicioCtrl.$inject = [
    '$ionicPlatform',
    '$ionicPopup',
    '$ionicSideMenuDelegate',
    '$rootScope',
    '$log'
  ];

  function InicioCtrl($ionicPlatform, $ionicPopup, $ionicSideMenuDelegate, $rootScope, $log) {
    var vm = this;

    vm.ConfirmarSaida = ConfirmarSaida;
    vm.toggleLeft = toggleLeft;
    vm.init = init;

    init();

    $ionicPlatform.registerBackButtonAction(function (event) {
      ConfirmarSaida();
    }, 100);

    function toggleLeft() {
      $ionicSideMenuDelegate.toggleLeft();
    }

    function init() {
      vm.cnpj = $rootScope.cnpj;
    }

    function ConfirmarSaida() {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Atenção',
        template: 'Tem certeza que deseja sair do sistema?'
      });

      confirmPopup.then(function (res) {
        if (res) {
          ionic.Platform.exitApp();
        }
      });
    }
  }
})();
