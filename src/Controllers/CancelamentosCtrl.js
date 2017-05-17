(function () {
    'use strict';

    angular.module('sied.controllers').controller('CancelamentosCtrl', CancelamentosCtrl);

    CancelamentosCtrl.$inject = ['$q', '$log', '$timeout', '$scope', '$ionicLoading', '$ionicPopup', '$ionicScrollDelegate', 'ClientAPIFactory', 'UsuarioFactory'];

    function CancelamentosCtrl($q, $log, $timeout, $scope, $ionicLoading, $ionicPopup, $ionicScrollDelegate, ClientAPIFactory, UsuarioFactory) {
        var vm = this;

        vm.titulo = 'Cancelamento de itens';
        vm.relatorio = false;
        vm.mesas = [];
        vm.cartoes = [];
        vm.comandas = [];

        vm.comanda = '';
        vm.item = '';
        vm.index = '';
        vm.tipo = '';
        vm.codigo = '';
        vm.nivel = '';

        vm.init = init;
        vm.Voltar = Voltar;
        vm.CarregarItemsEmMovimento = CarregarItemsEmMovimento;
        vm.RetornaMesasEmMovimento = RetornaMesasEmMovimento;
        vm.RetornaCartoesEmMovimento = RetornaCartoesEmMovimento;
        vm.RetornaItemsDaComanda = RetornaItemsDaComanda;
        vm.EnviarCancelamento = EnviarCancelamento;
        vm.RemoverItemDaComanda = RemoverItemDaComanda;

        $scope.$on('EventLogin', init());

        function init() {
            vm.nivel = UsuarioFactory.getNivel();

            CarregarItemsEmMovimento();
        }

        function Voltar() {
            vm.comandas = [];

            vm.comanda = '';
            vm.tipo = '';
            vm.item = '';
            vm.index = '';
            vm.codigo = '';

            vm.relatorio = true;

            CarregarItemsEmMovimento();
        }

        function CarregarItemsEmMovimento() {
            $ionicLoading.show();

            vm.relatorio = true;

            $q.when(vm.relatorio)
                .then(function () {
                    RetornaMesasEmMovimento();
                })
                .then(function () {
                    RetornaCartoesEmMovimento();
                })
                .then(function(){
                    $ionicScrollDelegate.scrollTop();
                });
        }

        function RetornaMesasEmMovimento() {
            $ionicLoading.show();
            vm.mesas = [];
            ClientAPIFactory.async('GetRetornaMesasEmMovimento').then(function (d) {
                $ionicLoading.show({template: 'Carregando Movimento das Mesas'});

                vm.mesas = d;

                $timeout(function () {
                    $ionicLoading.hide();
                }, 1000);
            });
        }

        function RetornaCartoesEmMovimento() {
            $ionicLoading.show();
            vm.cartoes = [];
            ClientAPIFactory.async('GetRetornaCartoesEmMovimento').then(function (d) {
                $ionicLoading.show({template: 'Carregando Movimento dos Cartões'});

                vm.cartoes = d;

                $timeout(function () {
                    $ionicLoading.hide();
                }, 1000);
            });
        }

        function RetornaItemsDaComanda(comanda, tipo) {
            $ionicLoading.show();

            vm.comanda = comanda;
            vm.tipo = tipo;
            vm.relatorio = false;
            vm.comandas = [];

            ClientAPIFactory.async('GetRetornaItensDaComanda/' + comanda + '/' + tipo).then(function (d) {
                $ionicLoading.show({template: 'Carregando Itens da Comanda'});

                vm.comandas = d;

                $timeout(function () {
                    $ionicLoading.hide();

                    $ionicScrollDelegate.scrollTop();
                }, 1000);
            });
        }

        function PopUpEnviarCancelamento(item, index, codigo) {
            return $ionicPopup.show({
                title: 'Atenção',
                template: 'Deseja excluir esse item?',
                buttons: [
                    {
                        text: 'Não',
                        type: 'button-calm',
                    },
                    {
                        text: '<b>Sim</b>',
                        type: 'button-assertive',
                        onTap: function (e) {
                            if (e) {
                                vm.item = item;
                                vm.index = index;
                                vm.codigo = codigo;
                                RemoverItemDaComanda();
                            }
                        }
                    }
                ]
            });
        }

        function EnviarCancelamento(item, codigo, index) {
            var confirmPopup = PopUpEnviarCancelamento(item, index, codigo);
        }

        function RemoverItemDaComanda() {
            $ionicLoading.show();
            ClientAPIFactory.async('GetCancelaItemDaComanda/' + vm.item + '/' + vm.codigo + '/' + vm.comanda + '/' + vm.tipo + '/' + 2)
                .then(function (d) {
                    $ionicLoading.show({template: 'Removendo Item'});
                    vm.comandas[0].splice(vm.index, 1);

                    vm.item = '';
                    vm.index = '';

                    $timeout(function () {
                        $ionicLoading.hide();
                        if (vm.comandas[0].length == 0) {
                            Voltar();
                        }
                    }, 1000);
                });
        }
    }
})();