(function () {
    'use strict';

    const exec = require('child_process').exec;
    const fs = require('fs');
    const os = require('os');
    const electron = require('electron');

    function zeroEsq(valor, comprimento, digito) {
        var length = comprimento - valor.toString().length + 1;
        return Array(length).join(digito || '0') + valor;
    };
    angular
        .module('leitorEstoque')
        .controller('HomeCtrl', HomeController)
        .directive('focusMe', function ($timeout) {
            return {
                scope: {
                    trigger: '=focusMe'
                },
                link: function (scope, element) {
                    scope.$watch('trigger', function (value) {
                        if (value === true) {
                            //console.log('trigger',value);
                            //$timeout(function() {
                            element[0].focus();
                            scope.trigger = false;
                            //});
                        }
                    });
                }
            };
        });

    HomeController.$inject = ['$scope', '$interval', '$mdDialog', 'pacoteSrvc'];

    function HomeController($scope, $interval, $mdDialog, pacoteSrvc) {
        const screenElectron = electron.screen;
        $scope.mainScreen = screenElectron.getPrimaryDisplay().workAreaSize.height;
        $scope.selected = [];
        $scope.limitOptions = [5, 10, 15];
        $scope.options = {
            rowSelection: true,
            multiSelect: false,
            autoSelect: true,
            decapitate: true,
            largeEditDialog: false,
            boundaryLinks: false,
            limitSelect: true,
            pageSelect: true
        };
        $scope.query = {
            order: 'name',
            limit: 5,
            page: 1
        };
        $scope.desserts = {
            "count": 1,
            "data": []
        };

        console.log(os.platform())
        var vm = this;
        vm.servico = {};
        $scope.focusInput = true;
        vm.clock = {
            time: "",
            interval: 1000
        };
        $interval(function () {
            vm.clock.time = Date.now();
        },
            vm.clock.interval);

        //dialogs
        vm.modalListaPacotes = function (ev, codfiscal) {
            console.log("modal demo")
            $mdDialog.show({
                controller: DialogListaController,
                templateUrl: './app/features/home/home.mdl.listaPacotes.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {
                    codfiscal: codfiscal,
                    // erro: vm.servico.erro.message || ''
                    erro: ''
                },
                clickOutsideToClose: false,
                fullscreen: true // Only for -xs, -sm breakpoints.
            })
                .then(function () {
                    // vm.modalDemonstrativo() //CANCEL
                }, function () {
                    vm.modalDemonstrativo() //HIDE
                });
        };
        vm.modalDemonstrativo = function (ev, produtos) {
            console.log("modal demo")
            $mdDialog.show({
                controller: DialogDemoController,
                templateUrl: './app/features/home/home.mdl.demonstrativo.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                escapeToClose :false,
                locals: {
                    codbar: 'ok',
                    // erro: vm.servico.erro.message || ''
                    erro: ''
                },
                clickOutsideToClose: false,
                fullscreen: true // Only for -xs, -sm breakpoints.
            })
                .then(function () {
                    $scope.focusInput = true;
                }, function () {
                    $scope.focusInput = true;
                });
        };
        vm.modalConfirmaErro = function (ev) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: './app/features/home/home.mdl.confirmaerro.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {
                    codbar: 'SIM',
                    erro: vm.servico.erro.message
                },
                clickOutsideToClose: false,
                fullscreen: true // Only for -xs, -sm breakpoints.
            })
                .then(function () {
                    audioOk();
                    $scope.focusInput = true;
                }, function () {
                    audioError();
                    vm.modalConfirmaErro();

                });
        };
        vm.modalConfirmaEtiqueta = function (ev, codbar) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: './app/features/home/home.mdl.quebra.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {
                    codbar: codbar,
                    erro: ''
                },
                clickOutsideToClose: false,
                fullscreen: true // Only for -xs, -sm breakpoints.
            })
                .then(function () {
                    pacoteSrvc.abreVolume(vm.servico.volume.CODBAR, '').then(
                        function (response) {
                            vm.servico = response;
                            audioOk();
                            $scope.focusInput = true;
                        },
                        function (response) {
                            console.log(response)
                            vm.servico = response;
                            vm.modalConfirmaErro();
                            audioError();
                        }
                    )
                }, function () { });
        };
        vm.modalEntraPeso = function (ev) {
            console.log('abriu modal entra peso')
            $mdDialog.show({
                controller: DialogController,
                templateUrl: './app/features/home/home.mdl.peso.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {
                    codbar: '',
                    erro: ''
                },
                clickOutsideToClose: false,
                fullscreen: true // Only for -xs, -sm breakpoints.
            })
                .then(function (volume) {
                    pacoteSrvc.abreVolume(vm.servico.volume.CODBAR, volume.PESO).then(
                        function (response) {
                            vm.servico = response;
                            audioOk();
                            $scope.focusInput = true;
                            if (response.erro.message == 'VOLUME FECHADO, PROXIMO') {
                                if (vm.servico.transito.TIPO == 3 && (vm.servico.transito.STATUS == 2 || vm.servico.transito.STATUS == 5) && !vm.servico.volume.CODBAR && vm.servico.transito.OSTIPO == 'ENTREGA') {
                                    vm.modalCriaVolume();
                                    // imprime(0,0,V00000,0,0,123456,10)
                                } else if (vm.servico.transito.TIPO == 3 && (vm.servico.transito.STATUS == 2 || vm.servico.transito.STATUS == 5) && !vm.servico.volume.CODBAR && vm.servico.transito.OSTIPO != 'ENTREGA ') {
                                    pacoteSrvc.criaVolume({
                                        'comprimento': 1,
                                        'largura': 1,
                                        'altura': 1
                                    }).then(function (response) {
                                        imprime('VOLUMESUP', vm.servico, response).then(function () {
                                            vm.modalConfirmaEtiqueta('', response.CODBAR)
                                        }, function () {

                                        })
                                    })
                                    // imprime(0,0,V00000,0,0,123456,10)
                                } else if (vm.servico.transito.TIPO == 3 && (vm.servico.transito.STATUS == 2 || vm.servico.transito.STATUS == 5) && !vm.servico.volume.CODBAR && vm.servico.transito.OSTIPO == 'RETIRA') {

                                }
                            }
                        },
                        function (response) {
                            console.log(response)
                            vm.servico = response;
                            vm.modalConfirmaErro();
                            audioError();
                        }
                    )
                }, function () { });
        };
        vm.modalFechaTransito = function (ev) {
            console.log('abriu modal fecha transito')
            $mdDialog.show({
                controller: DialogController,
                templateUrl: './app/features/home/home.mdl.peso.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {
                    codbar: '',
                    erro: ''
                },
                clickOutsideToClose: false,
                fullscreen: true // Only for -xs, -sm breakpoints.
            })
                .then(function (volume) {
                    console.log('abrepacote')
                    pacoteSrvc.abreVolume(vm.servico.volume.CODBAR, volume.PESO).then(
                        function () {
                            console.log('abretransito')
                            pacoteSrvc.abreTransito(vm.servico.transito.ID_TRANSITO).then(
                                function (response) {
                                    console.log('ok do abretransito')
                                    vm.servico = response;
                                    audioOk();
                                    $scope.focusInput = true;
                                },
                                function (response) {
                                    vm.servico = response;
                                    audioError();
                                })
                        },
                        function (response) {
                            console.log(response)
                            vm.servico = response;
                            vm.modalConfirmaErro();
                            audioError();
                        }
                    )
                }, function () {
                    $scope.desserts.data = [];
                });
        };
        vm.modalCriaVolume = function (ev) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: './app/features/home/home.mdl.criavolume.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {
                    codbar: '',
                    erro: ''
                },
                clickOutsideToClose: false,
                fullscreen: true // Only for -xs, -sm breakpoints.
            })
                .then(function (medidas) {
                    pacoteSrvc.criaVolume(medidas).then(function (response) {
                        imprime('VOLUMESUP', vm.servico, response).then(function () {
                            vm.modalConfirmaEtiqueta('', response.CODBAR)
                        }, function () {

                        })
                    })
                }, function () {
                    console.log('modal fechado')
                    // $scope.status = 'You cancelled the dialog.';
                });
        };
        vm.modalExcluiVolume = function (ev, codbar) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: './app/features/home/home.mdl.excluivolume.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {
                    codbar: codbar,
                    erro: ''
                },
                clickOutsideToClose: false,
                fullscreen: true // Only for -xs, -sm breakpoints.
            })
                .then(function (medidas) {
                    pacoteSrvc.excluiVolume(medidas.CODBAR).then(function (response) {
                        vm.servico = response;
                        audioOk();
                        $scope.focusInput = true;
                    })
                }, function () {
                    vm.servico = response;
                    vm.modalConfirmaErro();
                    audioError();
                    console.log('modal fechado')
                    // $scope.status = 'You cancelled the dialog.';
                });
        };

        function DialogDemoController($scope, $mdDialog, $mdEditDialog, pacoteSrvc, codbar, erro) {
            console.log(codbar)
            //data-table-example
            $scope.selected = [];
            $scope.limitOptions = [5, 10, 15];

            $scope.options = {
                rowSelection: true,
                multiSelect: false,
                autoSelect: true,
                decapitate: true,
                largeEditDialog: false,
                boundaryLinks: false,
                limitSelect: true,
                pageSelect: true
            };

            $scope.query = {
                order: 'name',
                limit: 5,
                page: 1
            };

            $scope.desserts = {
                "count": 1,
                "data": []
            };
            $scope.testeAlerta = function () {
                alert('teste bem sucedido');
            }
            pacoteSrvc.listaPacotes24(vm.servico.transito).then(function (res) {
                $scope.desserts.data = res;
                console.log($scope.desserts)
            });
            $scope.imprimeCodbar = (dados) => {
                console.log(dados)
                imprime('CODBAR', vm.servico, dados)
                $scope.focusInput = true;

            }
            $scope.editComment = function (event, dessert) {
                event.stopPropagation(); // in case autoselect is enabled
                var editDialog = {
                    modelValue: dessert.comment,
                    placeholder: 'QUANTIDADE',
                    save: function (input) {
                        if (input.$modelValue === 'Donald Trump') {
                            input.$invalid = true;
                            return $q.reject();
                        }
                        if (input.$modelValue === 'Bernie Sanders') {
                            return dessert.comment = 'FEEL THE BERN!'
                        }
                        dessert.qtdImprime = input.$modelValue;
                        $scope.focusInput = true;
                    },
                    targetEvent: event,
                    title: 'QUANTIDADE',
                    validators: {
                        'md-maxlength': 3
                    }
                };

                var promise;

                if ($scope.options.largeEditDialog) {
                    promise = $mdEditDialog.large(editDialog);
                } else {
                    promise = $mdEditDialog.small(editDialog);
                }

                promise.then(function (ctrl) {
                    var input = ctrl.getInput();

                    input.$viewChangeListeners.push(function () {
                        input.$setValidity('test', input.$modelValue !== 'test');
                    });
                });
            };

            $scope.toggleLimitOptions = function () {
                $scope.limitOptions = $scope.limitOptions ? undefined : [5, 10, 15];
            };

            $scope.getTypes = function () {
                return ['Candy', 'Ice cream', 'Other', 'Pastry'];
            };

            $scope.loadStuff = function () {
                $scope.promise = $timeout(function () {
                    // loading
                }, 2000);
            }

            $scope.logItem = function (item) {
                console.log(item.name, 'was selected');
                $scope.selecionado = item.CODPRO;
                console.log(item,$scope.selecionado)
            };

            $scope.logOrder = function (order) {
                console.log('order: ', order);
            };

            $scope.logPagination = function (page, limit) {
                console.log('page: ', page);
                console.log('limit: ', limit);
            }


            //fim do data-table






            if (codbar) {
                $scope.codbar = codbar;
            }
            if (erro) {
                $scope.erro = erro;
            }
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.ok = function (volume) {
                console.log('ok')
                if (!$scope.codbar) {
                    console.log('sem codbar')
                    $mdDialog.hide(volume);

                } else {
                    console.log('com codbar')
                    if ($scope.codbar == volume.CODBAR) {
                        $mdDialog.hide(volume)
                    } else {
                        console.log('invalido', $scope.codbar, volume.CODBAR)
                        $scope.volume.CODBAR = '';
                    }
                }
            };
        }

        // function DialogListaController($scope, $mdDialog, $mdEditDialog, pacoteSrvc, codfiscal, erro) {
        //     console.log(codfiscal)
        //     //data-table-example
        //     $scope.selected = [];
        //     $scope.limitOptions = [5, 10, 15];
        //     $scope.options = {
        //         rowSelection: true,
        //         multiSelect: false,
        //         autoSelect: true,
        //         decapitate: true,
        //         largeEditDialog: false,
        //         boundaryLinks: false,
        //         limitSelect: true,
        //         pageSelect: true
        //     };
        //     $scope.query = {
        //         order: 'name',
        //         limit: 5,
        //         page: 1
        //     };
        //     $scope.desserts = {
        //         "count": 1,
        //         "data": []
        //     };
        //     pacoteSrvc.listaPacotes23(vm.servico.transito, codfiscal).then(function (res) {
        //         $scope.desserts.data = res;
        //         if (!res.length) {
        //             $mdDialog.hide()
        //         }
        //         console.log($scope.desserts)
        //     });
        //     $scope.consultaPacote = function () {
        //         if (identificador === 'A') {
        //             // procura pacote
        //             console.log('pacote', codbar)
        //             pacoteSrvc.movePacote(codbar).then(
        //                 function (response) {
        //                     console.log('movepacoteres', response)
        //                     pacoteSrvc.listaPacotes23(vm.servico.transito, codfiscal).then(function (res) {
        //                         $scope.desserts.data = res;
        //                         if (!res.length) {
        //                             $mdDialog.hide()
        //                         }
        //                         console.log($scope.desserts)
        //                     });

        //                     vm.servico = response;
        //                     audioOk();
        //                 },
        //                 function (response) {
        //                     console.log(response)
        //                     vm.servico = response;
        //                     vm.modalConfirmaErro();
        //                     audioError();
        //                 }
        //             )
        //         }
        //     }
        //     $scope.editComment = function (event, dessert) {
        //         event.stopPropagation(); // in case autoselect is enabled
        //         var editDialog = {
        //             modelValue: dessert.comment,
        //             placeholder: 'Add a comment',
        //             save: function (input) {
        //                 // if (input.$modelValue === 'Donald Trump') {
        //                 //     input.$invalid = true;
        //                 //     return $q.reject();
        //                 // }
        //                 // if (input.$modelValue === 'Bernie Sanders') {
        //                 //     return dessert.comment = 'FEEL THE BERN!'
        //                 // }
        //                 // dessert.comment = input.$modelValue;
        //             },
        //             targetEvent: event,
        //             title: 'Add a comment',
        //             validators: {
        //                 'md-maxlength': 30
        //             }
        //         };

        //         var promise;

        //         if ($scope.options.largeEditDialog) {
        //             promise = $mdEditDialog.large(editDialog);
        //         } else {
        //             promise = $mdEditDialog.small(editDialog);
        //         }

        //         promise.then(function (ctrl) {
        //             var input = ctrl.getInput();

        //             input.$viewChangeListeners.push(function () {
        //                 input.$setValidity('test', input.$modelValue !== 'test');
        //             });
        //         });
        //     };

        //     $scope.toggleLimitOptions = function () {
        //         $scope.limitOptions = $scope.limitOptions ? undefined : [5, 10, 15];
        //     };

        //     $scope.getTypes = function () {
        //         return ['Candy', 'Ice cream', 'Other', 'Pastry'];
        //     };

        //     $scope.loadStuff = function () {
        //         $scope.promise = $timeout(function () {
        //             // loading
        //         }, 2000);
        //     }

        //     $scope.logItem = function (item) {
        //         console.log(item.name, 'was selected');
        //     };

        //     $scope.logOrder = function (order) {
        //         console.log('order: ', order);
        //     };

        //     $scope.logPagination = function (page, limit) {
        //         console.log('page: ', page);
        //         console.log('limit: ', limit);
        //     }


        //     //fim do data-table

        //     $scope.hide = function () {
        //         $mdDialog.hide();
        //     };
        //     $scope.cancel = function () {
        //         $mdDialog.cancel();
        //     };

        // }

        // function DialogController($scope, $mdDialog, codbar, erro) {
        //     console.log(codbar)
        //     if (codbar) {
        //         $scope.codbar = codbar;
        //     }
        //     if (erro) {
        //         $scope.erro = erro;
        //     }
        //     $scope.hide = function () {
        //         $mdDialog.hide();
        //     };
        //     $scope.cancel = function () {
        //         $mdDialog.cancel();
        //     };
        //     $scope.ok = function (volume) {
        //         console.log('ok')
        //         if (!$scope.codbar) {
        //             console.log('sem codbar')
        //             $mdDialog.hide(volume);

        //         } else {
        //             console.log('com codbar')
        //             if ($scope.codbar == volume.CODBAR) {
        //                 $mdDialog.hide(volume)
        //             } else {
        //                 console.log('invalido', $scope.codbar, volume.CODBAR)
        //                 $scope.volume.CODBAR = '';
        //             }
        //         }
        //     };
        // }
        //fim dialog
        function imprime(tipo, servico, dados) {
            return new Promise((resolve, reject) => {
                console.log('impressão', dados, servico);
                let texto = '';
                if (tipo === 'PACOTE') {
                    console.log('impressão pacote');
                    // impressão de pacote
                    texto = 'm\nC0026\nL\nH8\nD11\n'
                    texto += '1W1d5301000900030' + dados.pacote.CODBAR + '\n'
                    texto += '121100002000200' + dados.pacote.CODBAR.slice(2, 6) + '\n'
                    texto += '121100002000345' + dados.pacote.CODBAR + '\n'
                    texto += '121100001400190' + dados.pacote.DESCRICAO.slice(0, 29) + '\n'
                    texto += '121100001000190' + dados.pacote.DESCRICAO.slice(30, 59) + '\n'
                    texto += '121100000600190' + dados.pacote.DESCRICAO.slice(60, 89) + '\n'
                    texto += '121100000200190ID ' + dados.pacote.ID_PRODUTO + '\n'
                    texto += '121100000200030 ' + dados.pacote.QTD + ' ' + dados.pacote.UNIDADE + '\n'
                    texto += 'E\nQ\n'
                }
                if (tipo === 'ENDERECO') {
                    //impressão de endereço
                    console.log('impressão endereco');

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
                    console.log('impressão volume sup');

                    texto = 'm\nC0026\nL\nH8\nD11\n'
                    texto += '1E1208001300100' + dados.CODBAR + '\n'
                    texto += '122200000400050' + servico.transito.EXPEDICAO + '\n'
                    if (dados.ALTURA && dados.LARGURA && dados.PROFUNDIDADE) {
                        texto += '121100000400450' + dados.ALTURA + 'x' + dados.LARGURA + 'x' + dados.PROFUNDIDADE + 'cm\n'
                    }
                    texto += '121100000100030__________________________________________\n'
                    texto += 'E\nQ\n'
                }
                if (tipo === 'CODBAR') {
                    console.log('Impressão de codigo de barras');

                    texto = 'm\nC0026\nL\nH8\nD11\n'
                    texto += '1E1208001300100' + dados.CODBAR + '\n'
                    texto += '122200000400050' + 'teste123' + '\n'
                    texto += '121100000100030__________________________________________\n'
                    texto += 'E\nQ\n'
                }                
                //impressão de volumes (etiqueta inferior CONFERÊNCIA)
                if (tipo === 'VOLUMEINF') {
                    console.log('impressão volumeinf');

                    texto = 'm\nC0026\nL\nH8\nD11\n'
                    texto += '121100002300030__________________________________________\n'
                    texto += '123400001100050' + (servico.transito.NFE ? 'NF ' + servico.transito.NFE : servico.transito.DOCUMENTO) + '\n'
                    texto += '122300001300440' + zeroEsq(servico.volume.POSICAO, 2, 0) + '/' + zeroEsq(servico.volume.TOTAL, 2, 0) + '\n'
                    texto += '1e1206000180050' + zeroEsq(servico.volume.ID_VOLUME, 8, 0) + '\n'
                    texto += '121100000400500' + servico.volume.PESO + ' Kg\n'
                    texto += 'E\nQ\n'
                }
                fs.writeFile('zzz.txt', texto, function () {
                    // windows print
                    if (os.platform() === 'win32') {
                        console.log('impressão windows')
                        exec('copy zzz.txt \\\\pc10\\argox', function (error, stdout, stderr) {
                            if (error) resolve(stderr);
                            resolve(stdout);
                        });
                    }
                    //linux print
                    if (os.platform() === 'linux') {
                        console.log('impressão linux')
                        exec('lp -o raw -d ARGOX /zzz.txt', function (error, stdout, stderr) {
                            if (error) resolve(stderr);
                            resolve(stdout);
                        });
                    }
                })
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
                console.log('transito', vm.servico)
                if (vm.servico.transito && vm.servico.transito.TIPO == 3 && vm.servico.transito.STATUS == 2 && vm.servico.volume.CODBAR) {
                    if (vm.servico.transito.ID_TRANSITO == codbar) {
                        vm.modalFechaTransito();
                    } else {
                        vm.erro = new Error('LEIA UM PACOTE');
                        audioError();
                    }
                } else {
                    pacoteSrvc.abreTransito(codbar).then(
                        function (response) {
                            vm.servico = response;
                            if (!vm.servico.transito.ID_TRANSITO) {
                                $scope.desserts.data = [];
                            }
                            if (vm.servico.transito.TIPO == 7) {
                                pacoteSrvc.listaPacotes(vm.servico.transito).then(function (res) {
                                    if (res) {
                                        $scope.desserts.data = res;
                                        console.log($scope.desserts)
                                    }
                                    else {
                                        $scope.desserts.data = [];
                                    }
                                });
                            }
                            if (vm.servico.transito.TIPO == 3 && vm.servico.transito.STATUS == 7) {
                                alert('status 7, preparacao')
                                pacoteSrvc.listaPacotes23(vm.servico.transito).then(function (res) {
                                    if (res) {
                                        // vm.modalDemonstrativo() // teste de modal

                                        $scope.desserts.data = res;
                                        console.log($scope.desserts)
                                    }
                                    else {
                                        $scope.desserts.data = [];
                                    }
                                });
                            }
                            audioOk();
                            if (vm.servico.transito.TIPO == 3 && (vm.servico.transito.STATUS == 2 || vm.servico.transito.STATUS == 5) && !vm.servico.volume.CODBAR && vm.servico.transito.OSTIPO == 'ENTREGA') {
                                vm.modalCriaVolume();
                                // imprime(0,0,V00000,0,0,123456,10)
                            } else if (vm.servico.transito.TIPO == 3 && (vm.servico.transito.STATUS == 2 || vm.servico.transito.STATUS == 5) && !vm.servico.volume.CODBAR && vm.servico.transito.OSTIPO != 'ENTREGA ') {
                                pacoteSrvc.criaVolume({
                                    'comprimento': 1,
                                    'largura': 1,
                                    'altura': 1
                                }).then(function (response) {
                                    imprime('VOLUMESUP', vm.servico, response).then(function () {
                                        vm.modalConfirmaEtiqueta('', response.CODBAR)
                                    }, function () {

                                    })
                                })
                                // imprime(0,0,V00000,0,0,123456,10)
                            } else if (vm.servico.transito.TIPO == 3 && (vm.servico.transito.STATUS == 2 || vm.servico.transito.STATUS == 5) && !vm.servico.volume.CODBAR && vm.servico.transito.OSTIPO == 'RETIRA') {

                            }

                        },
                        function (response) {
                            console.log(response)
                            console.log('blabla')
                            vm.servico = response;
                            audioError();
                        }
                    )
                }
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
                        vm.modalConfirmaErro();
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
                        vm.modalConfirmaErro();
                        audioError();

                    }
                )

            } else if (identificador === 'A') {
                // procura pacote
                console.log('pacote', codbar)
                pacoteSrvc.movePacote(codbar).then(
                    function (response) {
                        console.log('movepacoteres', response)
                        if (response.pacote.SITUACAO == 7) {
                            console.log('situacao 12 p/ 7');
                            pacoteSrvc.listaPacotes(vm.servico.transito).then(function (res) {
                                if (res) {
                                    $scope.desserts.data = res;
                                    console.log($scope.desserts)
                                }
                                else {
                                    $scope.desserts.data = [];
                                }
                            });
                            if (response.pacote.codbar !== codbar) {
                                console.log('houve quebra', response)
                                imprime('PACOTE', vm.servico, response)
                            } else if (response.pacote.codbar === codbar) {
                                console.log('não houve quebra', response)
                            }
                        }
                        if (response.pacote.SITUACAO == 24) {
                            console.log('situacao 23 p/ 24');
                            pacoteSrvc.listaPacotes23(vm.servico.transito,response.pacote.CODFISCAL).then(function (res) {
                                if (res.length) {
                                    $scope.desserts.data = res;
                                    console.log($scope.desserts)
                                }
                                else {
                                    $scope.desserts.data = [];
                                      vm.modalDemonstrativo();
                                }
                            });
                        }
                        else {
                            pacoteSrvc.listaPacotes(vm.servico.transito).then(function (res) {
                                if (res) {
                                    $scope.desserts.data = res;
                                    console.log($scope.desserts)
                                }
                                else {
                                    $scope.desserts.data = [];
                                }
                            });
                        }
                        vm.servico = response;
                        audioOk();
                    },
                    function (response) {
                        console.log(response)
                        vm.servico = response;
                        vm.modalConfirmaErro();
                        audioError();
                    }
                )
            } else if (identificador === 'V') {
                // procura volume
                console.log('volume', codbar)
                if (vm.servico.volume.CODBAR == codbar && vm.servico.volume.SITUACAO == 1 && !vm.servico.volume.PESO) {
                    vm.modalEntraPeso();
                }
                if (vm.servico.volume.CODBAR && vm.servico.volume.CODBAR != codbar) {
                    pacoteSrvc.abreVolume(codbar).then(
                        function () {
                            vm.servico = response;
                            audioOk();
                        },
                        function () {
                            vm.servico = response;
                            audioError();
                        });
                } else if (!vm.servico.volume.CODBAR) {
                    pacoteSrvc.abreVolume(codbar).then(
                        function (response) {
                            pacoteSrvc.listaPacotes(vm.servico.transito).then(function (res) {
                                if (res) {
                                    $scope.desserts.data = res;
                                    console.log($scope.desserts)
                                }
                                else {
                                    $scope.desserts.data = [];
                                }
                            });
                            if (vm.servico.volume.SITUACAO == 2 && vm.servico.transito.STATUS == 2) {
                                vm.modalExcluiVolume('', vm.servico.volume.CODBAR);
                            } else if (vm.servico.volume.SITUACAO == 2 && vm.servico.transito.STATUS == 6) {
                                imprime('VOLUMEINF', vm.servico, response).then(function () {
                                    vm.modalConfirmaEtiqueta('', vm.servico.volume.ID_VOLUME)
                                    vm.servico = response;
                                    audioOk();
                                })
                            } else if (vm.servico.volume.SITUACAO == 3) {
                                vm.modalConfirmaErro();
                                audioError();
                            }
                        },
                        function (response) {
                            console.log(response)
                            vm.servico = response;
                            vm.modalConfirmaErro();
                            audioError();

                        }
                    )
                }
            } else {
                audioError();
                vm.servico.erro = new Error('COMANDO NÃO RECONHECIDO')
            }
            console.log(vm.servico)
        }

        ////////////////

        function activate() { }
    }
})();