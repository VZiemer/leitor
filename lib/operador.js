class Operador {
    constructor(_id_operador,_nome, _codbar) {
        this.ID_OPERADOR = _id_operador || '';
        this.NOME = _nome || '';
        this.CODBAR = _codbar || '';
    }
}
module.exports = {
    Operador: Operador
};