(function () {
    'use strict';

    angular.module('sied.factories').factory('DataFactory', DataFactory);

    DataFactory.$inject = ['$q', '$log'];

    function DataFactory($q, $log) {
        var _db;
        var _servidores;
        var _entidade;

        function initDB() {
            _db = new PouchDB('sied_dev', {adapter: 'websql'});
        }

        initDB();

        function addServidor(dados) {
            return $q.when(_db.put(dados)).then(function (response) {
                return response;
            }).catch(function (error) {
                $log.error(error);
            });
        }

        function updateServidor(dados) {
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

                    _db.changes({live: true, since: 'now', include_docs: true})
                        .on('change', onDatabaseChange);

                    return _servidores;
                });
        }

        function onDatabaseChange(change) {
            var index = findIndex(_servidores, change.id);
            var servidor = _servidores[index];

            if (change.deleted) {
                if (servidor) {
                    _servidores.splice(index, 1);
                }
            } else {
                if (servidor && servidor._id === change.id) {
                    _servidores[index] = change.doc;
                } else {
                    _servidores.splice(index, 0, change.doc);
                }
            }
        }

        function findByValue(value){
            return $q.when(_db.find({
                selector: {Ip: value}
            })).then(function(response){
                _entidade = response.docs[0];

                return _entidade;
            });
        }

        function findIndex(array, id) {
            var low = 0, high = array.length, mid;
            while (low < high) {
                mid = (low + high) >>> 1;
                array[mid]._id < id ? low = mid + 1 : high = mid
            }
            return low;
        }

        return {
            initDB: initDB,
            allServidores: allServidores,
            addServidor: addServidor,
            updateServidor: updateServidor,
            deleteServidor: deleteServidor,
            findByValue: findByValue
        }
    }
})();
