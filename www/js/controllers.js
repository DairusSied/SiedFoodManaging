angular.module('app').controller('IndexCtrl',
  function($rootScope, $scope, $stateParams, $q, $location, $window, $timeout) {
    $scope.onSlideMove = function(data){

    };
});
angular.module('app').controller('CaixaCtrl',
  function($scope, $http, $log) {
    $scope.titulo = 'Caixas do Dia';

    $scope.dias = '';

    $scope.dados = {};

    $scope.GetTurno = function() {
      $http.get('http://192.168.0.13:8080/datasnap/rest/TServidorDeMetodosGerais/GetTurno/' + $scope.dias)
        .then(function(response) {
          $scope.dados = response.data.result;
        });
    };

    $scope.init = function(dias) {
      $scope.dias = dias;

      $scope.GetTurno();
    };
  });
