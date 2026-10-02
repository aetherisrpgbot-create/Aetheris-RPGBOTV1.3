// comandos/rpg/coletar_ovos.js - REDIRECIONA PARA !coletarovos
module.exports = {
    nome: "coletar_ovos",
    alias: ["coletar ovos"],
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        // Importa o comando original
        const coletarOvos = require('./coletarovos');
        
        // Executa o comando original
        await coletarOvos.executar(sock, msg, args, remetenteId, remoteJid);
    }
};
