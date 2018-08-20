(function () {
    'use strict';

    angular
        .module('leitorEstoque')
        .controller('HomeCtrl', HomeController);
    HomeController.$inject = ['$scope', '$interval', '$mdSidenav', '$mdToast', 'pacoteSrvc'];
    function HomeController($scope, $interval, $mdSidenav, $mdToast, pacoteSrvc) {
        var vm = this;
        vm.OS = {

        }
        vm.pacote = {

        }
        vm.clock = {
            time: "",
            interval: 1000
        };
        $interval(function () {
                vm.clock.time = Date.now();
            },
            vm.clock.interval);
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
                console.log('operador', codbar)
                pacoteSrvc.abreOperador(codbar).then(
                    function (response) {
                        vm.operador = response;
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
                default:
                    console.log(codbar)
            }
        }



        ////////////////

        function activate() {}
    }
})();