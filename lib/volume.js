class Volume {
    constructor(_id_volume,_codbar, _situacao, _tipo, _largura, _altura, _profundidade, _peso, _posicao, _total) {
        this.ID_VOLUME = _id_volume || '';
        this.CODBAR = _codbar;
        this.SITUACAO = _situacao || '';
        this.TIPO = _tipo || '';
        this.LARGURA = _largura || '';
        this.ALTURA = _altura || '';
        this.PROFUNDIDADE = _profundidade || '';
        this.PESO = _peso || '';
        this.POSICAO = _posicao || '';
        this.TOTAL = _total || '';
    }
}
module.exports = {
    Volume: Volume  
};