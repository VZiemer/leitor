class Pacote {
    constructor(_id_pacote,_codbar, _id_produto,_cod_fiscal, _qtd, _unidade, _situacao, _descricao, _codinterno, _os,_imagem,_mult_qtd) {
        this.ID_PACOTE = _id_pacote || '';
        this.CODIGO_FISCAL = _cod_fiscal;
        this.CODBAR = _codbar;
        this.ID_PRODUTO = _id_produto || '';
        this.QTD = _qtd || '';
        this.UNIDADE = _unidade || '';
        this.SITUACAO = _situacao || '';
        this.DESCRICAO = _descricao || '';
        this.OS = _os || '';
        this.IMAGEM = _imagem || '';
        this.MULT_QTD = _mult_qtd;
    }
}
module.exports = {
    Pacote: Pacote
};