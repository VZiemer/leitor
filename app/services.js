(function () {
    'use strict';
    //modulo de acesso ao firebird
    const Firebird = require('node-firebird');
    //configurações de acesso ao banco
    const options = require("./db.js");
    //classes para uso
    const Operador = require("./lib/operador.js").Operador;
    const OrdemServico = require("./lib/ordemServico.js").OrdemServico;
    const Transito = require("./lib/transito.js").Transito;
    const Endereco = require("./lib/endereco.js").Endereco;
    const Pacote = require("./lib/pacote.js").Pacote;
    const Volume = require("./lib/volume.js").Volume;
    //criação das variáveis
    var servico = {
        operador: new Operador(),
        ordem: new OrdemServico(),
        transito: new Transito(),
        endereco: new Endereco(),
        pacote: new Pacote(),
        volume: new Volume(),
        erro: new Error(),
        setor: {
            'DESCRICAO': '',
            'COR': '',
            'SENTIDO': '',
            'AJUDA': ''
        }
    }
    angular.module('leitorEstoque')
        .factory(
            'pacoteSrvc', ['$http', function ($http) {
                var abreOperador = function (CodBarras) {
                    servico.erro = new Error();
                    servico.pacote = new Pacote();
                    return new Promise((resolve, reject) => {
                        if (servico.endereco.CODBAR) {
                            servico.erro = new Error('FECHE O ENDEREÇO');
                            reject(servico);
                        } else if (servico.ordem.ID_OS || servico.transito.ID_TRANSITO) {
                            servico.erro = new Error('FECHE O SERVIÇO');
                            reject(servico);
                        } else if (servico.operador.CODBAR && servico.operador.CODBAR !== CodBarras) {
                            servico.erro = new Error('FECHE O OPERADOR ATUAL');
                            reject(servico);
                        } else if (servico.operador.CODBAR && servico.operador.CODBAR === CodBarras) {
                            servico.operador = new Operador();
                            servico.erro = new Error('OPERADOR FECHADO');
                            reject(servico);
                        } else {
                            Firebird.attach(options, function (err, db) {
                                if (err) {
                                    servico.erro = new Error('ERRO DE CONEXÃO')
                                    return reject(servico);
                                }
                                db.query("Select id_operador,nome,codbar from operador where codbar = ?", CodBarras, function (err, res) {
                                    if (err) {
                                        servico.erro = new Error('ERRO DE CONEXÃO')
                                        reject(servico);
                                    }
                                    db.detach(function () {
                                        if (!res.length) {
                                            servico.erro = new Error('USUÁRIO NÃO EXISTE')
                                            reject(servico);
                                        } else {
                                            servico.operador = new Operador(res[0].ID_OPERADOR, res[0].NOME, res[0].CODBAR);
                                            console.log(servico);
                                            resolve(servico);
                                        }
                                    });
                                });
                            })
                        }
                    })
                }
                var abreOrdem = function (CodBarras) {
                    servico.erro = new Error();
                    servico.pacote = new Pacote();
                    return new Promise((resolve, reject) => {
                        if (!servico.operador.CODBAR) {
                            servico.erro = new Error('LEIA O CRACHA DE IDENTIFICAÇÃO');
                            reject(servico);
                        } else if (servico.ordem.ID_OS && servico.ordem.ID_OS != CodBarras.slice(2)) {
                            servico.erro = new Error('FECHE A OS ATUAL');
                            reject(servico);
                        } else if (servico.ordem.ID_OS && servico.ordem.ID_OS == CodBarras.slice(2) && servico.endereco.CODBAR) {
                            servico.erro = new Error('FECHE O ENDERECO ATUAL');
                            reject(servico);
                        } else if (servico.ordem.ID_OS && servico.ordem.ID_OS == CodBarras.slice(2)) {
                            Firebird.attach(options, function (err, db) {
                                if (err) {
                                    servico.erro = new Error('ERRO DE CONEXÃO')
                                    return reject(servico);
                                }
                                db.query("update os set data_status = current_date where id_os = ?", CodBarras.slice(2), function (err, res) {
                                    db.detach(function () {
                                        servico.ordem = new OrdemServico();
                                        servico.erro = new Error('OS FECHADA');
                                        resolve(servico)
                                    });
                                });
                            })
                        } else if (servico.transito.ID_TRANSITO) {
                            servico.erro = new Error('FECHE O TRANSITO PARA ABRIR UMA OS');
                            reject(servico);
                        } else if (servico.endereco.CODBAR) {
                            servico.erro = new Error('FECHE O ENDEREÇO');
                            reject(servico);
                        } else {
                            Firebird.attach(options, function (err, db) {
                                if (err) {
                                    servico.erro = new Error('ERRO DE CONEXÃO')
                                    return reject(servico);
                                }
                                db.query("SELECT ID_OS,STATUS,ID_ENDERECO FROM OS WHERE ID_OS = ?", CodBarras.slice(2), function (err, res) {
                                    if (err) reject(new Error(err));
                                    db.detach(function () {
                                        if (!res.length) {
                                            servico.erro = new Error('ORDEM DE SERVIÇO NÃO EXISTE');
                                            reject(servico);
                                        } else {
                                            servico.ordem = new OrdemServico(res[0].ID_OS, res[0].STATUS, res[0].ENDERECO);
                                            console.log(servico);
                                            resolve(servico);
                                        }
                                    });
                                });
                            })
                        }
                    })
                }
                var consultaSituacao = function (CodBarras) {
                    servico.erro = new Error();
                    servico.pacote = new Pacote();
                    return new Promise((resolve, reject) => {
                        Firebird.attach(options, function (err, db) {
                            if (err)
                                reject(new Error(err));
                            db.query("select * from pacote where codbar = ?", CodBarras, function (err, res) {
                                if (err) {
                                    servico.erro = new Error('ERRO DE CONEXÃO')
                                    return reject(servico);
                                }
                                if (!res.length) reject(new Error('Pacote Inexistente'));
                                console.log(res)
                                db.detach(function () {
                                    resolve(res);
                                });
                            });
                        })
                    })
                }
                var abreEndereco = function (CodBarras) {
                    servico.erro = new Error();
                    servico.pacote = new Pacote();
                    return new Promise((resolve, reject) => {
                        if (!servico.operador.CODBAR) {
                            servico.erro = new Error('LEIA O CRACHA DE IDENTIFICAÇÃO');
                            reject(servico);
                        } else if (servico.endereco.CODBAR && servico.endereco.CODBAR !== CodBarras) {
                            servico.erro = new Error('POR FAVOR FECHE O ENDEREÇO ATUAL');
                            reject(servico);
                        } else if (servico.endereco.CODBAR && servico.endereco.CODBAR === CodBarras) {
                            servico.endereco = new Endereco();
                            servico.erro = new Error('ENDERECO FECHADO');
                            resolve(servico);
                        } else {
                            Firebird.attach(options, function (err, db) {
                                if (err) {
                                    servico.erro = new Error('ERRO DE CONEXÃO')
                                    return reject(servico);
                                }
                                db.query("Select E.ID_ENDERECO,E.DESCRICAO,E.CODBAR,E.ID_CRITERIO,C.ID_FORNECEDOR,C.ID_EMPRESA,C.ID_ORDEM_TIPO,C.ID_OS_STATUS,E.ID_OS FROM ENDERECO E INNER JOIN CRITERIO C ON C.ID_CRITERIO = E.ID_CRITERIO WHERE CODBAR= ?", CodBarras, function (err, res) {
                                    // if (err) reject(new Error(err));
                                    if (!res.length) {
                                        db.detach(function () {
                                            servico.erro = new Error('NÃO EXISTE O ENDEREÇO DIGITADO');
                                            reject(servico);
                                        });
                                    } else if (res[0].ID_ORDEM_TIPO == 3) { //transito de saida
                                        if (servico.transito.TIPO != 3) {
                                            db.detach(function () {
                                                servico.erro = new Error('ENDEREÇO NÃO ATENDE SAÍDA');
                                                reject(servico);
                                            });
                                        } else {
                                            db.detach(function () {
                                                servico.endereco = new Endereco(res[0].ID_ENDERECO, res[0].DESCRICAO, res[0].CODBAR, res[0].ID_CRITERIO, res[0].ID_FORNECEDOR, res[0].ID_EMPRESA, res[0].ID_ORDEM_TIPO, res[0].ID_OS_STATUS, res[0].ID_OS);
                                                resolve(servico);
                                            });
                                        }
                                    } else if (res[0].ID_ORDEM_TIPO == 5) { //transito de entrada no defeito
                                        if (servico.transito.TIPO == 4) {
                                            db.detach(function () {
                                                servico.erro = new Error('ENDEREÇO NÃO ATENDE ENTRADA DE DEFEITO');
                                                reject(servico);
                                            });
                                        } else {
                                            db.detach(function () {
                                                servico.endereco = new Endereco(res[0].ID_ENDERECO, res[0].DESCRICAO, res[0].CODBAR, res[0].ID_CRITERIO, res[0].ID_FORNECEDOR, res[0].ID_EMPRESA, res[0].ID_ORDEM_TIPO, res[0].ID_OS_STATUS, res[0].ID_OS);
                                                resolve(servico);
                                            });
                                        }
                                    } else if (res[0].ID_ORDEM_TIPO == 2) { //transito de entrada
                                        if (servico.transito.ID_TRANSITO) {
                                            db.detach(function () {
                                                servico.erro = new Error('FECHE O TRANSITO');
                                                reject(servico);
                                            });
                                        } else if (servico.ordem.ID_OS) {
                                            db.detach(function () {
                                                servico.erro = new Error('FECHE A OS');
                                                reject(servico);
                                            });
                                        } else {
                                            db.detach(function () {
                                                servico.endereco = new Endereco(res[0].ID_ENDERECO, res[0].DESCRICAO, res[0].CODBAR, res[0].ID_CRITERIO, res[0].ID_FORNECEDOR, res[0].ID_EMPRESA, res[0].ID_ORDEM_TIPO, res[0].ID_OS_STATUS, res[0].ID_OS);
                                                resolve(servico);
                                            });
                                        }
                                    } else if (res[0].ID_ORDEM_TIPO == 0) { //transito de entrada
                                        if (servico.transito.ID_TRANSITO) {
                                            db.detach(function () {
                                                servico.erro = new Error('FECHE O TRANSITO');
                                                reject(servico);
                                            });
                                        } else if (servico.ordem.ID_OS) {
                                            db.detach(function () {
                                                servico.erro = new Error('FECHE A OS');
                                                reject(servico);
                                            });
                                        } else {
                                            db.detach(function () {
                                                servico.endereco = new Endereco(res[0].ID_ENDERECO, res[0].DESCRICAO, res[0].CODBAR, res[0].ID_CRITERIO, res[0].ID_FORNECEDOR, res[0].ID_EMPRESA, res[0].ID_ORDEM_TIPO, res[0].ID_OS_STATUS, res[0].ID_OS);
                                                resolve(servico);
                                            });
                                        }
                                    } else if (res[0].ID_ORDEM_TIPO == 99) { //transito de entrada
                                        if (servico.transito.ID_TRANSITO) {
                                            db.detach(function () {
                                                servico.erro = new Error('FECHE O TRANSITO');
                                                reject(servico);
                                            });
                                        } else if (!servico.ordem.ID_OS) {
                                            db.detach(function () {
                                                servico.erro = new Error('ABRA A OS');
                                                reject(servico);
                                            });
                                        } else if (res[0].ID_OS && servico.ordem.ID_OS != res[0].ID_OS) {
                                            db.detach(function () {
                                                servico.erro = new Error('ENDEREÇO DE OUTRA OS');
                                                reject(servico);
                                            });
                                        } else if (servico.ordem.ID_OS == res[0].ID_OS) {
                                            db.detach(function () {
                                                servico.endereco = new Endereco(res[0].ID_ENDERECO, res[0].DESCRICAO, res[0].CODBAR, res[0].ID_CRITERIO, res[0].ID_FORNECEDOR, res[0].ID_EMPRESA, res[0].ID_ORDEM_TIPO, res[0].ID_OS_STATUS, res[0].ID_OS);
                                                resolve(servico);
                                            });
                                        } else if (!res[0].ID_OS) {
                                            db.query("UPDATE ENDERECO SET ID_OS = ? WHERE CODBAR = ?", [servico.ordem.ID_OS, CodBarras], function (err, result) {
                                                db.detach(function () {
                                                    servico.endereco = new Endereco(res[0].ID_ENDERECO, res[0].DESCRICAO, res[0].CODBAR, res[0].ID_CRITERIO, res[0].ID_FORNECEDOR, res[0].ID_EMPRESA, res[0].ID_ORDEM_TIPO, res[0].ID_OS_STATUS, res[0].ID_OS);
                                                    resolve(servico);
                                                });
                                            })
                                        } else {
                                            servico.erro = new Error('CHAME O SUPORTE');
                                            reject(servico);
                                        }
                                    } else {
                                        servico.erro = new Error('CHAME O SUPORTE');
                                        reject(servico);
                                    }
                                });

                            })
                        }
                    })
                }
                var abreTransito = function (CodBarras) {
                    console.log(servico);
                    servico.erro = new Error();
                    servico.pacote = new Pacote();
                    return new Promise((resolve, reject) => {
                        if (!servico.operador.CODBAR) {
                            servico.erro = new Error('LEIA O CRACHA DE IDENTIFICAÇÃO');
                            return reject(servico);
                        } else if (servico.endereco.CODBAR) {
                            servico.erro = new Error('POR FAVOR FECHE O ENDEREÇO ATUAL');
                            return reject(servico);
                        } else if (servico.ordem.ID_OS) {
                            servico.erro = new Error('OS ABERTA, IMPOSSÍVEL CARREGAR PEDIDO');
                            reject(servico);
                        } else if (servico.transito.ID_TRANSITO && servico.transito.ID_TRANSITO != CodBarras) {
                            servico.erro = new Error('FECHE O DOCUMENTO ATUAL');
                            resolve(servico);
                        } else if (servico.transito.ID_TRANSITO && servico.transito.ID_TRANSITO == CodBarras) {
                            servico.transito = new Transito();
                            servico.erro = new Error('TRANSITO FECHADO');
                            resolve(servico);
                        } else {
                            Firebird.attach(options, function (err, db) {
                                if (err) {
                                    servico.erro = new Error('ERRO DE CONEXÃO')
                                    return reject(servico);
                                }
                                db.query("Select T.ID_TRANSITO,T.EXPEDICAO,T.ID_EMPRESA,T.DOCUMENTO,T.TIPO,T.STATUS,T.OS,T.TIPOFRETE,OS.STATUS as OSSTATUS FROM TRANSITO T full outer JOIN OS ON OS.ID_OS=T.OS WHERE T.ID_TRANSITO= ?", CodBarras, function (err, res) {
                                    if (err) reject(new Error(err));
                                    console.log(res)
                                    db.detach(function () {
                                        if (!res.length) {
                                            servico.erro = new Error('DOCUMENTO NÃO EXISTE');
                                            return reject(servico);
                                        } else if (([1, 2, 4, 5, 6].indexOf(res[0].TIPO) != -1) && ([0, 1].indexOf(res[0].STATUS) == -1)) { //saida em os fora da situacao 3
                                            servico.erro = new Error('DOCUMENTO DE ENTRADA NÃO LIBERADO');
                                            resolve(servico);
                                        } else if (res[0].TIPO == 3 && res[0].STATUS == 1) {
                                            servico.erro = new Error('DOCUMENTO DE SAIDA NÃO LIBERADO');
                                            resolve(servico);
                                        } else if (res[0].TIPO == 3 && (res[0].STATUS == 5 || res[0].STATUS == 2)) {
                                            servico.transito = new Transito(res[0].ID_TRANSITO, res[0].EXPEDICAO, res[0].DOCUMENTO, res[0].TIPO, res[0].STATUS, res[0].OS, res[0].TIPOFRETE, res[0].OSSTATUS);
                                            servico.setor = {
                                                DESCRICAO: 'CRIAÇÃO DE VOLUME',
                                                COR: 'blue',
                                                SENTIDO: '20 => 20'
                                            };
                                            resolve(servico);
                                        } else if (res[0].TIPO == 3 && res[0].STATUS == 7) {
                                            servico.transito = new Transito(res[0].ID_TRANSITO, res[0].EXPEDICAO, res[0].DOCUMENTO, res[0].TIPO, res[0].STATUS, res[0].OS, res[0].TIPOFRETE, res[0].OSSTATUS);
                                            servico.setor = {
                                                DESCRICAO: 'SEGUNDA ETIQUETA',
                                                COR: 'blue',
                                                SENTIDO: '20 => 20'
                                            };
                                            resolve(servico);
                                        } else {
                                            servico.transito = new Transito(res[0].ID_TRANSITO, res[0].EXPEDICAO, res[0].DOCUMENTO, res[0].TIPO, res[0].STATUS, res[0].OS, res[0].TIPOFRETE, res[0].OSSTATUS);
                                            resolve(servico);
                                        }

                                    });
                                });
                            })
                        }
                    })
                }
                var abreVolume = function (CodBarras, peso) {
                    console.log('abrevolume', CodBarras)
                    servico.erro = new Error();
                    return new Promise((resolve, reject) => {
                        if (!servico.operador.CODBAR) {
                            servico.erro = new Error('LEIA O CRACHA DE IDENTIFICAÇÃO');
                            return reject(servico);
                        } else if (!servico.transito.EXPEDICAO) {
                            servico.erro = new Error('POR FAVOR ABRA UM TRANSITO');
                            return reject(servico);
                        } else if (servico.volume.CODBAR && servico.volume.CODBAR !== CodBarras) {
                            servico.erro = new Error('POR FAVOR FECHE O VOLUME ATUAL');
                            return reject(servico);
                        } else if (servico.volume.CODBAR && servico.volume.CODBAR === CodBarras) {
                            console.log('volume igualdade')
                            Firebird.attach(options, function (err, db) {
                                if (err) {
                                    servico.erro = new Error('ERRO DE CONEXÃO')
                                    return reject(servico);
                                }
                                if (servico.volume.SITUACAO == 0) {
                                    console.log('situacao=0')
                                    db.query("update volume set SITUACAO=? WHERE CODBAR= ? returning EXPEDICAO,SITUACAO,ID_VOLUME,CODBAR,TIPO,LARGURA,ALTURA,PROFUNDIDADE,PESO", [1, CodBarras], function (err, res) {
                                        if (err) reject(new Error(err));
                                        db.detach(function () {
                                            servico.volume = new Volume(res.ID_VOLUME, res.CODBAR, res.SITUACAO, res.TIPO, res.LARGURA, res.ALTURA, res.PROFUNDIDADE, res.PESO)
                                            servico.erro = 'VOLUME ABERTO';
                                            console.log(servico)
                                            resolve(servico);
                                        });
                                    });
                                } else if (servico.volume.SITUACAO == 1) {
                                    console.log('situacao=1')
                                    db.query("update volume set SITUACAO=?,peso=? WHERE CODBAR= ? returning EXPEDICAO,SITUACAO,ID_VOLUME,CODBAR,TIPO,LARGURA,ALTURA,PROFUNDIDADE,PESO", [2, peso, CodBarras], function (err, res) {
                                        if (err) reject(new Error(err));
                                        db.detach(function () {
                                            servico.volume = new Volume();
                                            servico.erro = new Error('VOLUME FECHADO');
                                            resolve(servico);
                                        });
                                    });
                                } else {
                                    servico.erro = new Error('erro desconhecido');
                                    return reject(servico)
                                }

                            })
                        } else if (!servico.volume.CODBAR && servico.transito.EXPEDICAO) {
                            Firebird.attach(options, function (err, db) {
                                if (err) {
                                    servico.erro = new Error('ERRO DE CONEXÃO')
                                    return reject(servico);
                                }
                                db.query("select EXPEDICAO,ID_VOLUME,CODBAR,SITUACAO,TIPO,LARGURA,ALTURA,PROFUNDIDADE,PESO from volume WHERE CODBAR= ? ", [CodBarras], function (err, res) {
                                    if (err) return reject(new Error(err));
                                    db.detach(function () {
                                        console.log(res)
                                        if (!res.length) {
                                            servico.erro = new Error('VOLUME NÃO EXISTE');
                                            return reject(servico);
                                        } else if (servico.transito.EXPEDICAO != res[0].EXPEDICAO) {
                                            servico.erro = new Error('VOLUME NÃO PERTENCE A ESTA EXPEDIÇÃO');
                                            return reject(servico);
                                        } else if (servico.transito.EXPEDICAO == res[0].EXPEDICAO) {
                                            servico.volume = new Volume(res[0].ID_VOLUME, res[0].CODBAR, res[0].SITUACAO, res[0].TIPO, res[0].LARGURA, res[0].ALTURA, res[0].PROFUNDIDADE, res[0].PESO)
                                            resolve(servico);
                                        } else {
                                            servico.erro = new Error('CHAME O SUPORTE')
                                            return reject(servico);
                                        }
                                    });
                                });
                            })
                        } else {
                            servico.erro = new Error('CHAME O SUPORTE')
                        }
                    })
                }
                var criaVolume = function (medidas) {
                    servico.erro = new Error();
                    return new Promise((resolve, reject) => {
                        Firebird.attach(options, function (err, db) {
                            if (err) {
                                servico.erro = new Error('ERRO DE CONEXÃO')
                                return reject(servico);
                            }
                            db.query("insert into VOLUME (expedicao,profundidade,largura,altura) values (?,?,?,?) returning EXPEDICAO,ID_VOLUME,CODBAR,SITUACAO,TIPO,LARGURA,ALTURA,PROFUNDIDADE,PESO", [servico.transito.EXPEDICAO, medidas.comprimento, medidas.largura, medidas.altura], function (err, res) {
                                if (err) reject(new Error(err));
                                db.detach(function () {
                                    console.log('volume criado', res)
                                    servico.volume = new Volume(res.ID_VOLUME, res.CODBAR, res.SITUACAO, res.TIPO, res.LARGURA, res.ALTURA, res.PROFUNDIDADE, res.PESO)
                                    resolve(servico.volume);
                                })
                            });
                        })
                    })
                }
                var excluiVolume = function (CodBarras) {
                    servico.erro = new Error();
                    return new Promise((resolve, reject) => {
                        Firebird.attach(options, function (err, db) {
                            if (err) {
                                servico.erro = new Error('ERRO DE CONEXÃO')
                                return reject(servico);
                            }
                            db.query("delete from VOLUME where CODBAR = ?", [CodBarras], function (err, res) {
                                if (err) reject(new Error(err));
                                db.detach(function () {
                                    servico.volume = new Volume();
                                    servico.erro = new Error('VOLUME EXCLUÍDO')
                                    resolve(servico.volume);
                                })
                            });
                        })
                    })
                }
                var movePacote = function (CodBarras) {
                    servico.erro = new Error();
                    servico.pacote = new Pacote();
                    return new Promise((resolve, reject) => {
                        if (!servico.operador.CODBAR) {
                            servico.erro = new Error('LEIA O CRACHA DE IDENTIFICAÇÃO');
                            reject(servico);
                        } else {
                            Firebird.attach(options, function (err, db) {
                                if (err) {
                                    servico.erro = new Error('ERRO DE CONEXÃO')
                                    return reject(servico);
                                }
                                db.query("SELECT * FROM PACOTE WHERE CODBAR = ?", CodBarras, function (err, res) {
                                    // if (err) reject(new Error(err));
                                    console.log(res)
                                    if (!res.length) {
                                        servico.erro = new Error('PACOTE NÃO EXISTE');
                                        reject(servico);
                                    } else if (res[0].SITUACAO == 5) { //PACOTE DE ENTRADA NÃO VERIFICADO
                                        if (servico.endereco.CODBAR !== 'EXXXXXXXXXXXX') {
                                            db.detach(function () {
                                                servico.erro = new Error('PACOTE NÃO VERIFICADO');
                                                reject(servico);
                                            });
                                        } else {
                                            db.query("UPDATE PACOTE SET SITUACAO=?,ID_ENDERECO=?,OPERADOR=? WHERE CODBAR= ?  returning ID_PACOTE,CODBAR,ID_PRODUTO,QTD,UNIDADE,SITUACAO,DESCRICAO,CODINTERNO,OS", [0, servico.endereco.CODBAR, servico.operador.CODIGO, CodBarras], function (err, res) {
                                                db.detach(function () {
                                                    servico.pacote = new Pacote(res.ID_PACOTE, res.CODBAR, res.ID_PRODUTO, res.QTD, res.UNIDADE, res.SITUACAO, res.DESCRICAO, res.CODINTERNO, res.OS);
                                                    resolve(servico);
                                                });
                                            })
                                        }
                                    } else if (res[0].SITUACAO == 8) { //PACOTE DE ENTRADA NÃO VERIFICADO
                                        if (servico.ordem.ID_OS) {
                                            db.detach(function () {
                                                servico.erro = new Error('Feche a OS para guardar o Pacote de entrada');
                                                reject(servico);
                                            });
                                        } else if (!servico.endereco.CODBAR) {
                                            db.detach(function () {
                                                servico.erro = new Error('Por favor insira o endereço para entrar este pacote!');
                                                reject(servico);
                                            });
                                        } else if (servico.endereco.ID_ORDEM_TIPO != 2) {
                                            db.detach(function () {
                                                servico.erro = new Error('Endereço não atende entrada de Mercadoria');
                                                reject(servico);
                                            });
                                        } else if (servico.endereco.CODBAR === 'E0101ZZ010A01') {
                                            db.detach(function () {
                                                db.query("UPDATE PACOTE SET SITUACAO=?,ID_ENDERECO=?,OPERADOR=? WHERE CODBAR= ? returning ID_PACOTE,CODBAR,ID_PRODUTO,QTD,UNIDADE,SITUACAO,DESCRICAO,CODINTERNO,OS", [9, servico.endereco.CODBAR, servico.operador.CODIGO, CodBarras], function (err, res) {
                                                    db.detach(function () {
                                                        servico.pacote = new Pacote(res.ID_PACOTE, res.CODBAR, res.ID_PRODUTO, res.QTD, res.UNIDADE, res.SITUACAO, res.DESCRICAO, res.CODINTERNO, res.OS);
                                                        resolve(servico);
                                                    });
                                                })
                                            });
                                        } else if (servico.endereco.ID_ORDEM_TIPO == 2) {
                                            db.query("UPDATE PACOTE SET SITUACAO=?,ID_ENDERECO=?,OPERADOR=? WHERE CODBAR= ? returning ID_PACOTE,CODBAR,ID_PRODUTO,QTD,UNIDADE,SITUACAO,DESCRICAO,CODINTERNO,OS", [1, servico.endereco.CODBAR, servico.operador.CODIGO, CodBarras], function (err, res) {
                                                db.detach(function () {
                                                    servico.pacote = new Pacote(res.ID_PACOTE, res.CODBAR, res.ID_PRODUTO, res.QTD, res.UNIDADE, res.SITUACAO, res.DESCRICAO, res.CODINTERNO, res.OS);
                                                    resolve(servico);
                                                });
                                            })
                                        } else {
                                            db.detach(function () {
                                                servico.erro = new Error('Erro deconhecido, chame suporte');
                                                resolve(servico);
                                            })
                                        }
                                    } else if (res[0].SITUACAO == 11) { //PACOTE DE ENTRADA DEFEITO
                                        if (servico.ordem.ID_OS) {
                                            db.detach(function () {
                                                servico.erro = new Error('Feche a OS para guardar o Pacote de entrada');
                                                reject(servico);
                                            });
                                        } else if (!servico.endereco.CODBAR) {
                                            db.detach(function () {
                                                servico.erro = new Error('Por favor insira o endereço para entrar este pacote!');
                                                reject(servico);
                                            });
                                        } else if (servico.endereco.ID_ORDEM_TIPO != 5) {
                                            db.detach(function () {
                                                servico.erro = new Error('Endereço não atende entrada de Mercadoria');
                                                reject(servico);
                                            });
                                        } else if (servico.endereco.ID_ORDEM_TIPO == 5) {
                                            db.query("UPDATE PACOTE SET SITUACAO=?,ID_ENDERECO=?,OPERADOR=? WHERE CODBAR= ? returning ID_PACOTE,CODBAR,ID_PRODUTO,QTD,UNIDADE,SITUACAO,DESCRICAO,CODINTERNO,OS", [4, servico.endereco.CODBAR, servico.operador.CODIGO, CodBarras], function (err, res) {
                                                db.detach(function () {
                                                    servico.pacote = new Pacote(res.ID_PACOTE, res.CODBAR, res.ID_PRODUTO, res.QTD, res.UNIDADE, res.SITUACAO, res.DESCRICAO, res.CODINTERNO, res.OS);
                                                    resolve(servico);
                                                });
                                            })
                                        } else {
                                            db.detach(function () {
                                                servico.erro = new Error('Erro deconhecido, chame suporte');
                                                resolve(servico);
                                            })
                                        }
                                    } else if (res[0].SITUACAO == 12) { //MATERIAL DE ESTOQUE (SAÍDA COM OS E ENDEREÇO)
                                        if (!servico.ordem.ID_OS) {
                                            db.detach(function () {
                                                servico.erro = new Error('ABRA A ORDEM DE SERVIÇO');
                                                reject(servico);
                                            });
                                        } else if (!servico.endereco.CODBAR) {
                                            db.detach(function () {
                                                servico.erro = new Error('ABRA O ENDEREÇO DA OS');
                                                reject(servico);
                                            });
                                        } else if (servico.ordem.ID_OS != res[0].OS) {
                                            db.detach(function () {
                                                servico.erro = new Error('PACOTE NÃO PERTENCE A ESTA OS');
                                                reject(servico);
                                            });
                                        } else if (servico.endereco.ID_OS == res[0].OS) {
                                            db.query("SELECT IDPCT,IDPROD,CODBARSAIDA,CODINT,QTDPCT,UN,DESCRICAO,POSICAO FROM QUEBRA_PACOTE(?)", [CodBarras], function (err, res) {
                                                db.detach(function () {
                                                    servico.pacote = new Pacote(res.ID_PACOTE, res.CODBAR, res.ID_PRODUTO, res.QTD, res.UNIDADE, res.SITUACAO, res.DESCRICAO, res.CODINTERNO, res.OS);
                                                    resolve(servico);
                                                });
                                            })
                                        } else {
                                            db.detach(function () {
                                                servico.erro = new Error('Erro deconhecido, chame suporte');
                                                resolve(servico);
                                            })
                                        }
                                    } else if (res[0].SITUACAO == 7) { //PACOTE "QUEBRADO"
                                        if (!servico.ordem.ID_OS) {
                                            db.detach(function () {
                                                servico.erro = new Error('ABRA A ORDEM DE SERVIÇO');
                                                reject(servico);
                                            });
                                        } else if (!servico.endereco.CODBAR) {
                                            db.detach(function () {
                                                servico.erro = new Error('ABRA O ENDEREÇO DA OS');
                                                reject(servico);
                                            });
                                        } else if (servico.ordem.ID_OS != res[0].OS) {
                                            db.detach(function () {
                                                servico.erro = new Error('PACOTE NÃO PERTENCE A ESTA OS');
                                                reject(servico);
                                            });
                                        } else if (servico.endereco.ID_OS == res[0].OS) {
                                            db.query("UPDATE PACOTE SET SITUACAO=?,ID_ENDERECO=?,OPERADOR=? WHERE CODBAR= ? returning ID_PACOTE,CODBAR,ID_PRODUTO,QTD,UNIDADE,SITUACAO,DESCRICAO,CODINTERNO,OS", [13, servico.endereco.CODBAR, servico.operador.CODIGO, CodBarras], function (err, res) {
                                                db.detach(function () {
                                                    servico.pacote = new Pacote(res.ID_PACOTE, res.CODBAR, res.ID_PRODUTO, res.QTD, res.UNIDADE, res.SITUACAO, res.DESCRICAO, res.CODINTERNO, res.OS);
                                                    resolve(servico);
                                                });
                                            })
                                        } else {
                                            db.detach(function () {
                                                servico.erro = new Error('Erro deconhecido, chame suporte');
                                                resolve(servico);
                                            })
                                        }
                                    } else if (res[0].SITUACAO == 13) { //VERIFICADO PARA ENTRAR NA EXPEDIÇÃO
                                        if (servico.ordem.ID_OS) {
                                            db.detach(function () {
                                                servico.erro = new Error('FECHE A ORDEM DE SERVIÇO');
                                                reject(servico);
                                            });
                                        } else if (!servico.transito.ID_TRANSITO) {
                                            db.detach(function () {
                                                servico.erro = new Error('ABRA O TRANSITO');
                                                reject(servico);
                                            });
                                        } else if (!servico.endereco.CODBAR) {
                                            db.detach(function () {
                                                servico.erro = new Error('ABRA O ENDEREÇO DE SAÍDA');
                                                reject(servico);
                                            });
                                        } else if (servico.transito.OS != res[0].OS) {
                                            db.detach(function () {
                                                servico.erro = new Error('PACOTE NÃO PERTENCE A ESTA OS');
                                                reject(servico);
                                            });
                                        } else if (servico.transito.OS == res[0].OS) {
                                            db.query("UPDATE PACOTE SET SITUACAO=?,ID_ENDERECO=?,OPERADOR=? WHERE CODBAR= ? returning ID_PACOTE,CODBAR,ID_PRODUTO,QTD,UNIDADE,SITUACAO,DESCRICAO,CODINTERNO,OS", [3, servico.endereco.CODBAR, servico.operador.CODIGO, CodBarras], function (err, res) {
                                                db.detach(function () {
                                                    servico.pacote = new Pacote(res.ID_PACOTE, res.CODBAR, res.ID_PRODUTO, res.QTD, res.UNIDADE, res.SITUACAO, res.DESCRICAO, res.CODINTERNO, res.OS);
                                                    resolve(servico);
                                                });
                                            })
                                        } else {
                                            db.detach(function () {
                                                servico.erro = new Error('Erro deconhecido, chame suporte');
                                                resolve(servico);
                                            })
                                        }
                                    } else if (res[0].SITUACAO == 2) { //SETOR FGV PARA ENTRAR NO ESTOQUE
                                        if (servico.ordem.ID_OS) {
                                            db.detach(function () {
                                                servico.erro = new Error('FECHE A ORDEM DE SERVIÇO');
                                                reject(servico);
                                            });
                                        } else if (servico.transito.ID_TRANSITO) {
                                            db.detach(function () {
                                                servico.erro = new Error('FECHE O TRANSITO');
                                                reject(servico);
                                            });
                                        } else if (!servico.endereco.CODBAR) {
                                            db.detach(function () {
                                                servico.erro = new Error('ABRA O ENDEREÇO DE SAÍDA');
                                                reject(servico);
                                            });
                                        } else if (servico.endereco.ID_ORDEM_TIPO != 2) {
                                            db.detach(function () {
                                                servico.erro = new Error('ABRA UM ENDEREÇO DE ENTRADA');
                                                reject(servico);
                                            });
                                        } else if (servico.endereco.ID_ORDEM_TIPO == 2) {
                                            db.query("UPDATE PACOTE SET SITUACAO=?,ID_ENDERECO=?,OPERADOR=? WHERE CODBAR= ? returning ID_PACOTE,CODBAR,ID_PRODUTO,QTD,UNIDADE,SITUACAO,DESCRICAO,CODINTERNO,OS", [1, servico.endereco.CODBAR, servico.operador.CODIGO, CodBarras], function (err, res) {
                                                db.detach(function () {
                                                    servico.pacote = new Pacote(res.ID_PACOTE, res.CODBAR, res.ID_PRODUTO, res.QTD, res.UNIDADE, res.SITUACAO, res.DESCRICAO, res.CODINTERNO, res.OS);
                                                    resolve(servico);
                                                });
                                            })
                                        } else {
                                            db.detach(function () {
                                                servico.erro = new Error('Erro deconhecido, chame suporte');
                                                resolve(servico);
                                            })
                                        }
                                    } else if (res[0].SITUACAO == 1) { //MATERIAL DE ESTOQUE (SAÍDA COM OS E ENDEREÇO)
                                        if (!servico.ordem.ID_OS) {
                                            db.detach(function () {
                                                servico.erro = new Error('ABRA A ORDEM DE SERVIÇO');
                                                reject(servico);
                                            });
                                        } else if (servico.transito.ID_TRANSITO) {
                                            db.detach(function () {
                                                servico.erro = new Error('FECHE O TRANSITO');
                                                reject(servico);
                                            });
                                        } else if (servico.endereco.ID_ORDEM_TIPO != 99) {
                                            db.detach(function () {
                                                servico.erro = new Error('ABRA O ENDEREÇO DE SAÍDA');
                                                reject(servico);
                                            });
                                        } else if (servico.ordem.STATUS != 1) {
                                            db.detach(function () {
                                                servico.erro = new Error('ORDEM JA SEPARADA');
                                                reject(servico);
                                            });
                                        } else if (servico.endereco.ID_ORDEM_TIPO == 99 && servico.ordem.STATUS == 1) {
                                            db.query("UPDATE PACOTE SET SITUACAO=?,ID_ENDERECO=?,OPERADOR=?,OS=? WHERE CODBAR= ? returning ID_PACOTE,CODBAR,ID_PRODUTO,QTD,UNIDADE,SITUACAO,DESCRICAO,CODINTERNO,OS", [2, servico.endereco.CODBAR, servico.operador.CODIGO, servico.ordem.ID_OS, CodBarras], function (err, res) {
                                                db.detach(function () {
                                                    servico.pacote = new Pacote(res.ID_PACOTE, res.CODBAR, res.ID_PRODUTO, res.QTD, res.UNIDADE, res.SITUACAO, res.DESCRICAO, res.CODINTERNO, res.OS);
                                                    resolve(servico);
                                                });
                                            })
                                        } else {
                                            db.detach(function () {
                                                servico.erro = new Error('Erro deconhecido, chame suporte');
                                                resolve(servico);
                                            })
                                        }
                                    } else if (res[0].SITUACAO == 20) { //MATERIAL DE ESTOQUE (SAÍDA COM OS E ENDEREÇO)
                                        if (!servico.transito.EXPEDICAO) {
                                            db.detach(function () {
                                                servico.erro = new Error('ABRA UM TRANSITO');
                                                reject(servico);
                                            });
                                        } else if (!servico.volume.CODBAR) {
                                            db.detach(function () {
                                                servico.erro = new Error('ABRA UM VOLUME');
                                                reject(servico);
                                            });
                                        } else if (servico.volume.CODBAR && servico.transito.EXPEDICAO) {
                                            db.query("UPDATE PACOTE SET SITUACAO=?,OPERADOR=?,ID_VOLUME=? WHERE CODBAR= ? returning ID_PACOTE,CODBAR,ID_PRODUTO,QTD,UNIDADE,SITUACAO,DESCRICAO,CODINTERNO,OS", [20, servico.operador.CODIGO, servico.volume.ID_VOLUME, CodBarras], function (err, res) {
                                                db.detach(function () {
                                                    servico.pacote = new Pacote(res.ID_PACOTE, res.CODBAR, res.ID_PRODUTO, res.QTD, res.UNIDADE, res.SITUACAO, res.DESCRICAO, res.CODINTERNO, res.OS);
                                                    resolve(servico);
                                                });
                                            })
                                        } else {
                                            db.detach(function () {
                                                servico.erro = new Error('ERRO DESCONHECIDO PACOTE 20');
                                                reject(servico);
                                            });
                                        }
                                    } else if (res[0].SITUACAO == 21) { //MATERIAL DE ESTOQUE (SAÍDA COM OS E ENDEREÇO)
                                        db.detach(function () {
                                            servico.erro = new Error('PACOTE DENTRO DE VOLUME');
                                            reject(servico);
                                        });

                                    } else if (res[0].SITUACAO == 22) { //MATERIAL DE ESTOQUE (SAÍDA COM OS E ENDEREÇO)
                                        db.detach(function () {
                                            servico.erro = new Error('PACOTE DENTRO DE VOLUME');
                                            reject(servico);
                                        });
                                    } else {
                                        db.detach(function () {
                                            servico.erro = new Error('Erro deconhecido, chame suporte');
                                            resolve(servico);
                                        })
                                    }
                                });
                            })
                        }
                    })
                }
                return {
                    consultaSituacao: consultaSituacao,
                    abreEndereco: abreEndereco,
                    abreOperador: abreOperador,
                    abreOrdem: abreOrdem,
                    abreTransito: abreTransito,
                    movePacote: movePacote,
                    criaVolume: criaVolume,
                    abreVolume: abreVolume,
                    excluiVolume: excluiVolume
                }
            }]);
})();