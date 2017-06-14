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
