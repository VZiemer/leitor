(function () {
    'use strict';

    angular
        .module('leitorEstoque')
        .controller('HomeCtrl', HomeController);

    HomeController.$inject = ['$scope', '$mdSidenav', '$mdToast', 'pacoteSrvc'];

    function HomeController($scope, $mdSidenav, $mdToast, pacoteSrvc) {
        var vm = this;
        vm.pacote = {

        }
        vm.consultaPacote = function (codbar) {
            vm.ERROR = ''
            vm.pacote = {}
            switch (codbar.slice(0, 1)) {
                case 'A':
                    console.log('pacote', codbar)
                    pacoteSrvc.consultaSituacao(codbar).then(
                        function (response) {
                            vm.pacote = response[0];
                            $scope.$apply()
                        },
                        function (response) {
                            console.log(response)
                            vm.ERROR = response
                            vm.pacote = {};
                            $scope.$apply()

                        }
                    )
                    break;
                case 'E':
                    console.log('endereco', codbar)
                    pacoteSrvc.abreEndereco(codbar).then(
                        function (response) {
                            vm.pacote = response[0];
                            $scope.$apply()
                        },
                        function (response) {
                            console.log(response)
                            vm.ERROR = response
                            vm.pacote = {};
                            $scope.$apply()

                        }
                    )
                    break;
                case 'O':
                    console.log(codbar)
                    break;
                default:
                    console.log(codbar)
            }
        }



        ////////////////

        function activate() {}
    }
})();