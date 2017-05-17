(function () {
    'use strict';
    angular.module('sied.controllers')
        .controller('ConfigCtrl', ConfigCtrl);

    ConfigCtrl.$inject = ['$log', '$window', '$q', '$timeout', '$scope', '$ionicLoading', '$ionicPopup', 'DataFactory', 'ServidorFactory', 'HostFactory'];

    function ConfigCtrl($log, $window, $q, $timeout, $scope, $ionicLoading, $ionicPopup, DataFactory, ServidorFactory, HostFactory) {
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

            $q.when(vm.mensagem)
                .then(function () {
                    DataFactory.initDB();
                })
                .then(function () {
                    ServidorFactory.initDB();
                })
                .then(function () {
                    DataFactory.allServidores()
                        .then(function (response) {
                            vm.servidores = response;
                        })
                        .then(function () {
                            $timeout(function () {
                                $ionicLoading.hide();
                            }, 1000)
                        });
                });

        }

        function selecionar() {

            $ionicLoading.show();

            vm.mensagem = [];
            if (!vm.Ip) {
                vm.mensagem[0] = 'Nenhum IP foi especificado';

                $timeout(function () {
                    $ionicLoading.hide();
                }, 1000);

                return false;
            }

            $q.when(vm.Ip)
                .then(function () {
                    DataFactory.findByValue(vm.Ip)
                        .then(function (response) {
                            var host = response.Ip + ':' + response.Porta;

                            HostFactory.setConfig(host);

                            return host;
                        })
                        .then(function (host) {
                            vm.servidor = {};
                            vm.Ip = '';

                            return host;
                        })
                        .then(function (host) {
                            ServidorFactory.limparServidores()
                                .then(function () {
                                    var d = new Date();
                                    var id = "" + d.getDay() + d.getMonth() + d.getFullYear() + d.getHours() + d.getMinutes() + d.getSeconds();

                                    ServidorFactory.addServidor({_id: id, servidor: host})
                                        .then(function (response) {
                                            $window.location.reload(true);
                                        })
                                        .then(function () {
                                            $timeout(function () {
                                                $ionicLoading.hide();
                                            }, 1000);
                                        });
                                });
                        })
                        .catch(function (error) {
                            vm.Ip = '';
                            vm.servidor = {};

                            $log.info('ConfigCtrl: selecionar()');
                            $log.error(error);
                        });
                });

        }

        function novo() {
            vm.mensagem = [];
            vm.servidor = {
                Ip: '',
                Porta: '8080'
            };

            var popup = PopUpNovoServidor();
        }

        function salvar() {
            $ionicLoading.show();

            validarDados();

            if (vm.mensagem.length > 0) {
                return;
            }

            $q.when(vm.servidor)
                .then(function () {
                    vm.Ip = vm.servidor.Ip;
                })
                .then(function () {
                    var d = new Date();
                    var id = "" + d.getDay() + d.getMonth() + d.getFullYear() + d.getHours() + d.getMinutes() + d.getSeconds();

                    vm.servidor = {_id: id, Ip: vm.servidor.Ip, Porta: vm.servidor.Porta};

                    DataFactory.addServidor(vm.servidor)
                        .then(function () {
                            vm.Ip = vm.servidor.Ip;
                        })
                        .then(function () {
                            selecionar();
                        });
                });
        }

        function excluir() {
            $ionicLoading.show();

            $q.when(vm.Ip)
                .then(function () {
                    DataFactory.findByValue(vm.Ip)
                        .then(function(response){
                            var host = response.Ip + ':' + response.Porta;

                            ServidorFactory.findByValue(host)
                                .then(function(resultado) {
                                    if (resultado)
                                        ServidorFactory.deleteServidor(resultado)
                                            .then(function(){
                                                $timeout(function () {
                                                    $window.location.reload(true);
                                                }, 1000);
                                            });
                                })

                            return response;
                        })
                        .then(function (response) {
                            DataFactory.deleteServidor(response)
                                .then(function () {
                                    DataFactory.allServidores()
                                        .then(function (response) {
                                            return response;
                                        })
                                        .then(function(response){
                                            vm.servidores = [];
                                            vm.servidores = response;
                                            if (vm.servidores.length == 0)
                                            {
                                                ServidorFactory.limparServidores()
                                                    .then(function(){
                                                        $timeout(function () {
                                                            $window.location.reload(true);
                                                        }, 1000);
                                                    });
                                            }
                                        })
                                        .then(function () {
                                            $timeout(function () {
                                                vm.Ip = '';
                                                $ionicLoading.hide();
                                            }, 1000);
                                        });
                                });

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
                        type: 'button-calm'
                    },
                    {
                        text: 'Sim',
                        type: 'button-assertive',
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
                        type: 'button-calm'
                    },
                    {
                        text: 'Salvar',
                        type: 'button-positive',
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
