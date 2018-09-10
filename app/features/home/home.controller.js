(function () {
    'use strict';
    const exec = require('child_process').exec;
    const fs = require('fs');
    const os = require('os');
    angular
        .module('leitorEstoque')
        .controller('HomeCtrl', HomeController);
    HomeController.$inject = ['$scope', '$interval', '$mdDialog', 'pacoteSrvc'];

    function HomeController($scope, $interval, $mdDialog, pacoteSrvc) {

        console.log(os.platform())

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


        //dialog
        vm.modalVolume = function (ev) {
            $mdDialog.show({
                    controller: DialogController,
                    templateUrl: './app/features/home/home.mdl.quebra.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: false,
                    fullscreen: true // Only for -xs, -sm breakpoints.
                })
                .then(function (medidas) {
                    pacoteSrvc.abreVolume(medidas).then(function (response) {
                        // vm.servico = response;
                        imprime('VOLUMESUP', vm.servico,response)
                    })
                }, function () {
                    $scope.status = 'You cancelled the dialog.';
                });
        };
        function DialogController($scope, $mdDialog) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.ok = function (volume) {
                $mdDialog.hide(volume);
            };
        }
        //fim dialog
        function imprime(tipo, servico,dados) {
            console.log('impressão');
            let texto = '';
            if (tipo === 'PACOTE') {
                // impressão de pacote
                texto = 'm\nC0026\nL\nH8\nD11\n'
                texto += '1W1d5301000900030' + codbar + '\n'
                texto += '121100002000200' + codbar.slice(2, 6) + '\n'
                texto += '121100002000345' + codbar + '\n'
                texto += '121100001400190' + descricao.slice(0, 29) + '\n'
                texto += '121100001000190' + descricao.slice(30, 59) + '\n'
                texto += '121100000600190' + descricao.slice(60, 89) + '\n'
                texto += '121100000200190ID ' + id + '\n'
                texto += '121100000200030 ' + qtd + ' ' + unidade + '\n'
                texto += 'E\nQ\n'
            }
            if (tipo === 'ENDERECO') {
                //impressão de endereço
                texto = 'm\nC0026\nL\nH8\nD11\n'
                texto += '1W1d5301000900030' + codbar + '\n'
                texto += '122200001300220' + codbar.slice(6, 6) + ' ' + codbar.slice(7, 8) + ' ' + codbar.slice(10, 10) + ' ' + codbar.slice(10, 11) + '\n'
                texto += '121100002000220corr  est   niv   cx\n'
                texto += '121100000800220' + descricao.slice(0, 29) + '\n'
                texto += '121100001000190' + descricao.slice(30, 59) + '\n'
                texto += '121100000600190' + descricao.slice(60, 89) + '\n'
                texto += '121100000200190ID ' + id + '\n'
                texto += '121100000200030 ' + qtd + ' ' + unidade + '\n'
                texto += 'E\nQ\n'
            }

            //impressão de volumes (etiqueta superior)
            if (tipo === 'VOLUMESUP') {
                texto = 'm\nC0026\nL\nH8\nD11\n'
                texto += '1E1208001300100' + dados.CODBAR + '\n'
                texto += '122200000400050' + servico.transito.EXPEDICAO + '\n'
                if (dados.ALTURA && dados.LARGURA && dados.PROFUNDIDADE) {
                    texto += '121100000400450'+dados.ALTURA+'x'+dados.LARGURA+'x'+dados.PROFUNDIDADE+'cm\n'
                }
                texto += '121100000100030__________________________________________\n'
                texto += 'E\nQ\n'
            }
            //impressão de volumes (etiqueta inferior CONFERÊNCIA)
            if (tipo === 'VOLUMEINF') {
                texto = 'm\nC0026\nL\nH8\nD11\n'
                texto += '121100002300030__________________________________________\n'
                texto += '123400001100050568412\n'
                texto += '122300001300440888/888\n'
                texto += '1e120600018005000000008\n'
                texto += '12110000040050050.250 Kg\n'
                texto += 'E\nQ\n'
            }
            fs.writeFile('C:\\zzz.txt', texto, function () {
                // windows print
                if (os.platform() === 'win32') {
                    exec('copy c:\\zzz.txt \\\\pc10\\argox', function (error, stdout, stderr) {
                        console.log(stdout)
                    });
                }
                //linux print
                if (os.platform() === 'linux') {
                    exec('lp -o raw -d ARGOX zzz.txt', function (error, stdout, stderr) {
                        console.log(stdout)
                    });
                }
            })
        }

        function audioError() {
            var audio = new Audio('./lib/audio/error.wav');
            audio.play();
        }

        function audioOk() {
            var audio = new Audio('./lib/audio/ok.wav');
            audio.play();
        }

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
                        if (vm.servico.transito.TIPO == 3 && vm.servico.STATUS == 2) {
                            vm.modalVolume();
                            // imprime(0,0,V00000,0,0,123456,10)
                        }
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
                        if (response.pacote.SITUACAO == 7) {

                        }
                        if (response.pacote.SITUACAO == 20) {
                            vm.showAdvanced();
                        }
                        vm.servico = response;
                        audioOk();
                        imprime('PACOTE', vm.servico)
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