class Pacote {
    constructor(_id_pacote,_codbar, _id_produto, _qtd, _unidade, _situacao, _descricao, _codinterno, _os) {
        this.ID_PACOTE = _id_pacote || '';
        this.CODBAR = _codbar;
        this.ID_PRODUTO = _id_produto || '';
        this.QTD = _qtd || '';
        this.UNIDADE = _unidade || '';
        this.SITUACAO = _situacao || '';
        this.DESCRICAO = _descricao || '';
        this.OS = _os || '';
    }
}
module.exports = {
    Pacote: Pacote
};