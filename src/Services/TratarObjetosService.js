(function () {
    'use strict';

    angular.module('sied.services').service('TratarObjetosService', TratarObjetosService);

    function TratarObjetosService() {
        this.ContarObjetos = function (obj) {
            var result = 0;
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    result++;
                }
            }
            return result;
        }
    }
})();

