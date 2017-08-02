(function () {
  'use strict';

  angular.module('sied.factories').factory('ClientAPIFactory', ClientAPIFactory);

  ClientAPIFactory.$inject = [
    '$http',
    'ServidorFactory',
    '$window',
    '$ionicPopup',
    '$ionicLoading',
    '$timeout',
    '$log'
  ];

  function ClientAPIFactory($http, ServidorFactory, $window, $ionicPopup, $ionicLoading, $timeout, $log) {
    var api = null;
    function getAPI() {
      return ServidorFactory.lastServidor().then(function (response) {
        return response[0].servidor;
      }, function (error) {
        tratarErro(error);
      });
    }

    function getLink(parametro) {
      return getAPI().then(function (response) {
        api = response;
        return 'http://' + response + '/datasnap/rest/TServidorDeMetodosGerais/' + parametro;
      }, function (error) {
        tratarErro(error);
      });
    }

    function RemoverLoading() {
      $timeout(function () {
        $ionicLoading.hide();
      }, 1000);
    }

    function tratarErro(response) {
      var mensagem = 'Não foi possível concluir o processo. \nContate o Suporte';
      var status = response.status;
      if (response.data) {
        $log.info('Atenção: ' + response.data.error + '\nStatus: ' + status);
      }
      if (status == -1) {
        mensagem = 'Não foi possível conectar com o Servidor. \nVerifique se o servidor está ativo ou configure o IP novamente';
        $log.error('Problemas de Conexão: Servidor não está conectado, ip/porta: ' + api);
      }
      exibirMensagem(mensagem, status);
    }

    function exibirMensagem(mensagem, status) {
      RemoverLoading();

      return $ionicPopup.show({
        template: mensagem,
        title: 'Atenção',
        buttons: [
          {
            text: 'OK',
            type: 'button-positive',
            onTap: function (e) {
              // if (status === -1) {
              //   $window.location = '';
              // }
              return;
            }
          }
        ]
      });
    }

    function asyncLogin(parametro) {
      $ionicLoading.show();

      return getLink(parametro).then(function (link) {
        return $http.get(link, {timeout: 30000}).then(
          function (response) {
            RemoverLoading();

            return response.data.result;
          },
          function (error) {
            tratarErro(error);
          }
        );
      });
    }

    function async(parametro) {
      $ionicLoading.show();

      return getLink(parametro).then(function (link) {
        return $http.get(link).then(
          function (response) {
            RemoverLoading();

            return response.data.result;
          },
          function (error) {
            tratarErro(error);
          }
        );
      });
    }

    return {
      link: getLink,
      async: async,
      asyncLogin: asyncLogin
    }
  }
})();
