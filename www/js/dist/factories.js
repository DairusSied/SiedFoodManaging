(function () {
  'use strict';

  angular.module('sied.factories').factory('ClientAPIFactory', ClientAPIFactory);

  ClientAPIFactory.$inject = [
    '$http',
    'ServidorFactory',
    '$window',
    '$ionicPopup',
    '$ionicLoading',
    '$timeout',
    '$log'
  ];

  function ClientAPIFactory($http, ServidorFactory, $window, $ionicPopup, $ionicLoading, $timeout, $log) {
    var api = null;
    function getAPI() {
      return ServidorFactory.lastServidor().then(function (response) {
        return response[0].servidor;
      }, function (error) {
        tratarErro(error);
      });
    }

    function getLink(parametro) {
      return getAPI().then(function (response) {
        api = response;
        return 'http://' + response + '/datasnap/rest/TServidorDeMetodosGerais/' + parametro;
      }, function (error) {
        tratarErro(error);
      });
    }

    function RemoverLoading() {
      $timeout(function () {
        $ionicLoading.hide();
      }, 1000);
    }

    function tratarErro(response) {
      var mensagem = 'Não foi possível concluir o processo. \nContate o Suporte';
      var status = response.status;
      if (response.data) {
        $log.info('Atenção: ' + response.data.error + '\nStatus: ' + status);
      }
      if (status == -1) {
        mensagem = 'Não foi possível conectar com o Servidor. \nVerifique se o servidor está ativo ou configure o IP novamente';
        $log.error('Problemas de Conexão: Servidor não está conectado, ip/porta: ' + api);
      }
      exibirMensagem(mensagem, status);
    }

    function exibirMensagem(mensagem, status) {
      RemoverLoading();

      return $ionicPopup.show({
        template: mensagem,
        title: 'Atenção',
        buttons: [
          {
            text: 'OK',
            type: 'button-positive',
            onTap: function (e) {
              // if (status === -1) {
              //   $window.location = '';
              // }
              return;
            }
          }
        ]
      });
    }

    function asyncLogin(parametro) {
      $ionicLoading.show();

      return getLink(parametro).then(function (link) {
        return $http.get(link, {$timeout: 1000}).then(
          function (response) {
            RemoverLoading();

            return response.data.result;
          },
          function (error) {
            tratarErro(error);
          }
        );
      });
    }

    function async(parametro) {
      $ionicLoading.show();

      return getLink(parametro).then(function (link) {
        return $http.get(link).then(
          function (response) {
            RemoverLoading();

            return response.data.result;
          },
          function (error) {
            tratarErro(error);
          }
        );
      });
    }

    return {
      link: getLink,
      async: async,
      asyncLogin: asyncLogin
    }
  }
})();

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

(function () {
    'use strict';

    angular.module('sied.factories').factory('SlideIndexFactory', SlideIndexFactory);

    function SlideIndexFactory() {
        var index;

        function setIndex(value) {
            index = value;
        }

        function getIndex() {
            return index;
        }

        return {
            setIndex: setIndex,
            getIndex: getIndex
        }
    }
})();

(function () {
    'use strict';

    angular.module('sied.factories').factory('UsuarioFactory', UsuarioFactory);

    function UsuarioFactory() {
        var codigo;
        var nome;
        var senha;
        var nivel;

        function setCodigo(value) {
            codigo = value;
        }

        function getCodigo() {
            return codigo;
        }

        function setNome(value) {
            nome = value;
        }

        function getNome() {
            return nome;
        }

        function setSenha(value) {
            senha = value;
        }

        function getSenha() {
            return senha;
        }

        function setNivel(value) {
            nivel = value;
        }

        function getNivel() {
            return nivel;
        }

        function setParams(obj) {
            setCodigo(obj.setCodigo);
            setNome(obj.Nome);
            setSenha(obj.Senha);
            setNivel(obj.Nivel);
        }

        return {
            setParams: setParams,
            setCodigo: setCodigo,
            getCodigo: getCodigo,
            setNome: setNome,
            getNome: getNome,
            setSenha: setSenha,
            getSenha: getSenha,
            setNivel: setNivel,
            getNivel: getNivel
        }
    }
})();
