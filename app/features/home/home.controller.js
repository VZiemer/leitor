(function () {
    'use strict';
    const exec = require('child_process').exec;
    angular
        .module('leitorEstoque')
        .controller('HomeCtrl', HomeController);
    HomeController.$inject = ['$scope', '$interval', '$mdSidenav', '$mdToast', 'pacoteSrvc'];

    function HomeController($scope, $interval, $mdSidenav, $mdToast, pacoteSrvc) {
        // windows print
        // exec('copy c:\\zzz.txt \\\\pc10\\argox', function(error,stdout,stderr) {console.log(stdout)});
        //linux print
        // exec('lp -o raw -d ARGOX zzz.txt', function(error,stdout,stderr) {console.log(stdout)});


        function audioError() {
            var audio = new Audio('./lib/audio/error.wav');
            audio.play();
        }

        function audioOk() {
            var audio = new Audio('./lib/audio/ok.wav');
            audio.play();
        }
        var vm = this;
        vm.servico = {};
        vm.clock = {
            time: "",
            interval: 1000
        };
        $interval(function () {
                vm.clock.time = Date.now();
            },
            vm.clock.interval);
        vm.consultaPacote = function (codbar) {
            var reg = new RegExp('^[0-9]+$');
            var identificador = codbar.slice(0, 1);
            var dig2 = codbar.slice(1, 2);
            if (reg.test(identificador)) {
                // procura transito
                console.log('transito', codbar)
                pacoteSrvc.abreTransito(codbar).then(
                    function (response) {
                        vm.servico = response;
                        audioOk();
                    },
                    function (response) {
                        console.log(response)
                        vm.servico = response;
                        audioError()
                    }
                )
            } else if (identificador === 'O' && dig2 === 'P') {
                // procura operador
                console.log('operador', codbar)
                pacoteSrvc.abreOperador(codbar).then(
                    function (response) {
                        vm.servico = response;
                        audioOk();
                    },
                    function (response) {
                        console.log(response)
                        vm.servico = response;
                        audioError()
                    }
                )
            } else if (identificador === 'O' && dig2 === 'S') {
                // procura ordem de serviço
                console.log('ordem', codbar)
                pacoteSrvc.abreOrdem(codbar).then(
                    function (response) {
                        vm.servico = response;
                        audioOk();
                    },
                    function (response) {
                        console.log(response)
                        vm.servico = response;
                        audioError();
                    }
                )

            } else if (identificador === 'E') {
                // procura endereco
                console.log('endereco', codbar)
                pacoteSrvc.abreEndereco(codbar).then(
                    function (response) {
                        vm.servico = response;
                        audioOk();
                    },
                    function (response) {
                        console.log(response)
                        vm.servico = response;
                        audioError();

                    }
                )
            } else if (identificador === 'A') {
                // procura pacote
                console.log('pacote', codbar)
                pacoteSrvc.movePacote(codbar).then(
                    function (response) {
                        vm.servico = response;
                        audioOk();
                    },
                    function (response) {
                        console.log(response)
                        vm.servico = response;
                        audioError();
                    }
                )
            } else {
                audioError();
                vm.servico.erro = new Error('COMANDO NÃO RECONHECIDO')
            }
        }



        ////////////////

        function activate() {}
    }
})();