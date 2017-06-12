(function () {
    'use strict';
    angular.module('sied.controllers').controller('VendasCtrl', VendasCtrl);

    VendasCtrl.$inject = ['$log', '$q', '$timeout', '$scope', '$ionicLoading', '$ionicPopup', '$ionicScrollDelegate', 'ClientAPIFactory', 'TratarDataService', 'TratarObjetosService', 'TratarFloatService'];

    function VendasCtrl($log, $q, $timeout, $scope, $ionicLoading, $ionicPopup, $ionicScrollDelegate, ClientAPIFactory, TratarDataService, TratarObjetosService, TratarFloatService) {

        var vm = this;

        vm.ano = '';
        vm.totalAno = 0;
        vm.titulo = 'Relatório de Vendas';
        vm.mostrarRodape = false;
        vm.tipo = '';
        vm.dataInicial = '';
        vm.dataFinal = '';
        vm.p1 = '';
        vm.p2 = '';
        vm.colors = ["rgb(159,204,0)"];
        vm.dados = [];
        vm.labels = [];
        vm.series = [];
        vm.data = [];
        vm.tipos = [
            {id: 1, descricao: 'Geral'},
            // {id: 2, descricao: 'Por Produto'},
            {id: 3, descricao: 'Por Grupo de Produtos'},
            {id: 4, descricao: 'Por Vendedor'},
            {id: 5, descricao: 'Gerar Gráfico Anual'}
        ];
        vm.detalhes = [];
        vm.rodape = [];

        vm.init = init;
        vm.Refresh = Refresh;
        vm.SetDataInicial = SetDataInicial;
        vm.SetDataFinal = SetDataFinal;
        vm.RetornarMetodo = RetornarMetodo;
        vm.GetAno = GetAno;
        vm.GetVenda = GetVenda;
        vm.GerarGraficoPorAno = GerarGraficoPorAno;
        vm.GerarRodape = GerarRodape;
        vm.TemplateGetAno = TemplateGetAno;
        vm.PrepararDatas = PrepararDatas;
        vm.CalcularTotalAno = CalcularTotalAno;

        $scope.$on('EventLogin', init());

        function init() {
            vm.tipo = 1;
            var tipo = vm.tipo;

            $q.when(tipo)
                .then(function () {
                    ClientAPIFactory.async('GetHoraPadrao')
                        .then(function (response) {
                            vm.p1 = response[0][0].HoraInicial;
                            vm.p2 = response[0][0].HoraFinal;

                            PrepararDatas();
                        })
                        .then(function () {
                            GetVenda();
                        });
                });
        }

        function Refresh() {
            vm.dados = [];
            vm.rodape = [];

            GetVenda();

            $ionicScrollDelegate.scrollTop();
        }

        function SetDataInicial() {
            if (vm.tipo === 5)
                return;

            GetVenda();
        }

        function SetDataFinal() {
            if (vm.tipo === 5)
                return;

            GetVenda();
        }

        function RetornarMetodo(tipo) {
            // if (tipo === 1) {
            //     return 'GetVenda';
            // }
            if (tipo === 2) {
                return 'GetVendaPorProduto';
            }
            if (tipo === 3) {
                return 'GetVendaPorGrupoProduto';
            }
            if (tipo === 4) {
                return 'GetVendaGraficoPorVendedor';
            }
            if (tipo === 5) {
                return 'GetVendaGraficoAnual';
            }
        }

        function GetAno() {
            $ionicLoading.hide();

            var ano = new Date();

            vm.data = {};
            vm.data.ano = ano.getFullYear();

            var alertPopup = PopUpGetAno();
        }

        function PrepararRelatorioPorVendedor() {
            if (vm.tipo == 4) {
                var i = 0;
                var count = TratarObjetosService.ContarObjetos(vm.dados[0]);
                while (i < count) {
                    vm.data[[i]] = TratarFloatService.ConverterParaFloat(vm.dados[0][i].Venda);
                    vm.labels[i] = vm.dados[0][i].Vendedor.substring(0, 3);
                    i++;
                }
            }
            vm.detalhes = [];
        }

        function GetTotalVendaPorComanda(data) {
            $ionicLoading.show();

            vm.detalhes = [];

            if (vm.tipo == 4) {
                return;
            }
            ClientAPIFactory.async('GetTotalVendaPorComanda/' + data.d1 + '/' + data.d2)
                .then(function (response) {
                    $ionicLoading.show({template: 'Carregando Vendas Por Comanda'});

                    vm.detalhes = response;

                    $timeout(function () {
                        $ionicLoading.hide();
                    }, 1000);
                });

            return data;
        }

        function GetVenda() {
            $ionicLoading.show();

            vm.labels = [];
            vm.data = [];
            vm.dados = [];

            var metodo = RetornarMetodo(vm.tipo);

            if (vm.tipo === 5) {
                GetAno();

                return;
            }

            var data = {
                d1: TratarDataService.formatarDataHora(vm.dataInicial),
                d2: TratarDataService.formatarDataHora(vm.dataFinal)
            }

            if (vm.tipo === 4) {
                data.d1 = TratarDataService.formatarDataAPI(vm.dataInicial);
                data.d2 = TratarDataService.formatarDataAPI(vm.dataFinal);

                vm.series = ['Venda R$'];
            }

            $q.when(data)
                .then(function(data){
                    if (vm.tipo > 1)
                    {
                        ClientAPIFactory.async(metodo + '/' + data.d1 + '/' + data.d2)
                            .then(function (d) {
                                $ionicLoading.show({template: 'Carregando'});

                                vm.dados = d;

                                if (TratarObjetosService.ContarObjetos(vm.dados) > 0) {
                                    vm.series = ['Ano'];

                                    PrepararRelatorioPorVendedor();
                                }

                                $timeout(function () {
                                    $ionicLoading.hide();

                                    $ionicScrollDelegate.scrollTop();
                                }, 1000);
                            });
                    }
                    return data;
                })
                .then(function (data) {
                    GetTotalVendaPorComanda(data);

                    return data;
                })
                .then(function (data) {
                    GerarRodape(data.d1, data.d2);

                    return data;
                })
                .then(function () {
                    $ionicScrollDelegate.scrollTop();

                    vm.relatorio = true;
                });
        }

        function GerarGraficoPorAno(ano) {
            $ionicLoading.show();

            vm.labels = [];
            vm.data = [];
            vm.detalhes = [];
            vm.dados = [];

            vm.mostrarRodape = false;

            ClientAPIFactory.async('GetVendaGraficoAnual' + '/' + ano)
                .then(function (d) {
                    $ionicLoading.show({template: 'Gerando Gráfico'});

                    vm.dados = d;
                    if (TratarObjetosService.ContarObjetos(vm.dados[0]) > 0) {
                        CalcularTotalAno();
                    }
                    $timeout(function () {
                        $ionicLoading.hide();
                        $ionicScrollDelegate.scrollTop();
                    }, 1000);
                });
        }

        function GerarRodape(dataInicial, dataFinal) {
            $ionicLoading.show();
            vm.rodape = [];

            if (vm.tipo == 5) {
                return;
            }

            ClientAPIFactory.async('GetCalculaRodapeVenda' + '/' + dataInicial + '/' + dataFinal)
                .then(function (d) {
                    $ionicLoading.show({template: 'Calculando Relatório de Vendas'});

                    vm.rodape = d;
                    if (TratarObjetosService.ContarObjetos(vm.rodape) > 0) {
                        vm.mostrarRodape = true;
                    }

                    $timeout(function () {
                        $ionicLoading.hide();
                    }, 1000);
                });
        }

        function TemplateGetAno() {
            var texto = '<div class="list">';
            texto += '<label class="item item-input">';
            texto += '<span class="input-label">Informar o ano: </span>';
            texto += '<input type="number" ng-model="vm.data.ano" >';
            texto += '</label>';
            texto += '</div>';
            return texto;
        }

        function PopUpGetAno() {
            return $ionicPopup.show({
                template: TemplateGetAno(),
                title: 'Informar o Ano',
                scope: $scope,
                buttons: [
                    {
                        text: '<b>Gerar Gráfico</b>',
                        type: 'button-balanced',
                        onTap: function (e) {
                            if (!vm.data.ano) {
                                //don't allow the user to close unless he enters wifi password
                                e.preventDefault();
                            } else {
                                GerarGraficoPorAno(vm.data.ano);
                            }
                        }
                    }
                ]
            });
        }

        function PrepararDatas() {
            var t1 = vm.p1.split(':');
            var t2 = vm.p2.split(':');

            vm.dataInicial = TratarDataService.SubtrairDataSemFormato(1);
            vm.dataInicial.setHours(t1[0]);
            vm.dataInicial.setMinutes(t1[1]);
            vm.dataInicial.setSeconds(t1[2]);

            vm.dataFinal = new Date();
            vm.dataFinal.setHours(t2[0]);
            vm.dataFinal.setMinutes(t2[1]);
            vm.dataFinal.setSeconds(t2[2]);
        }

        function CalcularTotalAno() {
            var valor = 0;
            var total = 0;
            var count = TratarObjetosService.ContarObjetos(vm.dados[0]);
            var i = 0;
            while (i < count) {
                vm.data[[i]] = TratarFloatService.ConverterParaFloat(vm.dados[0][i].Valor);
                vm.labels[i] = vm.dados[0][i].Mes.substring(0, 3);

                valor = TratarFloatService.ConverterParaFloat(vm.dados[0][i].Valor);
                total = total + valor;
                i++;
            }
            vm.totalAno = TratarFloatService.ConverterParaString(total.toFixed(2));
        }
    }
})();
