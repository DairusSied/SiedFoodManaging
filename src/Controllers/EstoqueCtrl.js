(function () {
    'use strict';

    angular.module('sied.controllers').controller('EstoqueCtrl', EstoqueCtrl);

    EstoqueCtrl.$inject = ['$q', '$timeout', '$ionicLoading', '$scope', '$ionicPopup', 'ClientAPIFactory', 'TratarObjetosService'];

    function EstoqueCtrl($q, $timeout, $ionicLoading, $scope, $ionicPopup, ClientAPIFactory, TratarObjetosService) {
        var vm = this;

        vm.titulo = 'Controle de Estoque';
        vm.relatorio = false;
        vm.tipo = 0;
        vm.grupo = 0;
        vm.dados = [];
        vm.grupos = [];
        vm.tipos = [
            {id: 0, descricao: 'Todos'},
            {id: 1, descricao: 'Estoque Zero'},
            {id: 2, descricao: 'Abaixo do Estoque Mínimo'},
            {id: 3, descricao: 'Abaixo do Ponto de Pedido'},
            {id: 4, descricao: 'Abaixo do Estoque Padrão'}
        ];

        vm.init = init;
        vm.LoadGrupos = LoadGrupos;
        vm.SetTipo = SetTipo;
        vm.SetGrupo = SetGrupo;
        vm.TemplateSetTipo = TemplateSetTipo;
        vm.TemplateSetGrupo = TemplateSetGrupo;
        vm.PopUpSetTipo = PopUpSetTipo;
        vm.PopUpSetGrupo = PopUpSetGrupo;
        vm.GerarRelatorio = GerarRelatorio;

        $scope.$on('EventLogin', init());

        function init() {
            LoadGrupos();

            vm.grupo = 0;
            vm.tipo = 0;

            GerarRelatorio();
        }

        function LoadGrupos() {
            ClientAPIFactory.async('GetGrupoDeProduto').then(function (d) {
                vm.grupos = [];

                vm.grupos = d;
                if (TratarObjetosService.ContarObjetos(vm.grupos) > 0) {
                    vm.grupos[0].unshift({Codigo: 0, Grupo: 'Todos'});
                }
            });
        }

        function SetTipo() {
            vm.data = {};

            vm.data.tipo = vm.tipo;

            var alertPopup = PopUpSetTipo();
        }

        function SetGrupo() {

            vm.data = {};
            vm.data.grupo = vm.grupo;

            var alertPopup = PopUpSetGrupo();
        }

        function GerarRelatorio() {
            $ionicLoading.show();

            var config = {
                grupo: vm.grupo,
                tipo: vm.tipo
            }

            vm.relatorio = false;
            vm.dados = [];

            $q.when(config)
                .then(function(config){
                    var tipoConsulta = '';

                    switch (config.tipo) {
                        case 0 :
                            tipoConsulta = 0;
                            break;
                        case 1 :
                            tipoConsulta = 'EstoqueZero';
                            break;
                        case 2 :
                            tipoConsulta = 'AbaixoEstoqueMinimo';
                            break;
                        case 3 :
                            tipoConsulta = 'AbaixoPontoPedido';
                            break;
                        case 4 :
                            tipoConsulta = 'AbaixoEstoquePadrao';
                            break;
                    }
                    ClientAPIFactory.async('GetEstoque/' + config.grupo + '/' + tipoConsulta).then(function (d) {
                        $ionicLoading.show({ template: 'Carregando Estoque'});

                        vm.dados = d;
                        if (TratarObjetosService.ContarObjetos(vm.dados[0]) > 0) {
                            vm.relatorio = true;
                        }
                        $timeout(function(){
                            $ionicLoading.hide();
                        }, 1000);
                    });

                });
        }

        function TemplateSetTipo() {
            var i = 0;
            var count = vm.tipos.length;

            var texto = '<ion-list>';
            while (i < count) {
                texto += '<ion-radio ng-model="vm.data.tipo" ng-value="' + vm.tipos[i].id + '" style="font-size: 12px;">' + vm.tipos[i].descricao + '</ion-radio>';
                i++;
            }
            texto += '</ion-list>';
            return texto;
        }

        function TemplateSetGrupo() {
            var i = 0;
            var count = TratarObjetosService.ContarObjetos(vm.grupos[0]);

            var texto = '<ion-list>';
            while (i < count) {
                texto += '<ion-radio ng-model="vm.data.grupo" ng-value="' + vm.grupos[0][i].Codigo + '" style="font-size: 12px;" >' + vm.grupos[0][i].Grupo + '</ion-radio>';
                i++;
            }
            texto += '</ion-list>';
            return texto;
        }

        function PopUpSetTipo() {
            return $ionicPopup.show({
                template: TemplateSetTipo(),
                title: 'Informar o Tipo de Relatório',
                scope: $scope,
                buttons: [
                    {
                        text: '<b>Gerar Relatório</b>',
                        type: 'button-balanced',
                        onTap: function (e) {
                            vm.tipo = vm.data.tipo;
                            GerarRelatorio();
                        }
                    }
                ]
            });
        }

        function PopUpSetGrupo() {
            return $ionicPopup.show({
                template: TemplateSetGrupo(),
                title: 'Informar o Grupo',
                scope: $scope,
                buttons: [
                    {
                        text: '<b>Selecionar Grupo</b>',
                        type: 'button-balanced',
                        onTap: function (e) {
                            vm.grupo = vm.data.grupo;

                            GerarRelatorio();
                        }
                    }
                ]
            });
        }
    }
})();
