// !ping - Mostra o ping real do bot
module.exports = {
    nome: "ping",
    executar: async (sock, msg, args, remetenteId, remoteJid) => {
        try {
            // ============================================================
            // ⏱️ MEDE O TEMPO DE RESPOSTA
            // ============================================================
            const inicio = Date.now();

            // Envia mensagem inicial
            const enviada = await sock.sendMessage(remoteJid, {
                text: "🏓 Calculando ping..."
            });

            const fim = Date.now();
            const latencia = fim - inicio;

            // ============================================================
            // 📊 PEGA INFO DO SISTEMA
            // ============================================================
            const os = require('os');
            const uptime = process.uptime();
            const memoriaUsada = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
            const memoriaTotal = (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2);

            // Formata uptime
            const dias = Math.floor(uptime / 86400);
            const horas = Math.floor((uptime % 86400) / 3600);
            const minutos = Math.floor((uptime % 3600) / 60);
            const segundos = Math.floor(uptime % 60);

            let uptimeTexto = "";
            if (dias > 0) uptimeTexto += `${dias}d `;
            if (horas > 0) uptimeTexto += `${horas}h `;
            if (minutos > 0) uptimeTexto += `${minutos}m `;
            uptimeTexto += `${segundos}s`;

            // ============================================================
            // 🎨 EMOJI DO PING
            // ============================================================
            let emojiPing = "🟢";
            let qualidade = "Excelente";
            if (latencia > 500) { emojiPing = "🟡"; qualidade = "Médio"; }
            if (latencia > 1000) { emojiPing = "🟠"; qualidade = "Ruim"; }
            if (latencia > 2000) { emojiPing = "🔴"; qualidade = "Péssimo"; }

            // ============================================================
            // 🚀 EDITA A MENSAGEM COM OS DADOS
            // ============================================================
            await sock.sendMessage(remoteJid, {
                text: `🏓 *PONG!*\n\n` +
                      `${emojiPing} Ping: *${latencia}ms* (${qualidade})\n` +
                      `⏱️ Uptime: *${uptimeTexto}*\n` +
                      `💾 RAM: *${memoriaUsada} MB* / ${memoriaTotal} MB\n` +
                      `🖥️ Plataforma: *${os.platform()}*\n` +
                      `⚙️ Node: *${process.version}*\n` +
                      `🤖 Bot: *RPGBot v1.3*`,
                edit: enviada.key
            });

        } catch (err) {
            console.error("❌ Erro no comando ping:", err);
            await sock.sendMessage(remoteJid, {
                text: `❌ Erro ao calcular ping: ${err.message}`
            });
        }
    }
};
