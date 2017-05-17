(function () {
    'use strict';

    angular.module('sied.controllers')
        .controller('PrincipalCtrl', PrincipalCtrl);

    PrincipalCtrl.$inject = [
        '$q', '$log', '$scope', '$ionicPopup', 'ClientAPIFactory', 'HostFactory', 'UsuarioFactory', 'ServidorFactory', 'TratarObjetosService'
    ];

    function PrincipalCtrl($q, $log,$scope, $ionicPopup, ClientAPIFactory, HostFactory, UsuarioFactory, ServidorFactory, TratarObjetosService) {
        var vm = this;

        vm.host = {};
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

        vm.MudarSlide = MudarSlide;
        vm.ConfigurarServidor = ConfigurarServidor;
        vm.SelecionarUsuario = SelecionarUsuario;
        vm.LimparMensagem = LimparMensagem;
        vm.validarDados = validarDados;
        vm.Voltar = Voltar;
        vm.Sair = Sair;
        vm.init = init;
        vm.login = login;
        vm.preLogin = preLogin;

        init();

        function init() {
            ConfigurarServidor();
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

        function MudarSlide(index) {
            vm.index = index;
            vm.swiper.slideTo(index);
        }

        function MenuAfterLogin(count) {
            if (count == 0) {
                return vm.slide = [
                    {
                        Evento: 'vm.MudarSlide(0)',
                        Icone: 'ion-android-settings',
                        Nome: 'Configuração',
                        Index: 8,
                        Template: 'templates/tab-config.html'
                    },
                    {
                        Evento: 'vm.MudarSlide(1)',
                        Icone: 'ion-happy-outline',
                        Nome: 'Sobre Nós',
                        Index: 9,
                        Template: 'templates/tab-sobre.html'
                    }

                ];
            }

            vm.slide = [
                {
                    Evento: 'vm.MudarSlide(0)',
                    Icone: 'ion-ios-home',
                    Nome: 'Início',
                    Index: 0,
                    Template: 'templates/tab-inicio.html'
                },
                {
                    Evento: 'vm.MudarSlide(1)',
                    Icone: 'ion-social-usd',
                    Nome: 'Caixa',
                    Index: 1,
                    Template: 'templates/tab-caixa.html'
                },
                {
                    Evento: 'vm.MudarSlide(2)',
                    Icone: 'ion-cash',
                    Nome: 'Vendas',
                    Index: 2,
                    Template: 'templates/tab-vendas.html'
                },
                {
                    Evento: 'vm.MudarSlide(3)',
                    Icone: 'ion-beer',
                    Nome: 'Vendas em Consumo',
                    Index: 3,
                    Template: 'templates/tab-consumo.html'
                },
                {
                    Evento: 'vm.MudarSlide(4)',
                    Icone: 'ion-clipboard',
                    Nome: 'Estoque',
                    Index: 4,
                    Template: 'templates/tab-estoque.html'
                },
                {
                    Evento: 'vm.MudarSlide(5)',
                    Icone: 'ion-sad-outline',
                    Nome: 'Cancelamentos',
                    Index: 5,
                    Template: 'templates/tab-cancelamentos.html'
                },
                {
                    Evento: 'vm.MudarSlide(6)',
                    Icone: 'ion-calculator',
                    Nome: 'Financeiro',
                    Index: 6,
                    Template: 'templates/tab-financeiro.html'
                },
                {
                    Evento: 'vm.MudarSlide(7)',
                    Icone: 'ion-ios-cart',
                    Nome: 'Compras',
                    Index: 7,
                    Template: 'templates/tab-compras.html'
                },
                {
                    Evento: 'vm.MudarSlide(8)',
                    Icone: 'ion-mic-a',
                    Nome: 'Couvert',
                    Index: 8,
                    Template: 'templates/tab-couvert.html'
                },
                {
                    Evento: 'vm.MudarSlide(9)',
                    Icone: 'ion-android-settings',
                    Nome: 'Configurar Servidores',
                    Index: 9,
                    Template: 'templates/tab-config.html'
                },
                {
                    Evento: 'vm.MudarSlide(10)',
                    Icone: 'ion-happy-outline',
                    Nome: 'Sobre Nós',
                    Index: 10,
                    Template: 'templates/tab-sobre.html'
                }
            ];
            return vm.slide;
        }

        function MontarMenu(count) {
            vm.menu = [];
            vm.slide = [];

            var menu = MenuAfterLogin(count);

            var total = menu.length;

            var i = 0;
            vm.menu.push({Evento: 'vm.preLogin()', Icone: 'ion-locked', Nome: 'Login', Index: '', Template: ''});
            while (i < total) {
                vm.menu.push({
                    Evento: menu[i].Evento,
                    Icone: menu[i].Icone,
                    Nome: menu[i].Nome,
                    Template: menu[i].Template
                });
                i++;
            }
            vm.menu.push({Evento: 'vm.Sair()', Icone: 'ion-power', Nome: 'Sair', Index: '', Template: ''});
        }

        function ConfigurarServidor() {
            ServidorFactory.initDB();

            ServidorFactory.lastServidor().then(function (response) {
                if (!response || response.length === 0) {

                    vm.checarLogin = true;

                    MontarMenu(0);

                    return;
                }

                vm.host = response[0];

                HostFactory.setConfig(vm.host.servidor);

                preLogin();

                return;
            });

            return;
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
            return $ionicPopup.show({
                title: 'Informe a senha',
                template: TemplateLogin(),
                scope: $scope,
                buttons: [
                    {
                        text: 'Sair',
                        type: 'button-assertive',
                        onTap: function (e) {
                            ionic.Platform.exitApp();
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

            MontarMenu(1);

            vm.checarLogin = true;

            $scope.$emit('EventLogin', SetUsuario(vm.usuario));
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
            vm.checarLogin = false;

            vm.dados.usuario = '';

            ClientAPIFactory.asyncLogin('GetLogin')
                .then(function (d) {
                    vm.usuarios = d;
                })
                .then(function (response, error) {
                    if (!vm.usuarios) {
                        MontarMenu(0);

                        var texto = 'Não existe servidor disponível';
                        if (vm.host.servidor) {
                            var texto = 'O servidor ' + vm.host.servidor + ' está indisponível';
                        }

                        var alertPopup = $ionicPopup.alert({
                            title: 'Atenção',
                            template: texto
                        });

                        alertPopup.then(function (res) {
                            MudarSlide(0);
                        });
                        return;
                    }
                    var count = TratarObjetosService.ContarObjetos(vm.usuarios[0]);

                    vm.popup = PopUpPrelogin(count);
                })
                .then(function() {
                    ClientAPIFactory.async('GetRetornaCnpjDaEmpresa')
                        .then(function(response){
                            HostFactory.setCnpj(response[0]);
                        });
                })

            ;
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
