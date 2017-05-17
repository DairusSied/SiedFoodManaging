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
