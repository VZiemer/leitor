class Transito {
    constructor(_id_transito, _expedicao, _documento, _tipo, _status, _os, _tipofrete,_osstatus,_transportador) {
        this.ID_TRANSITO = _id_transito || '';
        this.EXPEDICAO = _expedicao || '';
        this.DOCUMENTO = _documento || '';
        this.TIPO = _tipo || '';
        this.STATUS = _status || '';
        this.OS = _os || '';
        this.TIPOFRETE = _tipofrete || '';
        this.TRANSPOSTADOR = _transportador;
        this.OSSTATUS = _osstatus || '';
        
    }
}
module.exports = {
    Transito: Transito
};