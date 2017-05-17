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

                    _db.changes({live: true, since: 'now', include_docs: true})
                        .on('change', onDatabaseChange);

                    return _servidores;
                });
        }

        function lastServidor() {
            return $q.when(_db.find({ selector: {_id: {$gte: null}}})
                .then(function(response){

                _servidores = response.docs;

                _db.changes({live: true, since: 'now', include_docs: true})
                    .on('change', onDatabaseChange);

                return _servidores;
            }).catch(function(error) {
                $log.info(error);
            }))
        }

        function findByValue(value){
            return $q.when(_db.find({
                selector: {servidor: value}
            })).then(function(response){
                _entidade = response.docs[0];

                return _entidade;
            });
        }

        function limparServidores() {
            return $q.when(_db.allDocs({include_docs: true}))
                .then(function (response) {
                    _servidores = response;

                    var i = 0;
                    if (_servidores.total_rows > 0)
                    {
                        while(i < _servidores.total_rows)
                        {
                            _db.remove(_servidores.rows[i].doc._id, _servidores.rows[i].doc._rev);
                            +i++;
                        }
                    }
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
            lastServidor: lastServidor,
            findByValue: findByValue,
            deleteServidor: deleteServidor,
            limparServidores: limparServidores
        }
    }
})();
