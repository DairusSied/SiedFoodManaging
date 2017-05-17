(function () {
    'use strict';
    angular.module('sied.controllers')
        .controller('CouvertCtrl', CouvertCtrl);

    CouvertCtrl.$inject = ['$log', '$q', '$timeout', '$scope', '$ionicLoading', '$ionicScrollDelegate', 'ClientAPIFactory', 'TratarDataService', 'TratarObjetosService', 'TratarFloatService'];

    function CouvertCtrl($log, $q, $timeout, $scope, $ionicLoading, $ionicScrollDelegate, ClientAPIFactory, TratarDataService, TratarObjetosService, TratarFloatService) {
        var vm = this;

        vm.dataInicial = '';
        vm.dataFinal = '';
        vm.fechados = [];
        vm.consumos = [];
        vm.totalGeral = 0;
        vm.totalConsumos = 0;
        vm.totalFechados = 0;

        vm.init = init;
        vm.GerarCouvert = GerarCouvert;
        vm.GetRetornaCouvertFechado = GetRetornaCouvertFechado;
        vm.GetRetornaCouvertMovimento = GetRetornaCouvertMovimento;

        $scope.$on('EventLogin', init());

        function init() {
            vm.dataInicial = TratarDataService.SubtrairDataSemFormato(1);
            vm.dataFinal = new Date();

            GerarCouvert();
        }

        function GerarCouvert() {
            $ionicLoading.show();

            $q.when(vm.dataFinal)
                .then(GetRetornaCouvertFechado())
                .then(GetRetornaCouvertMovimento())
                .then(function(){
                    $ionicScrollDelegate.scrollTop();
                })
            ;
        }

        function CalcularColvertFechados() {
            var fechados = vm.fechados;
            var totalFechados = 0;
            var countFechados = TratarObjetosService.ContarObjetos(fechados[0]);
            var i = 0;
            while (i < countFechados) {
                totalFechados = totalFechados + TratarFloatService.ConverterParaFloat(fechados[0][i].Total);
                i++;
            }
            vm.totalFechados = totalFechados;
            vm.totalGeral = vm.totalFechados;
        }

        function CalcularCouvertEmMovimento() {
            var consumos = vm.consumos;
            var totalConsumos = 0;
            var countConsumos = TratarObjetosService.ContarObjetos(consumos[0]);
            var i = 0;
            while (i < countConsumos) {
                totalConsumos = totalConsumos + TratarFloatService.ConverterParaFloat(consumos[0][i].Total);
                i++;
            }
            vm.totalConsumos = totalConsumos;
            vm.totalGeral = vm.totalGeral + vm.totalConsumos;

            vm.totalFechados.toFixed(2);
            vm.totalFechados.toFixed(2);
            vm.totalGeral.toFixed(2);

            vm.totalGeral = TratarFloatService.ConverterParaString(vm.totalGeral);
            vm.totalConsumos = TratarFloatService.ConverterParaString(vm.totalConsumos);
            vm.totalFechados = TratarFloatService.ConverterParaString(vm.totalFechados);
        }

        function GetRetornaCouvertFechado() {
            $ionicLoading.show();

            vm.fechados = [];
            vm.totalFechados = 0;

            var d1 = TratarDataService.formatarDataHora(vm.dataInicial);
            var d2 = TratarDataService.formatarDataHora(vm.dataFinal);

            ClientAPIFactory.async('GetRetornaCouvertFechado/' + d1 + '/' + d2).then(function (d) {
                $ionicLoading.show({template: 'Carregando Couvert Fechado'});
                vm.fechados = d;

                if (TratarObjetosService.ContarObjetos(vm.fechados[0]) > 0) {
                    CalcularColvertFechados();
                }
                $timeout(function () {
                    $ionicLoading.hide();
                }, 1000);
            })
        }

        function GetRetornaCouvertMovimento() {
            $ionicLoading.show();

            vm.consumos = [];
            vm.totalConsumos = 0;

            ClientAPIFactory.async('GetRetornaCouvertMovimento').then(function (d) {
                $ionicLoading.show({template: 'Carregando Couvert em Movimento'});

                vm.consumos = d;
                if (TratarObjetosService.ContarObjetos(vm.consumos[0]) > 0) {
                    CalcularCouvertEmMovimento();
                }
                $timeout(function () {
                    $ionicLoading.hide();
                }, 1000);
            });
        }
    }
})();
