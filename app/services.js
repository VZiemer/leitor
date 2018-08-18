const Firebird = require('node-firebird');
const options = require("./db.js");
(function () {
    'use strict';
    angular.module('leitorEstoque')
        .factory(
            'pacoteSrvc', ['$http', function ($http) {
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
                    abreEndereco : abreEndereco
                }
            }]);
})();