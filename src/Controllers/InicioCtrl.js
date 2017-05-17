(function () {
    'use strict';

    angular.module('sied.controllers')
        .controller('InicioCtrl', InicioCtrl);

    InicioCtrl.$inject = ['$ionicPlatform', '$ionicPopup', '$ionicSideMenuDelegate', 'HostFactory']

    function InicioCtrl($ionicPlatform, $ionicPopup, $ionicSideMenuDelegate, HostFactory) {
        var vm = this;

        vm.titulo = 'Managing 2017';
        vm.cnpj = 'CNPJ';
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
            vm.cnpj = HostFactory.getCnpj();
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
