'use strict';

module.exports = function (config) {
    config.set({

        basePath: '',

        plugins: [
            require('karma-jasmine'),
            require('karma-jasmine-matchers'),
            require('karma-jasmine-html-reporter'),
            require('karma-coverage-istanbul-reporter'),
            require('karma-chrome-launcher')
        ],

        frameworks: ['jasmine', 'jasmine-matchers'],

        files: [
            './node_modules/angular/angular.js',
            './node_modules/angular-route/angular-route.js',
            './node_modules/angular-mock/angular-mock.js',
            './src/**/*.js',
            './src/**/*Spec.js',
        ],

        exclude: [],

        preprocessors: { },

        angularCli: {
            environment: 'dev'
        },

        coverageIstanbulReporter: {
            reports: [ 'html', 'lcovonly' ],
            fixWebpackSourcePaths: true
        },

        //reporters: ['progress', 'kjhtml'],
        reporters: config.angularCli && config.angularCli.codeCoverage
            ? ['progress', 'coverage-istanbul']
            : ['progress', 'kjhtml'],

        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: true,

        browsers: ['Chrome'],

        singleRun: false,

        concurrency: Infinity
    })
}
