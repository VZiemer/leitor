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
    //criação das variáveis
    var servico = {
        operador: new Operador(),
        ordem: new OrdemServico(),
        transito: new Transito(),
        endereco: new Endereco(),
        pacote: new Pacote(),
        erro: new Error()
    }
    angular.module('leitorEstoque')
        .factory(
            'pacoteSrvc', ['$http', function ($http) {
                var abreOperador = function (CodBarras) {
                    servico.erro = new Error();
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
                                            servico.operador = new Operador(res[0].NOME, res[0].CODBAR);
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
                    return new Promise((resolve, reject) => {
                        if (!servico.operador.CODBAR) {
                            servico.erro = new Error('LEIA O CRACHA DE IDENTIFICAÇÃO');
                            reject(servico);
                        } else if (servico.ordem.ID_OS && servico.ordem.ID_OS != CodBarras.slice(2)) {
                            servico.erro = new Error('FECHE A OS ATUAL');
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
                                            reject(new Error('ORDEM DE SERVIÇO NÃO EXISTE'));
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
                                    db.detach(function () {
                                        if (!res.length) {
                                            servico.erro = new Error('NÃO EXISTE O ENDEREÇO DIGITADO');
                                            reject(servico);
                                        } else if (servico.transito.TIPO == 3) { //transito de entrada
                                            if (res[0].ID_ORDEM_TIPO != 3) {
                                                servico.erro = new Error('NÃO EXISTE O ENDEREÇO DIGITADO');
                                                reject(servico);
                                            }
                                        } else {
                                            servico.endereco = new Endereco(res[0].ID_ENDERECO, res[0].DESCRICAO, res[0].CODBAR, res[0].ID_CRITERIO, res[0].ID_FORNECEDOR, res[0].ID_EMPRESA, res[0].ID_ORDEM_TIPO, res[0].ID_OS_STATUS, res[0].ID_OS);
                                            resolve(servico);
                                        }

                                    });
                                });
                            })
                        }
                    })
                }
                var abreTransito = function (CodBarras) {
                    servico.erro = new Error();
                    return new Promise((resolve, reject) => {
                        if (!servico.operador.CODBAR) {
                            servico.erro = new Error('LEIA O CRACHA DE IDENTIFICAÇÃO');
                            reject(servico);
                        } else if (servico.endereco.CODBAR) {
                            servico.erro = new Error('POR FAVOR FECHE O ENDEREÇO ATUAL');
                            reject(servico);
                        } else if (servico.ordem.ID_OS) {
                            servico.erro = new Error('OS ABERTA, IMPOSSÍVEL CARREGAR PEDIDO');
                            reject(servico);
                        } else if (servico.transito.DOCUMENTO && servico.transito.DOCUMENTO != CodBarras) {
                            servico.erro = new Error('FECHE O DOCUMENTO ATUAL');
                            resolve(servico);
                        } else if (servico.transito.DOCUMENTO && servico.transito.DOCUMENTO == CodBarras) {
                            servico.transito = new Transito();
                            servico.erro = new Error('DOCUMENTO FECHADO');
                            resolve(servico);
                        } else {
                            Firebird.attach(options, function (err, db) {
                                if (err) {
                                    servico.erro = new Error('ERRO DE CONEXÃO')
                                    return reject(servico);
                                }
                                db.query("Select T.ID_TRANSITO,T.EXPEDICAO,T.ID_EMPRESA,T.DOCUMENTO,T.TIPO,T.STATUS,T.TIPOFRETE,OS.STATUS as OSSTATUS FROM TRANSITO T full outer JOIN OS ON OS.ID_OS=T.OS WHERE T.DOCUMENTO= ?", CodBarras, function (err, res) {
                                    // if (err) reject(new Error(err));
                                    console.log(res)
                                    db.detach(function () {
                                        if (!res.length) {
                                            servico.erro = new Error('DOCUMENTO NÃO EXISTE');
                                            reject(servico);
                                        } else if (([1, 2, 4, 5, 6].indexOf(res[0].TIPO) != -1) && ([0, 1].indexOf(res[0].STATUS) == -1)) { //saida em os fora da situacao 3
                                            servico.erro = new Error('DOCUMENTO DE ENTRADA NÃO LIBERADO');
                                            resolve(servico);
                                        } else if (res[0].TIPO == 3 && res[0].OSSTATUS != 3) {
                                            servico.erro = new Error('DOCUMENTO DE SAIDA NÃO LIBERADO');
                                            resolve(servico);
                                        } else {
                                            servico.transito = new Transito(res[0].ID_TRANSITO, res[0].EXPEDICAO, res[0].DOCUMENTO, res[0].TIPO, res[0].STATUS, res[0].TIPOFRETE, res[0].OSSTATUS);
                                            resolve(servico);
                                        }

                                    });
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
                    abreTransito: abreTransito
                }
            }]);
})();