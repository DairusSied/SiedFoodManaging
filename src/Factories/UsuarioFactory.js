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
