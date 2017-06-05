(function () {
  'use strict';

  angular.module('sied.factories').factory('ServidorFactory', ServidorFactory);

  ServidorFactory.$inject = ['$q', '$log'];

  function ServidorFactory($q, $log) {
    var _db;
    var _servidores;
    var _entidade;

    function initDB() {
      _db = new PouchDB('sied_selected', {adapter: 'websql'});
    }

    initDB();

    function addServidor(dados) {
      lastServidor();

      return $q.when(_db.put(dados)).then(function (response) {
        return response;
      }).catch(function (error) {
        $log.error(error);
      });
    }

    function deleteServidor(dados) {
      return $q.when(_db.remove(dados)).then(function (response) {
        return response;
      }).catch(function (error) {
        return error;
      });
    }

    function allServidores() {
      return $q.when(_db.allDocs({include_docs: true}))
        .then(function (docs) {
          _servidores = docs.rows.map(function (row) {
            return row.doc;
          });
          return _servidores;
        });
    }

    function lastServidor() {
      return $q.when(_db.find({selector: {_id: {$gte: null}}})
        .then(function (response) {

          _servidores = response.docs;

          return _servidores;
        }).catch(function (error) {
          $log.info(error);
        }))
    }

    function findByValue(value) {
      return $q.when(_db.find({
        selector: {servidor: value}
      })).then(function (response) {
        _entidade = response.docs[0];

        return _entidade;
      });
    }

    function limparServidores() {
      return $q.when(_db.allDocs({include_docs: true}))
        .then(function (response) {
          _servidores = response;

          var i = 0;
          if (_servidores.total_rows > 0) {
            while (i < _servidores.total_rows) {
              _db.remove(_servidores.rows[i].doc);
              +i++;
            }
          }
        });
    }

    return {
      initDB: initDB,
      allServidores: allServidores,
      addServidor: addServidor,
      lastServidor: lastServidor,
      findByValue: findByValue,
      deleteServidor: deleteServidor,
      limparServidores: limparServidores
    }
  }
})();
