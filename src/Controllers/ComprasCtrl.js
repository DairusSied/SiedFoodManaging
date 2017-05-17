(function () {
    'use strict';

    angular.module('sied.controllers')
        .controller('ComprasCtrl', ComprasCtrl);

    ComprasCtrl.$inject = ['$q', '$timeout', '$scope', '$ionicLoading', 'ClientAPIFactory'];

    function ComprasCtrl($q, $timeout, $scope, $ionicLoading, ClientAPIFactory) {
        var vm = this;

        vm.titulo = 'Compras';
        vm.relatorio = false;
        vm.dados = [];
        vm.cabecalho = [];
        vm.detalhes = [];

        vm.init = init;
        vm.Voltar = Voltar;
        vm.RetornarProdutosByPrecoCompra = RetornarProdutosByPrecoCompra;
        vm.RetornarDetalhesDoItem = RetornarDetalhesDoItem;

        $scope.$on('EventLogin', init());

        function init() {
            RetornarProdutosByPrecoCompra();
        }

        function RetornarProdutosByPrecoCompra() {
            $ionicLoading.show();
            vm.dados = [];

            ClientAPIFactory.async('GetRetornaProdutoPorPrecoCompra')
                .then(function (d) {
                    $ionicLoading.show({template: 'Carregando Produtos pelo preço de compra'});

                    vm.dados = d;

                    vm.relatorio = true;

                    $timeout(function () {
                        $ionicLoading.hide();
                    }, 1000);
                });
        }

        function GetRetornaCompraCabecalhoItem(item) {
            $ionicLoading.show();
            vm.cabecalho = [];
            ClientAPIFactory.async('GetRetornaCompraCabecalhoItem/' + item.Codigo)
                .then(function (d) {
                    $ionicLoading.show();

                    vm.cabecalho = d;

                    $timeout(function () {
                        $ionicLoading.hide();
                    }, 1000);
                });
        }

        function GetRetornaCompraItem(item) {
            $ionicLoading.show();
            vm.detalhes = [];
            ClientAPIFactory.async('GetRetornaCompraItem/' + item.Codigo)
                .then(function (d) {
                    $ionicLoading.show();

                    vm.detalhes = d;

                    $timeout(function () {
                        $ionicLoading.hide();
                    }, 1000)
                });
        }

        function RetornarDetalhesDoItem(item) {
            $ionicLoading.show();

            vm.relatorio = false;
            $q.when(vm.relatorio)
                .then(GetRetornaCompraCabecalhoItem(item))
                .then(GetRetornaCompraItem(item));
        }

        function Voltar() {
            vm.cabecalho = [];
            vm.detalhes = [];

            vm.relatorio = true;

            $ionicLoading.show();

            $timeout(function () {
                $ionicLoading.hide();
            }, 1000)
        }
    }
})
();
