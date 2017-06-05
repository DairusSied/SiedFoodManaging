(function () {
  'use strict';

  angular.module('sied.factories').factory('MenuFactory', MenuFactory);

  MenuFactory.$inject = ['$q'];

  function MenuFactory($q) {
    function montar(count) {
      var defer = $q.defer();

      var data = [];
      if (count == 0) {
        data = [
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
        defer.resolve(data);

        return defer.promise;
      }

      data = [
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
      defer.resolve(data);

      return defer.promise;
    }

    return {
      montar: montar
    }
  }
})();
