(function () {
  'use strict';

  angular.module('sied.controllers')
    .controller('PrincipalCtrl', PrincipalCtrl);

  PrincipalCtrl.$inject = [
    '$scope',
    '$q',
    '$ionicPopup',
    'ServidorFactory',
    'MenuFactory',
    'HostFactory',
    'ClientAPIFactory',
    'UsuarioFactory',
    'TratarObjetosService',
    '$log'
  ];

  function PrincipalCtrl($scope, $q, $ionicPopup, ServidorFactory, MenuFactory, HostFactory, ClientAPIFactory, UsuarioFactory, TratarObjetosService, $log) {
    var vm = this;

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
    vm.LimparMensagem = LimparMensagem;
    vm.validarDados = validarDados;
    vm.Voltar = Voltar;
    vm.Sair = Sair;
    vm.login = login;
    vm.preLogin = preLogin;
    vm.init = init;

    init();

    function init() {
      vm.menu = [];
      vm.slide = [];

      configurarServidor().then(function (response) {
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
      }).catch(function (error) {
        montarMenu(0).then(function (response) {
          vm.menu = response.menu;
          vm.slide = response.slide;
        });
        $log.error(error);
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

    function validarDados() {
      vm.mensagem = [];
      if (vm.dados.senha == '') {
        vm.mensagem.push('O campo Senha é obrigatório');
      }

      if (vm.dados.senha != vm.usuario.Senha) {
        vm.mensagem.push('A senha informada é inválida');
      }
    }

    function TemplateLogin() {
      var tpl = '';

      tpl += '<div class="item item-assertive" ng-show="vm.mensagem.length > 0">';
      tpl += '<ul>';
      tpl += '<li ng-repeat="item in vm.mensagem">{{ item }}</li>';
      tpl += '</ul>';
      tpl += '</div>';
      tpl = '<input ng-model="vm.dados.senha" type="number" autofocus ng-change="vm.LimparMensagem()"/>'

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
            type: 'button-assertive',
            onTap: function (e) {
              montarMenu(0).then(function(response){
                vm.menu = response.menu;
                vm.slide = response.slide;

                ionic.Platform.exitApp();
              });
            }
          },
          {
            text: 'Voltar',
            type: 'button-positive',
            onTap: function (e) {
              preLogin();
            }
          },
          {
            text: 'Entrar',
            type: 'button-balanced',
            onTap: function (e) {
              validarDados();
              if (vm.mensagem.length > 0) {
                PopUpExibirError();
              } else {
                return entrar();
              }
            }
          }
        ]
      });
    }

    function PopUpExibirError() {
      var texto = '';
      var i = 0;
      texto = '<ul>';
      while (i < vm.mensagem.length) {
        texto += '<li>' + vm.mensagem[i] + '</li>';
        i++;
      }
      texto += '</ul>';

      return $ionicPopup.alert({
        title: 'Atenção',
        template: texto,
        buttons: [
          {
            text: 'Tente Novamente',
            type: 'button-balanced',
            onTap: function (e) {
              e.preventDefault();
              return PopUpLogin();
            }
          }
        ]
      });
    }

    function entrar() {
      validarDados();
      if (vm.mensagem.length > 0) {
        return;
      }
      UsuarioFactory.setParams(vm.usuario);

      montarMenu(1).then(function (response) {
        vm.menu = response.menu;
        vm.slide = response.slide;
        vm.checarLogin = true;

        $scope.$emit('EventLogin', SetUsuario(vm.usuario));
      });
    }

    function LimparMensagem() {
      vm.mensagem = [];
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

          vm.popup = PopUpPrelogin(count);
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
