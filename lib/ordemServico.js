class OrdemServico {
    constructor(_id_os, _status, _endereco) {
        this.ID_OS = _id_os || '';
        this.STATUS = _status || '';
        this.ENDERECO = _endereco || '';
    }
}
module.exports = {
    OrdemServico: OrdemServico
};