(function () {
    'use strict';

    angular.module('sied.controllers').controller('FinanceiroCtrl', FinanceiroCtrl);

    FinanceiroCtrl.$inject = ['$q', '$timeout', '$log', '$scope', '$ionicLoading', '$ionicPopup', '$ionicScrollDelegate', '$cordovaClipboard', 'ClientAPIFactory', 'TratarDataService'];

    function FinanceiroCtrl($q, $timeout, $log, $scope, $ionicLoading, $ionicPopup, $ionicScrollDelegate, $cordovaClipboard, ClientAPIFactory, TratarDataService) {
        var vm = this;

        vm.titulo = 'Financeiro';
        vm.dados = [];
        vm.relatorio = false;
        vm.dataInicial = '';
        vm.dataFinal = '';

        vm.init = init;
        vm.copiarTexto = copiarTexto;
        vm.pegarCodigoDeBarra = pegarCodigoDeBarra;
        vm.GerarRelatorio = GerarRelatorio;

        $scope.$on('EventLogin', init());

        function init() {
            $ionicLoading.show();

            vm.dataFinal = new Date();
            $q.when(vm.dataFinal)
                .then(function () {
                    vm.dataInicial = TratarDataService.SubtrairDataSemFormato(1);
                })
                .then(function () {
                    GerarRelatorio();
                });
        }

        function copiarTexto(value) {
            $cordovaClipboard.copy(value).then(function () {
                console.log(value);
            });
        }

        function TemplatePegarCodigoDeBarra(item) {
            var texto = '<strong> Título: ' + item.Titulo + '<br />';
            texto += '<strong> Fornecedor: ' + item.Fornecedor + '<br />';
            texto += '<strong> Valor: ' + item.Valor + '<br />';
            texto += '<strong> Vencimento: ' + item.Vencimento;
            if (item.Barra !== '') {
                texto += '<br /><strong>Cod.Barra: </strong>' + item.Barra.substring(0, 18);
            }
            return texto;
        }

        function PopUpPegarCodigoDeBarra(item) {
            return $ionicPopup.show({
                title: 'Copiar Código de Barra',
                template: TemplatePegarCodigoDeBarra(item),
                buttons: [
                    {
                        text: 'Sair',
                        type: 'button-light'
                    },
                    {
                        text: 'Copiar',
                        type: 'button-light',
                        onTap: function (e) {
                            if (e) {
                                copiarTexto(item.Barra);
                            }
                        }
                    }
                ]
            });
        }

        function pegarCodigoDeBarra(item) {
            if (item.Titulo == '' && item.Fornecedor == '' && item.Vencimento == '') {
                return;
            }
            var alertPopup = PopUpPegarCodigoDeBarra(item);
        }

        function GerarRelatorio() {
            $ionicLoading.show();

            var data = {
                d1: TratarDataService.formatarDataAPI(vm.dataInicial),
                d2: TratarDataService.formatarDataAPI(vm.dataFinal)
            }

            vm.dados = [];
            ClientAPIFactory.async('GetContasAPagar/' + data.d1 + '/' + data.d2)
                .then(function (d) {
                    $ionicLoading.show({ template: 'Carregando Financeiro'});

                    vm.dados = d;
                })
                .then(function () {
                    $timeout(function () {
                        $ionicLoading.hide();

                        $ionicScrollDelegate.scrollTop();
                    }, 1000);
                })
            ;
        }
    }
})();
