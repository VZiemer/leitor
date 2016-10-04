(function () {
    'use strict';
        
      angular
        .module('ventronElectron')
        .config(
            [
                '$routeProvider', '$mdThemingProvider',
                function ($routeProvider, $mdThemingProvider) {
                    $mdThemingProvider.theme('default').primaryPalette('indigo');

                    $routeProvider.when(
                        '/home', {
                            templateUrl: './app/features/home/home.html',
                            controller: 'HomeCtrl',
                            controllerAs: 'vm'


                        }
                    );
                    $routeProvider.otherwise({redirectTo: '/home'});
                }
            ]
        );
})();