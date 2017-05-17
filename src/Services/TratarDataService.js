(function () {
    'use strict';

    angular.module('sied.services').service('TratarDataService', TratarDataService);

    function TratarDataService() {
        this.SubtrairData = function (qtdeDias) {
            var d = new Date();

            d.setDate(d.getDate() - qtdeDias);

            return this.formatarData(d);
        };

        this.SubtrairDataSemFormato = function (qtdeDias) {
            var d = new Date();

            d.setDate(d.getDate() - qtdeDias);

            return d;
        };

        this.formatarData = function (data) {
            return data.getDate() + '/' + this.RetornarMes(data) + '/' + data.getFullYear();
        };

        this.formatarDataAPI = function (data) {
            return data.getDate() + '-' + this.RetornarMes(data) + '-' + data.getFullYear();
        };

        this.formatarDataHora = function (data) {
            return data.getDate() + '-' + this.RetornarMes(data) + '-' + data.getFullYear() + ' ' + data.getHours() + ':' + data.getMinutes() + ':' + data.getSeconds();
        };

        this.RetornarDataHora = function () {
            var d = new Date();

            return d.getDate() + '/' + this.RetornarMes(d) + '/' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes();
        }

        this.RetornarMes = function (data) {
            var m = data.getMonth() + 1;
            if (m < 10) {
                m = '0' + m;
            }
            return m;
        }
    }
})();
