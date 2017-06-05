(function () {
  'use strict';

  angular.module('sied.controllers')
    .controller('InicioCtrl', InicioCtrl);

  InicioCtrl.$inject = ['$ionicPlatform', 'ClientAPIFactory', '$ionicPopup', '$ionicSideMenuDelegate']

  function InicioCtrl($ionicPlatform, ClientAPIFactory, $ionicPopup, $ionicSideMenuDelegate) {
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

    function init()
    {
      ClientAPIFactory.async('GetRetornaCnpjDaEmpresa')
        .then(function(response){
          vm.cnpj = response[0];
        });
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
