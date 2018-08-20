const Firebird = require('node-firebird');
const options = require("./db.js");
const Pacote = require("./lib/pacote.js").Pacote;
const Operador = require("./lib/operador.js").Operador;
(function () {
    'use strict';
    angular.module('leitorEstoque')
        .factory(
            'pacoteSrvc', ['$http', function ($http) {
                var abreOperador = function (CodBarras) {
                    var operador = new Operador();
                    console.log (operador)
                    return new Promise((resolve, reject) => {
                        //testa se o operador é o mesmo lido
                        if (operador.CODBAR && operador.CODBAR !== CodBarras) {
                            reject(new Error('FECHE O OPERADOR ATUAL'));
                        }
                        //fecha o operador atual
                        if (operador.CODBAR && operador.CODBAR === CodBarras) {
                            reject(new Error('OPERADOR FECHADO'));
                        }
                        Firebird.attach(options, function (err, db) {
                            if (err)
                                reject(new Error(err));
                            db.query("Select id_operador,nome,codbar from operador where codbar = ?", CodBarras, function (err, res) {
                                if (err) reject(new Error(err));
                                if (!res.length) reject(new Error('USUÁRIO NÃO EXISTE'));
                                console.log(res)
                                db.detach(function () {
                                    resolve(new Operador(res[0].NOME, res[0].CODBAR));
                                });
                            });
                        })
                    })
                }
                var consultaSituacao = function (CodBarras) {
                    return new Promise((resolve, reject) => {
                        Firebird.attach(options, function (err, db) {
                            if (err)
                                reject(new Error(err));
                            db.query("select * from pacote where codbar = ?", CodBarras, function (err, res) {
                                if (err) reject(new Error(err));
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
                    return new Promise((resolve, reject) => {
                        Firebird.attach(options, function (err, db) {
                            if (err)
                                reject(new Error(err));
                            db.query("select * from endereco where codbar = ?", CodBarras, function (err, res) {
                                if (err) reject(new Error(err));
                                if (!res.length) reject(new Error('Pacote Inexistente'));
                                console.log(res)
                                db.detach(function () {
                                    resolve(res);
                                });
                            });
                        })

                    })
                }

                return {
                    consultaSituacao: consultaSituacao,
                    abreEndereco: abreEndereco,
                    abreOperador: abreOperador
                }
            }]);
})();