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
        .constant("keyCodes", {
            A: 65,
            B: 66,
            C: 67,
            D: 68,
            E: 69,
            F: 70,
            G: 71,
            H: 72,
            I: 73,
            J: 74,
            K: 75,
            L: 76,
            M: 77,
            N: 78,
            O: 79,
            P: 80,
            Q: 81,
            R: 82,
            S: 83,
            T: 84,
            U: 85,
            V: 86,
            W: 87,
            X: 88,
            Y: 89,
            Z: 90,
            ZERO: 48,
            ONE: 49,
            TWO: 50,
            THREE: 51,
            FOUR: 52,
            FIVE: 53,
            SIX: 54,
            SEVEN: 55,
            EIGHT: 56,
            NINE: 57,
            0: 96,
            NUMPAD_1: 97,
            NUMPAD_2: 98,
            NUMPAD_3: 99,
            NUMPAD_4: 100,
            NUMPAD_5: 101,
            NUMPAD_6: 102,
            NUMPAD_7: 103,
            NUMPAD_8: 104,
            NUMPAD_9: 105,
            NUMPAD_MULTIPLY: 106,
            NUMPAD_ADD: 107,
            NUMPAD_ENTER: 108,
            NUMPAD_SUBTRACT: 109,
            NUMPAD_DECIMAL: 110,
            NUMPAD_DIVIDE: 111,
            F1: 112,
            F2: 113,
            F3: 114,
            F4: 115,
            F5: 116,
            F6: 117,
            F7: 118,
            F8: 119,
            F9: 120,
            F10: 121,
            F11: 122,
            F12: 123,
            F13: 124,
            F14: 125,
            F15: 126,
            COLON: 186,
            EQUALS: 187,
            UNDERSCORE: 189,
            QUESTION_MARK: 191,
            TILDE: 192,
            OPEN_BRACKET: 219,
            BACKWARD_SLASH: 220,
            CLOSED_BRACKET: 221,
            QUOTES: 222,
            BACKSPACE: 8,
            TAB: 9,
            CLEAR: 12,
            ENTER: 13,
            SHIFT: 16,
            CONTROL: 17,
            ALT: 18,
            CAPS_LOCK: 20,
            ESC: 27,
            SPACEBAR: 32,
            PAGE_UP: 33,
            PAGE_DOWN: 34,
            END: 35,
            HOME: 36,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            INSERT: 45,
            DELETE: 46,
            HELP: 47,
            NUM_LOCK: 144
        }).directive("keyboard", function ($document, keyCodes) {
            return {
                link: function (scope, element, attrs) {

                    var keysToHandle = scope.$eval(attrs.keyboard);
                    var keyHandlers = {};

                    // Registers key handlers
                    angular.forEach(keysToHandle, function (callback, keyName) {
                        var keyCode = keyCodes[keyName];
                        keyHandlers[keyCode] = { callback: callback, name: keyName };
                    });
                    // Bind to document keydown event
                    $document.on("keydown", function (event) {
                        var keyDown = keyHandlers[event.keyCode];
                        // Handler is registered
                        if (keyDown) {
                            // event.preventDefault();
                            // Invoke the handler and digest
                            scope.$apply(function () {
                                keyDown.callback(keyDown.name, event.keyCode);
                                console.log(keyDown.name);
                            })
                        }
                    });
                }
            };
        })
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
        })
        .controller('HomeCtrl', HomeController);


    HomeController.$inject = ['$scope', '$interval', '$mdDialog', 'pacoteSrvc'];

    function HomeController($scope, $interval, $mdDialog, pacoteSrvc) {
        //shortcuts (atalhos de telhado)
        $scope.multiplicador = 1;
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

        vm.keys = {
            F3: function (name, code) {
                $scope.fnF3()
            }
        };
        $scope.retornodaCall = function (dados) {
            console.log('dentro da call')
            $scope.multiplicador = dados.QTD;
            // alert('dados da call '+dados.QTD)
        }
        $scope.fnF3 = function () {
            console.log("chamou modal")
                vm.modalMultQtd($scope.retornodaCall)
        }


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
                    // vm.modalDemonstrativo() //HIDE
                });
        };
        vm.modalDemonstrativo = function (codfiscal) {
            // alert('abriu demo modal');
            console.log("modal demo")
            $mdDialog.show({
                controller: DialogDemoController,
                templateUrl: './app/features/home/home.mdl.demonstrativo.html',
                parent: angular.element(document.body),
                // targetEvent: ev,
                escapeToClose: true,
                locals: {
                    codbar: 'ok',
                    codfiscal: codfiscal,
                    erro: ''
                },
                clickOutsideToClose: false,
                fullscreen: true // Only for -xs, -sm breakpoints.
            })
                .then(function () {
                    $scope.focusInput = true;
                    pacoteSrvc.listaPacotes23(vm.servico.transito).then(function (res) {
                        if (res.length) {
                            $scope.desserts.data = res;
                            console.log($scope.desserts)
                        }
                        else {
                            $scope.desserts.data = [];
                            alert('fim dos volumes')
                            pacoteSrvc.atualizaTransito().then(function(){
                                alert('feche o transito')
                            },function(){
                                alert('erros no transito')
                            })
                        }
                    });
                }, function () {
                    $scope.focusInput = true;
                    pacoteSrvc.listaPacotes23(vm.servico.transito).then(function (res) {
                        if (res.length) {
                            $scope.desserts.data = res;
                            console.log($scope.desserts)
                        }
                        else {
                            $scope.desserts.data = [];
                            alert('fim dos volumes')

                        }
                    });
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
                    erro: vm.servico.erro.message,
                    maxQtd: ''
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
                    erro: '',
                    maxQtd: ''
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
                    erro: '',
                    maxQtd: ''
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
        vm.modalMultQtd = function (callback, maxQtd) {
            console.log('abriu modal Multiplicado de quantidades')
            $mdDialog.show({
                controller: DialogController,
                templateUrl: './app/features/home/home.mdl.multiplicaqtd.html',
                // parent: angular.element(document.body),
                // targetEvent: ev,
                hasBackdrop: true,
                locals: {
                    codbar: '',
                    erro: '',
                    maxQtd: maxQtd
                },
                clickOutsideToClose: false,
                fullscreen: false, // Only for -xs, -sm breakpoints.
                multiple: true
            })
                .then(function (dados) {
                    console.log('then do modal')
                    $scope.focusInput = true;
                    callback(dados)

                }, function () { });
        };
        vm.modalCodbarGenerico = (callback, maxQtd) => {
            console.log('abriu modal de codbar generico')
            $mdDialog.show({
                controller: DialogController,
                templateUrl: './app/features/home/home.mdl.multiplicaqtd.html',
                // parent: angular.element(document.body),
                // targetEvent: ev,
                hasBackdrop: true,
                locals: {
                    codbar: '',
                },
                clickOutsideToClose: false,
                fullscreen: false, // Only for -xs, -sm breakpoints.
                multiple: true
            })
                .then(function (dados) {
                    console.log('then do modal')
                    $scope.focusInput = true;
                    callback(dados)

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
                    erro: '',
                    maxQtd: ''
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
                    erro: '',
                    maxQtd: ''
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
                    erro: '',
                    maxQtd: ''
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
        function DialogDemoController($scope, $mdDialog, $mdEditDialog, pacoteSrvc, locals) {
            console.log(locals.codfiscal)
            $scope.consulta = []
            $scope.multiplicador = 1
            $scope.retornodaCall = function (dados) {
                console.log('dentro da call')
                $scope.multiplicador = dados.QTD;
                // alert('dados da call '+dados.QTD)
            }
            $scope.keys = {
                F3: function (name, code) {
                    $scope.fnF3()
                }
            };
            $scope.fnF3 = function () {
                console.log("chamou modal")
                console.log($scope.selecionado)
                if ($scope.selecionado) {
                    vm.modalMultQtd($scope.retornodaCall, $scope.selected[0].QTD)
                }
                else {
                    alert('Selecione uma Opção')
                }
            }
            // console.log(codbar)
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
            pacoteSrvc.listaPacotes24(vm.servico.transito,locals.codfiscal).then(function (res) {
                $scope.desserts.data = res;
                console.log($scope.desserts)
            });
            $scope.imprimeCodbar = (dados) => {
                console.log(dados)
                imprime('CODBAR', vm.servico, dados)
                $scope.focusInput = true;
            }
            $scope.testefuncao = function () {
                // alert('teste')
                // console.log('postou leitor', codbar)
                $scope.consulta.input = '';
                // if (codbar != $scope.selected.CODBAR) {
                //     alert('código de barras incorreto')
                // }
                console.log('dados corretos')
                let dados = {
                    'CODPRO': $scope.selected[0].CODPRO,
                    'QTD': 1,
                    'MULTIPLICADOR': $scope.multiplicador || 1
                }
                console.log(dados)
                pacoteSrvc.criaPacote24(dados).then(function (result) {
                    console.log('resultado', result)
                    let pacotes = result.length;
                    $scope.selected[0].QTD -= pacotes;
                    $scope.multiplicador = 1;
                    if ($scope.selected[0].QTD == 0) {
                        $scope.selecionado = '';
                        $scope.selected = [];
                        console.log('restante',$scope.desserts.reduce((total,linha) => total+linha.QTD ,0))
                       if(!$scope.desserts.reduce((total,linha) => total+linha.QTD ,0)) {
                        $scope.hide()
                       }

                    }
                }, function (err) { console.log(err) })
            }
            $scope.editComment = function (event, dessert) {
                event.stopPropagation(); // in case autoselect is enabled
                var editDialog = {
                    modelValue: dessert.QTDIMPRIME,
                    placeholder: 'QUANTIDADE',
                    save: function (input) {
                        // if (input.$modelValue === 'Donald Trump') {
                        //     input.$invalid = true;
                        //     return $q.reject();
                        // }
                        // if (input.$modelValue === 'Bernie Sanders') {
                        //     return dessert.comment = 'FEEL THE BERN!'
                        // }
                        dessert.QTDIMPRIME = input.$modelValue;
                        $scope.focusInput = true;
                        $scope.imprimeCodbar(dessert);
                    },
                    targetEvent: event,
                    title: 'QUANTIDADE',
                    validators: {
                        'md-maxvalue': dessert.QTD
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
                console.log(item.CODPRO, 'was selected');
                $scope.selecionado = item.CODPRO;
                console.log(item, $scope.selecionado)
                console.log('selected', $scope.selected)
            };
            $scope.logOrder = function (order) {
                console.log('order: ', order);
            };
            $scope.logPagination = function (page, limit) {
                console.log('page: ', page);
                console.log('limit: ', limit);
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
        //         "count": 1,E
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

        function DialogController($scope, $mdDialog, codbar, erro, maxQtd) {
            console.log(codbar)
            if (codbar) {
                $scope.codbar = codbar;
            }
            if (erro) {
                $scope.erro = erro;
            }
            $scope.maxQtd = maxQtd || '';
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.ok = function (volume) {
                console.log('ok')
                if ($scope.maxQtd) {
                    if (volume.QTD > $scope.maxQtd) {
                        alert('QUANTIDADE MAIOR QUE O TOTAL')
                        $scope.volume.QTD = ''
                    }
                    else {
                        $mdDialog.hide(volume);
                    }
                }
                else if (!$scope.codbar) {
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
                //impressão de volumes (etiqueta superior) //
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
                    texto += '102200002200040' + dados.DESCRICAO.slice(0,17) + '\n' // descricao linha 1
                    texto += '102200001900040' + dados.DESCRICAO.slice(17,34) + '\n' // descricao linha 2
                    texto += '102200001600040' + dados.DESCRICAO.slice(34) + '\n'  // descricao linha 3 
                    texto += '102200000000140' + dados.CODPRO + '\n' // id do produto                   
                    texto += '1e1105000600040' + dados.CODBAR + '\n' // codigo de barras
                    texto += '102200000300040' + dados.CODBAR + '\n' // texto do codigo de barras
                    texto += 'Q'+(dados.QTDIMPRIME || 1)+'E\nQ'
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
            console.log('consulta pacote ',codbar)
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
                        // vm.erro = new Error('LEIA UM PACOTE');
                        // audioError();
                        pacoteSrvc.movePacoteGen(codbar,$scope.multiplicador).then(
                            function (response) {
                            vm.servico = response;
                            pacoteSrvc.listaPacotes(vm.servico.transito).then(function (res) {
                                if (res) {
                                    $scope.desserts.data = res;
                                    console.log($scope.desserts)
                                }
                                else {
                                    $scope.desserts.data = [];
                                }
                            });                            
                            audioOk();
                        },
                        function (response) {
                            console.log(response)
                            vm.servico = response;
                            pacoteSrvc.listaPacotes(vm.servico.transito).then(function (res) {
                                if (res) {
                                    $scope.desserts.data = res;
                                    console.log($scope.desserts)
                                }
                                else {
                                    $scope.desserts.data = [];
                                }
                            });                            
                            audioError()
                        })
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
                                // alert('status 7, preparacao')
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
                                pacoteSrvc.listaPacotes(vm.servico.transito).then(function (res) {
                                    if (res) {
                                        $scope.desserts.data = res;
                                        console.log($scope.desserts)
                                    }
                                    else {
                                        $scope.desserts.data = [];
                                    }
                                });                          
                                vm.modalCriaVolume();
                                // imprime(0,0,V00000,0,0,123456,10)
                            } else if (vm.servico.transito.TIPO == 3 && (vm.servico.transito.STATUS == 2 || vm.servico.transito.STATUS == 5) && !vm.servico.volume.CODBAR && vm.servico.transito.OSTIPO != 'ENTREGA ') {
                                pacoteSrvc.listaPacotes(vm.servico.transito).then(function (res) {
                                    if (res) {
                                        $scope.desserts.data = res;
                                        console.log($scope.desserts)
                                    }
                                    else {
                                        $scope.desserts.data = [];
                                    }
                                });
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
                            pacoteSrvc.listaPacotes23(vm.servico.transito, response.pacote.CODIGO_FISCAL).then(function (res) {
                                if (res.length) {
                                    $scope.desserts.data = res;
                                    console.log($scope.desserts)
                                }
                                else {
                                    $scope.desserts.data = [];
                                    vm.modalDemonstrativo(response.pacote.CODIGO_FISCAL);
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
                pacoteSrvc.movePacoteGen(codbar,$scope.multiplicador).then(
                    function (response) {
                    vm.servico = response;
                    pacoteSrvc.listaPacotes(vm.servico.transito).then(function (res) {
                        if (res) {
                            $scope.desserts.data = res;
                            console.log($scope.desserts)
                        }
                        else {
                            $scope.desserts.data = [];
                        }
                    });                            
                    audioOk();
                },
                function (response) {
                    console.log(response)
                    vm.servico = response;
                    pacoteSrvc.listaPacotes(vm.servico.transito).then(function (res) {
                        if (res) {
                            $scope.desserts.data = res;
                            console.log($scope.desserts)
                        }
                        else {
                            $scope.desserts.data = [];
                        }
                    });                            
                    audioError()
                })
            }
            console.log(vm.servico)
            $scope.multiplicador=1;
        }

        ////////////////

        function activate() { }
    }
})();