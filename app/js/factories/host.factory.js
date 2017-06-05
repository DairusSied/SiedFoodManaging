(function () {
  'use strict';

  angular.module('sied.factories').factory('HostFactory', HostFactory);

  function HostFactory() {
    var config;
    var cnpj;

    function setConfig(value) {
      config = value;
    }

    function getConfig() {
      return config;
    }

    function setCnpj(value) {
      cnpj = value;
    }

    function getCnpj() {
      return cnpj;
    }

    return ({
      setConfig: setConfig,
      getConfig: getConfig,
      setCnpj: setCnpj,
      getCnpj: getCnpj
    });
  }
})();
