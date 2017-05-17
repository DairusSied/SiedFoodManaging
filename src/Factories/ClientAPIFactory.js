(function () {
    angular.module('sied.factories').factory('ClientAPIFactory', ClientAPIFactory);

    ClientAPIFactory.$inject = ['$log','$q', '$http', '$ionicPopup', '$window', '$ionicLoading', 'HostFactory', 'ServidorFactory'];

    function ClientAPIFactory($log, $q, $http, $ionicPopup, $window, $ionicLoading, HostFactory, ServidorFactory) {
        var prefixo = '/datasnap/rest/TServidorDeMetodosGerais';

        function getLink(parametro) {
            var link = 'http://' + HostFactory.getConfig() + prefixo;
            if (parametro !== '') {
                link += '/' + parametro;
            }
            return link;
        }

        function ChecarErros(error, defer, parametro) {
            $ionicLoading.hide();

            defer.reject('Error: ' + getLink(parametro) + ' - ' + error.message);

            ServidorFactory.initDB();

            ServidorFactory.limparServidores();

            var myPopup = $ionicPopup.show({
                template: 'Não foi possível localizar o servidor',
                title: 'Atenção',
                buttons: [
                    {
                        text: '<b>Configurar</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            $window.location.reload(true);
                        }
                    }
                ]
            });
        }

        function asyncLogin(parametro) {
            if (HostFactory.getConfig() == '') {
                return false;
            }
            var defer = $q.defer();

            // $log.info(getLink(parametro));

            $http.get(getLink(parametro), {$timeout: 1000})
                .then(function (response) {
                        defer.resolve(response.data.result);
                    },
                    function (error) {
                        ChecarErros(error, defer, parametro);
                    });
            return defer.promise;
        }

        function async(parametro) {
            if (HostFactory.getConfig() == '') {
                return false;
            }
            var defer = $q.defer();

            // $log.info(getLink(parametro));

            $http.get(getLink(parametro))
                .then(function (response) {
                        defer.resolve(response.data.result);
                    },
                    function (error) {
                        ChecarErros(error, defer, parametro);
                    });

            return defer.promise;
        }

        return {
            link: getLink,
            async: async,
            asyncLogin: asyncLogin
        }
    }
})();