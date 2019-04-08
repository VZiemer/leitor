(function () {
    'use strict';

    angular
        .module('leitorEstoque')
        .config(
            [
                '$routeProvider', '$mdThemingProvider', '$mdIconProvider',
                function ($routeProvider, $mdThemingProvider, $mdIconProvider) {
                    $mdIconProvider
                    .defaultFontSet('FontAwesome')
                    .fontSet('fa', 'FontAwesome');
                    $mdThemingProvider.theme('default').primaryPalette('indigo');

                    $routeProvider.when(
                        '/home', {
                            templateUrl: './app/features/home/home.html',
                            controller: 'HomeCtrl',
                            controllerAs: 'vm'


                        }
                    );
                    $routeProvider.otherwise({ redirectTo: '/home' });

                }
            ]
        );
})();