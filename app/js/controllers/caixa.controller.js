(function () {
  'use strict';

  angular.module('sied.controllers').controller('CaixaCtrl', CaixaCtrl);

  CaixaCtrl.$inject = [
    '$q',
    '$scope',
    '$ionicPopup',
    '$ionicLoading',
    '$timeout',
    '$ionicScrollDelegate',
    'ClientAPIFactory',
    'TratarDataService',
    'TratarObjetosService',
    'TratarFloatService',
    '$log'
  ];

  function CaixaCtrl($q,
                     $scope,
                     $ionicPopup,
                     $ionicLoading,
                     $timeout,
                     $ionicScrollDelegate,
                     ClientAPIFactory,
                     TratarDataService,
                     TratarObjetosService,
                     TratarFloatService,
                     $log) {
    var vm = this;

    vm.listagem = true;
    vm.titulo = 'Relação de Caixas';
    vm.dias = '';
    vm.datahora = '';
    vm.dataInicial = '';
    vm.totalCancelamentos = '';
    vm.movimento = [];
    vm.resumoMovimento = [];
    vm.resumoVendas = [];
    vm.balancete = [];
    vm.cancelamentos = [];
    vm.dados = [];

    vm.init = init;
    vm.GetTurno = GetTurno;
    vm.GerarRelatorio = GerarRelatorio;
    vm.ProcessarRelatorio = ProcessarRelatorio;
    vm.SelecionarDias = SelecionarDias;
    vm.TemplateSelecionarDias = TemplateSelecionarDias;
    vm.PopUpSelecionarDias = PopUpSelecionarDias;

    $scope.$on('EventLogin', init());

    function init() {
      vm.dias = 1;
      GetTurno();
    }

    function GetTurno() {
      $ionicLoading.show();

      vm.caixa = [];
      vm.movimento = [];
      vm.resumoMovimento = [];
      vm.resumoVendas = [];
      vm.balancete = [];
      vm.cancelamentos = [];
      vm.totalCancelamentos = '';

      vm.listagem = true;
      ClientAPIFactory.async('GetTurno/' + vm.dias)
        .then(function (d) {
          $ionicLoading.show({template: 'Carregando Turnos'});
          vm.dados = d;

          $timeout(function () {
            $ionicLoading.hide();
            $ionicScrollDelegate.scrollTop();
          }, 1000);
        });

    }

    function removerLoading() {
      $timeout(function () {
        $ionicLoading.hide()
      }, 1000);
    }

    function GetMovimentoDoTurno() {
      $ionicLoading.show();
      vm.movimento = [];
      ClientAPIFactory.async('GetMovimentoDoTurno/' + vm.caixa.ID_CAIXA + '/' + vm.caixa.TURNO)
        .then(function (d) {
          $ionicLoading.show({template: 'Carregando Movimentos do Turno'});

          vm.movimento = d;

          removerLoading();
        });
    }

    function GetResumoDoMovimentoDoTurno() {
      $ionicLoading.show();
      vm.resumoMovimento = [];
      ClientAPIFactory.async('GetResumoDoMovimentoDoTurno' + '/' + vm.caixa.ID_CAIXA + '/' + vm.caixa.TURNO)
        .then(function (d) {
          $ionicLoading.show({template: 'Carregando Resumo dos Movimentos do Turno'});

          vm.resumoMovimento = d;

          removerLoading();
        });
    }

    function GetResumoDaVendaDoTurno() {
      $ionicLoading.show();
      vm.resumoVendas = [];
      ClientAPIFactory.async('GetResumoDaVendaDoTurno' + '/' + vm.caixa.ID_CAIXA + '/' + vm.caixa.TURNO)
        .then(function (d) {
          $ionicLoading.show({template: 'Carregando Resumo das Vendas do Turno'});
          vm.resumoVendas = d;

          removerLoading();
        });
    }

    function GetBalanceteDoTurno() {
      $ionicLoading.show();
      vm.balancete = [];
      ClientAPIFactory.async('GetBalanceteDoTurno' + '/' + vm.caixa.ID_CAIXA + '/' + vm.caixa.TURNO)
        .then(function (d) {
          $ionicLoading.show({template: 'Carregando Balancete do Turno'});
          vm.balancete = d;

          removerLoading();
        });
    }

    function GetCancelamentoNoTurno() {
      $ionicLoading.show();
      vm.cancelamentos = [];
      ClientAPIFactory.async('GetCancelamentoNoTurno' + '/' + vm.caixa.ID_CAIXA + '/' + vm.caixa.TURNO)
        .then(function (d) {
          $ionicLoading.show({template: 'Carregando Cancelamentos do Turno'});
          if (TratarObjetosService.ContarObjetos(d[0]) > 0) {
            var total = TratarCancelamentos(d);
            vm.cancelamentos = d;
            vm.totalCancelamentos = TratarFloatService.ConverterParaString(total.toFixed(2));
          }
          removerLoading();
        })
      ;
    }

    function GerarRelatorio(caixa) {
      vm.listagem = false;
      vm.caixa = caixa;
      vm.datahora = TratarDataService.RetornarDataHora();

      $q.when(vm.caixa)
        .then(GetMovimentoDoTurno())
        .then(GetResumoDoMovimentoDoTurno())
        .then(GetResumoDaVendaDoTurno())
        .then(GetBalanceteDoTurno())
        .then(GetCancelamentoNoTurno())
      ;
    }

    function ProcessarRelatorio() {
      vm.dias = vm.data.dias;

      GetTurno();
    }

    function SelecionarDias() {
      vm.data = {};
      vm.data.dias = 1;

      var alertPopup = PopUpSelecionarDias();
    }

    function TemplateSelecionarDias() {
      var texto = '<label class="item item-input">';
      texto += '<span class="input-label">Dias: </span>';
      texto += '<input type="text" ng-model="vm.data.dias" readonly>';
      texto += '</label>';
      texto += '<div class="item range range-positive">';
      texto += '<i class="icon ion-ios-minus"></i>';
      texto += '<input type="range" min="1" max="31" ng-model="vm.data.dias">';
      texto += '<i class="icon ion-ios-plus"></i>';
      texto += '</div>';
      return texto;
    }

    function PopUpSelecionarDias() {
      return $ionicPopup.show({
        template: TemplateSelecionarDias(),
        title: 'Informar os Dias',
        scope: $scope,
        buttons: [
          {
            text: '<b>Processar Relatório</b>',
            type: 'button-light',
            onTap: function (e) {
              if (!vm.data.dias) {
                //don't allow the user to close unless he enters wifi password
                e.preventDefault();
              } else {
                ProcessarRelatorio();
              }
            }
          }
        ]
      });
    }

    function TratarCancelamentos(d) {
      var dados = d[0];
      var count = TratarObjetosService.ContarObjetos(dados);
      var total = 0;
      var valor = 0;
      var i = 0;

      while (i < count) {
        valor = TratarFloatService.ConverterParaFloat(dados[i].VALOR);
        total = total + valor;
        i++;
      }
      return total;
    }
  }
})();
