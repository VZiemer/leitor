(function() {
'use strict';

    angular
        .module('ventronElectron')
        .controller('HomeCtrl', HomeController);

    HomeController.$inject = ['$scope', '$mdSidenav', '$mdToast'];
    function HomeController($scope, $mdSidenav, $mdToast) {
        var vm = this;

        vm.login = login;

        function login(){
            alert("Parabéns, você concluiu o tutorial!!")
        }

        activate();

        ////////////////

        function activate() { }
    }
})();