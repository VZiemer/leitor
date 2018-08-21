class Endereco {
    constructor(_id_endereco, _descricao, _codbar, _id_criterio, _id_fornecedor, _id_empresa, _id_ordem_tipo, _id_os_status, _id_os) {
        this.ID_ENDERECO = _id_endereco || '';
        this.DESCRICAO = _descricao || '';
        this.CODBAR = _codbar || '';
        this.ID_CRITERIO = _id_criterio || '';
        this.ID_FORNECEDOR = _id_fornecedor || '';
        this.ID_EMPRESA = _id_empresa || '';
        this.ID_ORDEM_TIPO = _id_ordem_tipo || '';
        this.ID_OS_STATUS = _id_os_status || '';
        this.ID_OS = _id_os || '';
    }
}
module.exports = {
    Endereco: Endereco
};