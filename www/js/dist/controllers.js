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
      $log.info('caixa');

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

(function () {
  'use strict';

  angular.module('sied.controllers').controller('CancelamentosCtrl', CancelamentosCtrl);

  CancelamentosCtrl.$inject = [
    '$q',
    '$timeout',
    '$scope',
    '$ionicLoading',
    '$ionicPopup',
    '$ionicScrollDelegate',
    'ClientAPIFactory',
    'UsuarioFactory'
  ];

  function CancelamentosCtrl($q, $timeout, $scope, $ionicLoading, $ionicPopup, $ionicScrollDelegate, ClientAPIFactory, UsuarioFactory) {
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
        .then(function () {
          $ionicScrollDelegate.scrollTop();
        });
    }

    function removerLoading() {
      $timeout(function () {
        $ionicLoading.hide();
      }, 1000);
    }

    function RetornaMesasEmMovimento() {
      $ionicLoading.show();
      vm.mesas = [];
      ClientAPIFactory.async('GetRetornaMesasEmMovimento').then(function (d) {
        $ionicLoading.show({template: 'Carregando Movimento das Mesas'});

        vm.mesas = d;

        removerLoading();
      });
    }

    function RetornaCartoesEmMovimento() {
      $ionicLoading.show();
      vm.cartoes = [];
      ClientAPIFactory.async('GetRetornaCartoesEmMovimento').then(function (d) {
        $ionicLoading.show({template: 'Carregando Movimento dos Cartões'});

        vm.cartoes = d;

        removerLoading();
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
            type: 'button-light',
          },
          {
            text: '<b>Sim</b>',
            type: 'button-light',
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
          }, 500);
        });
    }
  }
})();

(function () {
  'use strict';

  angular.module('sied.controllers')
    .controller('ComprasCtrl', ComprasCtrl);

  ComprasCtrl.$inject = ['$q', '$timeout', '$scope', '$ionicLoading', '$ionicScrollDelegate', 'ClientAPIFactory'];

  function ComprasCtrl($q, $timeout, $scope, $ionicLoading, $ionicScrollDelegate, ClientAPIFactory) {
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

            $ionicScrollDelegate.scrollTop();
          }, 1000);
        });
    }

    function removerLoading() {
      $timeout(function () {
        $ionicLoading.hide();
      }, 1000);
    }

    function GetRetornaCompraCabecalhoItem(item) {
      $ionicLoading.show();
      vm.cabecalho = [];
      ClientAPIFactory.async('GetRetornaCompraCabecalhoItem/' + item.Codigo)
        .then(function (d) {
          $ionicLoading.show();

          vm.cabecalho = d;

          removerLoading();
        });
    }

    function GetRetornaCompraItem(item) {
      $ionicLoading.show();
      vm.detalhes = [];
      ClientAPIFactory.async('GetRetornaCompraItem/' + item.Codigo)
        .then(function (d) {
          $ionicLoading.show();

          vm.detalhes = d;

          removerLoading();
        });
    }

    function RetornarDetalhesDoItem(item) {
      $ionicLoading.show();

      vm.relatorio = false;
      $q.when(vm.relatorio)
        .then(GetRetornaCompraCabecalhoItem(item))
        .then(GetRetornaCompraItem(item))
        .then(function () {
          $ionicScrollDelegate.scrollTop();
        });
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

(function () {
  'use strict';
  angular.module('sied.controllers')
    .controller('ConfigCtrl', ConfigCtrl);

  ConfigCtrl.$inject = [
    '$window',
    '$timeout',
    '$scope',
    '$ionicLoading',
    '$ionicPopup',
    'DataFactory',
    'ServidorFactory'
  ];

  function ConfigCtrl($window, $timeout, $scope, $ionicLoading, $ionicPopup, DataFactory, ServidorFactory) {
    var vm = this;

    vm.servidores = [];
    vm.servidor = {};
    vm.selecionado = {};
    vm.index = '';
    vm.mensagem = [];
    vm.host = '';
    vm.Ip = '';

    vm.init = init;
    vm.selecionar = selecionar;
    vm.novo = novo;
    vm.salvar = salvar;
    vm.excluir = excluir;
    vm.validarDados = validarDados;
    vm.LimparMensagem = LimparMensagem;
    vm.PopUpConfirmarExclusao = PopUpConfirmarExclusao;
    vm.PopUpNovoServidor = PopUpNovoServidor;
    vm.TemplateNovoServidor = TemplateNovoServidor;

    init();

    function init() {
      vm.mensagem = [];

      $ionicLoading.show();
      DataFactory.allServidores()
        .then(function (response) {
          vm.servidores = response;

          removerLoading();
        });
    }

    function removerLoading() {
      $timeout(function () {
        $ionicLoading.hide();
      }, 1000);
    }

    function selecionar() {
      $ionicLoading.show();

      vm.mensagem = [];
      if (!vm.Ip) {
        vm.mensagem[0] = 'Nenhum IP foi especificado';

        removerLoading();

        return false;
      }

      DataFactory.findByValue(vm.Ip)
        .then(function (response) {
          var host = response.Ip + ':' + response.Porta;

          vm.servidor = {};
          vm.Ip = '';

          ServidorFactory.limparServidores()
            .then(function () {
              var d = new Date();
              var id = "" + d.getDay() + d.getMonth() + d.getFullYear() + d.getHours() + d.getMinutes() + d.getSeconds();

              ServidorFactory.addServidor({_id: id, servidor: host})
                .then(function (response) {
                  $timeout(function () {
                    $ionicLoading.hide();

                    $window.location.reload(true);
                  }, 500);
                });
            });
        });
    }

    function novo() {
      vm.mensagem = [];
      vm.servidor = {
        Ip: '',
        Porta: ''
      };
      var popup = PopUpNovoServidor();
    }

    function salvar() {
      $ionicLoading.show();

      validarDados();
      if (vm.mensagem.length > 0) {
        return;
      }

      vm.Ip = vm.servidor.Ip;
      var d = new Date();
      var id = "" + d.getDay() + d.getMonth() + d.getFullYear() + d.getHours() + d.getMinutes() + d.getSeconds();

      vm.servidor = {_id: id, Ip: vm.servidor.Ip, Porta: vm.servidor.Porta};

      DataFactory.addServidor(vm.servidor)
        .then(function (response) {
          vm.Ip = vm.servidor.Ip;
          selecionar();
        });
    }

    function excluir() {
      $ionicLoading.show();

      DataFactory.findByValue(vm.Ip)
        .then(function (response) {
          var host = response.Ip + ':' + response.Porta;

          ServidorFactory.findByValue(host)
            .then(function (resultado) {
              if (resultado)
                ServidorFactory.deleteServidor(resultado)
                  .then(function () {
                    removerLoading();
                  });
            });

          DataFactory.deleteServidor(response)
            .then(function () {
              removerLoading();
            });
        });
    }

    function validarDados() {
      vm.mensagem = [];
      if (vm.servidor.Ip == '') {
        vm.mensagem.push('O IP é Obrigatório');
      }

      if (vm.servidor.Porta == '') {
        vm.mensagem.push('A Porta é Obrigatório');
      }
    }

    function LimparMensagem() {
      vm.mensagem = [];
    }

    function PopUpConfirmarExclusao() {
      vm.mensagem = [];

      if (vm.Ip == '') {
        vm.mensagem.push('Nenhum IP foi especificado');

        return false;
      }

      return $ionicPopup.show({
        title: 'Atenção',
        template: 'Deseja excluir esse Servidor?',
        scope: $scope,
        buttons: [
          {
            text: 'Não',
            type: 'button-light'
          },
          {
            text: 'Sim',
            type: 'button-light',
            onTap: function (e) {
              excluir();
            }
          }
        ]
      });
    }

    function PopUpNovoServidor() {
      return $ionicPopup.show({
        title: 'Novo Servidor',
        template: TemplateNovoServidor(),
        scope: $scope,
        buttons: [
          {
            text: 'Cancelar',
            type: 'button-light'
          },
          {
            text: 'Salvar',
            type: 'button-light',
            onTap: function (e) {
              validarDados();
              if (vm.mensagem.length > 0) {
                e.preventDefault();
              } else {
                return salvar();
              }
            }
          }
        ]
      });
    }

    function TemplateNovoServidor() {
      var tpl = '';
      tpl += '<div class="item item-assertive" ng-show="vm.mensagem.length > 0">';
      tpl += '<ul>';
      tpl += '<li ng-repeat="item in vm.mensagem">{{ item }}</li>';
      tpl += '</ul>';
      tpl += '</div>';
      tpl += '<label class="item item-input item-stacked-label">';
      tpl += '<span class="input-label">IP do Servidor</span>';
      tpl += '<input type="text" name="Ip" ng-model="vm.servidor.Ip" ng-change="vm.LimparMensagem()" autofocus />';
      tpl += '</label>';
      tpl += '<label class="item item-input item-stacked-label">';
      tpl += '<span class="input-label">Porta do Servidor</span>';
      tpl += '<input type="text" name="Porta" ng-model="vm.servidor.Porta" ng-change="vm.LimparMensagem()" />';
      tpl += '</label>';
      return tpl;
    }
  }
})();

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

(function () {
    'use strict';

    angular.module('sied.controllers').controller('EstoqueCtrl', EstoqueCtrl);

    EstoqueCtrl.$inject = ['$q', '$timeout', '$ionicLoading', '$scope', '$ionicPopup', '$ionicScrollDelegate', 'ClientAPIFactory', 'TratarObjetosService'];

    function EstoqueCtrl($q, $timeout, $ionicLoading, $scope, $ionicPopup, $ionicScrollDelegate, ClientAPIFactory, TratarObjetosService) {
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

                            $ionicScrollDelegate.scrollTop();
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
                        type: 'button-light',
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
                        type: 'button-light',
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

(function () {
  'use strict';

  angular.module('sied.controllers')
    .controller('InicioCtrl', InicioCtrl);

  InicioCtrl.$inject = [
    '$ionicPlatform',
    '$ionicPopup',
    '$ionicSideMenuDelegate',
    '$rootScope',
    '$log'
  ];

  function InicioCtrl($ionicPlatform, $ionicPopup, $ionicSideMenuDelegate, $rootScope, $log) {
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

    function init() {
      vm.cnpj = $rootScope.cnpj;
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

(function () {
  'use strict';

  angular.module('sied.controllers')
    .controller('PrincipalCtrl', PrincipalCtrl);

  PrincipalCtrl.$inject = [
    '$scope',
    '$q',
    '$ionicPopup',
    '$rootScope',
    'ServidorFactory',
    'MenuFactory',
    'HostFactory',
    'ClientAPIFactory',
    'UsuarioFactory',
    'TratarObjetosService',
    '$log'
  ];

  function PrincipalCtrl($scope, $q, $ionicPopup, $rootScope, ServidorFactory, MenuFactory, HostFactory, ClientAPIFactory, UsuarioFactory, TratarObjetosService, $log) {
    var vm = this;

    $rootScope.showFooter = false;

    vm.hide = false;
    vm.index = 0;
    vm.selecionado = {};
    vm.dados = {
      usuario: '',
      senha: ''
    };
    vm.mensagem = [];
    vm.servidores = [];
    vm.usuarios = [];
    vm.usuario = {};
    vm.menu = [];
    vm.popup = '';
    vm.checarLogin = false;

    vm.dashboard = {swiper: false, slider: false, activeIndexView: 0};

    vm.configurarServidor = configurarServidor;
    vm.MudarSlide = MudarSlide;
    vm.SelecionarUsuario = SelecionarUsuario;
    vm.Voltar = Voltar;
    vm.Sair = Sair;
    vm.login = login;
    vm.preLogin = preLogin;
    vm.init = init;

    function init() {
      vm.menu = [];
      vm.slide = [];

      configurarServidor()
        .then(function (response) {
          if (!response) {
            montarMenu(0).then(function (response) {
              vm.menu = response.menu;
              vm.slide = response.slide;
            });
            return;
          }
          vm.host = response[0];

          HostFactory.setConfig(vm.host.servidor);

          preLogin();
        })
        .catch(function (error) {
          montarMenu(0).then(function (response) {
            vm.menu = response.menu;
            vm.slide = response.slide;
          });
        });
    }

    $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
      if (!data || !data.slider) {
        return;
      }
      vm.swiper = data.slider;
    });

    $scope.$on("$ionicSlides.slideChangeStart", function (event, data) {
      if (!data || !data.slider || !data.slider.snapIndex < 0) {
        return;
      }
      if (!$scope.$$phase) {
        $scope.$apply(function () {
          vm.dashboard.activeIndexView = data.slider.snapIndex;
        });
      } else {
        vm.dashboard.activeIndexView = data.slider.snapIndex;
      }
    });

    function configurarServidor() {
      var defer = $q.defer();
      ServidorFactory.lastServidor().then(function (response) {
        defer.resolve(response);
      }, function (error) {
        defer.reject(error);
      });
      return defer.promise;
    }

    function MudarSlide(index) {
      vm.index = index;
      vm.swiper.slideTo(index);
    }

    function montarMenu(count) {
      var defer = $q.defer();
      var menu = [];
      var slide = [];
      var total = 0;
      var i = 0;
      MenuFactory.montar(count).then(function (response) {
        slide = response;
        total = response.length;
        menu.push({Evento: 'vm.preLogin()', Icone: 'ion-locked', Nome: 'Login', Index: '', Template: ''});
        while (i < total) {
          menu.push({
            Evento: response[i].Evento,
            Icone: response[i].Icone,
            Nome: response[i].Nome,
            Template: response[i].Template
          });
          i++;
        }
        menu.push({Evento: 'vm.Sair()', Icone: 'ion-power', Nome: 'Sair', Index: '', Template: ''});

        defer.resolve({slide: slide, menu: menu});
      });
      return defer.promise;
    }

    function SelecionarUsuario() {
      var index = vm.dados.usuario;

      vm.usuario = vm.usuarios[0][index];

      login();

      vm.popup.close();
    }

    function TemplateLogin() {
      var tpl = '';

      tpl += '<div class="item item-assertive mb" ng-show="vm.mensagem.length>0">';
      tpl += '<ul>';
      tpl += '<li ng-repeat="item in vm.mensagem">{{ item }}</li>';
      tpl += '</ul>';
      tpl += '</div>';
      tpl += '<input ng-model="vm.dados.senha" type="number" autofocus ng-change="vm.mensagem=[]"/>'

      return tpl;
    }

    function TemplatePrelogin(count) {
      var texto = '';
      var i = 0;

      while (i < count) {
        texto += '<ion-radio ng-model="vm.dados.usuario" ng-value="' + i + '" ng-click="vm.SelecionarUsuario()">' + vm.usuarios[0][i].Nome + '</ion-radio>';
        i++;
      }
      return texto;
    }

    function PopUpLogin() {
      vm.menu = [];
      vm.slide = [];

      return $ionicPopup.show({
        title: 'Informe a senha',
        template: TemplateLogin(),
        scope: $scope,
        buttons: [
          {
            text: 'Sair',
            type: 'button-light',
            onTap: function (e) {
              montarMenu(0).then(function (response) {
                vm.menu = response.menu;
                vm.slide = response.slide;
                ionic.Platform.exitApp();
              });
            }
          },
          {
            text: 'Voltar',
            type: 'button-light',
            onTap: function (e) {
              preLogin();
            }
          },
          {
            text: 'Entrar',
            type: 'button-light',
            onTap: function (e) {
              if (vm.dados.senha == '') {
                vm.mensagem.push('A Senha é obrigatório');
              }
              if (vm.dados.senha != vm.usuario.Senha) {
                vm.mensagem.push('Senha inválida');
              }
              if (vm.mensagem.length > 0) {
                e.preventDefault();
                return;
              }
              entrar();
            }
          }
        ]
      });
    }



    function entrar() {
      UsuarioFactory.setParams(vm.usuario);

      montarMenu(1).then(function (response) {
        vm.menu = response.menu;
        vm.slide = response.slide;
        vm.checarLogin = true;

        $scope.$emit('EventLogin', SetUsuario(vm.usuario));
      });
    }

    function PopUpPrelogin(count) {
      return $ionicPopup.show({
        title: 'Selecione o usuario',
        template: TemplatePrelogin(count),
        scope: $scope
      });
    }

    function preLogin() {
      vm.menu = [];
      vm.slide = [];

      vm.checarLogin = false;
      vm.dados.usuario = '';
      ClientAPIFactory.asyncLogin('GetLogin')
        .then(function (d) {
          vm.usuarios = d;

          var count = TratarObjetosService.ContarObjetos(vm.usuarios[0]);

          ClientAPIFactory.async('GetRetornaCnpjDaEmpresa')
            .then(function (response) {
              $rootScope.cnpj = response[0];
            });
          vm.popup = PopUpPrelogin(count);
        })
        .catch(function (error) {
          montarMenu(0).then(function (response) {
            vm.menu = response.menu;
            vm.slide = response.slide;
          });
        });
    }

    function SetUsuario(values) {
      vm.usuario = values;
    }

    function login() {
      vm.dados.senha = '';

      var popup = PopUpLogin();
    }

    function Voltar() {
      if ($scope.index === 0) {
        return;
      }
      vm.index = $scope.index - 1;

      MudarSlide($scope.index);
    }

    function Sair() {
      ionic.Platform.exitApp();
    }
  }
})();

(function () {
    'use strict';

    angular.module('sied.controllers')
        .controller('SobreCtrl', InicioCtrl);

    InicioCtrl.$inject = ['$ionicPlatform', '$ionicPopup', '$ionicSideMenuDelegate']

    function InicioCtrl($ionicPlatform, $ionicPopup, $ionicSideMenuDelegate) {
        var vm = this;

        vm.titulo = 'SobreNos';
        vm.Empresa = {
            Nome: 'Sied Sistemas',
            Cnpj: '03.367.362/0001-03',
            CEP: '77000-000',
            Logradouro: '501 Sul, Av. Teotônio Segurado, Conj. 01',
            Complemento: 'Lt. 03, Ed. Executive Center, Sala 403',
            Bairro: 'Plano Diretor Sul',
            Numero: 's/n',
            Cidade: 'Palmas',
            Estado: 'TO',
            T_Empresa: '(63) 3322-9404',
            T_Vendas: '',
            T_Suporte: '(63) 98446-0444',
            Email: 'odair@siedsistemas.com.br',
            Site: 'siedsistemas.com.br',
            Ano_Abertura: '1998'
        }
    }
})();

(function () {
    'use strict';
    angular.module('sied.controllers').controller('VendasCtrl', VendasCtrl);

    VendasCtrl.$inject = ['$log', '$q', '$timeout', '$scope', '$ionicLoading', '$ionicPopup', '$ionicScrollDelegate', 'ClientAPIFactory', 'TratarDataService', 'TratarObjetosService', 'TratarFloatService'];

    function VendasCtrl($log, $q, $timeout, $scope, $ionicLoading, $ionicPopup, $ionicScrollDelegate, ClientAPIFactory, TratarDataService, TratarObjetosService, TratarFloatService) {

        var vm = this;
        vm.showFooter = false;
        vm.contentFooter = 'Teste';
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
                        type: 'button-light',
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
