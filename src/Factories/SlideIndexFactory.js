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
