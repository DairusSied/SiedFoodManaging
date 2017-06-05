(function () {
    'use strict';

    angular.module('sied.controllers').controller('ConsumoCtrl', ConsumoCtrl);

    ConsumoCtrl.$inject = ['$log', '$q', '$timeout', '$scope', '$ionicLoading', '$ionicScrollDelegate', 'ClientAPIFactory', 'TratarDataService', 'TratarObjetosService'];

    function ConsumoCtrl($log, $q, $timeout, $scope, $ionicLoading, $ionicScrollDelegate, ClientAPIFactory, TratarDataService, TratarObjetosService) {
        var vm = this;

        vm.titulo = 'Vendas em Consumo';
        vm.controlador = 'ConsumoCtrl';
        vm.metodo = '';

        vm.caixa = [];
        vm.consumo = [];

        vm.init = init;
        vm.GerarRelatorio = GerarRelatorio;
        vm.GetVendaEmConsumoCaixa = GetVendaEmConsumoCaixa;
        vm.GetVendaEmConsumo = GetVendaEmConsumo;

        $scope.$on('EventLogin', init());

        function init() {
            $ionicLoading.show();

            $q.when(vm.caixa)
                .then(GerarRelatorio());
        }

        function GetVendaEmConsumoCaixa(){
            $ionicLoading.show();
            vm.caixa = [];
            ClientAPIFactory.async('GetVendaEmConsumoCaixa')
                .then(function (d) {
                    $ionicLoading.show({template: 'Carregando Vendas em Caixa'});

                    vm.caixa = d;

                    $timeout(function () {
                        $ionicLoading.hide();
                    }, 1000);
                });
        }

        function GetVendaEmConsumo() {
            $ionicLoading.show();
            vm.consumo = [];
            ClientAPIFactory.async('GetVendaEmConsumo')
                .then(function (d) {
                    $ionicLoading.show({template: 'Carregando Vendas em Consumo'});

                    vm.consumo = d;

                    $timeout(function () {
                        $ionicLoading.hide();
                    }, 1000);
                });
        }

        function GerarRelatorio() {
            $q.when(vm.caixa)
                .then(GetVendaEmConsumoCaixa())
                .then(GetVendaEmConsumo())
            ;
            $ionicScrollDelegate.scrollTop();
        }        
    }
})();
