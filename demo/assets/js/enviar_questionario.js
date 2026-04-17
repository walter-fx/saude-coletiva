(function initQuestionarioTelegramSender() {
    const TELEGRAM_CONFIG = {
        botToken: "8063258820:AAGYhXqSGbjuaoxtwz5FsrBAfhhchRfmeGY",
        chatId: "7747636285",
    };

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function isConfigured() {
        return Boolean(TELEGRAM_CONFIG.botToken && TELEGRAM_CONFIG.chatId);
    }

    function buildMessage(payload) {
        const safe = {
            aluno: escapeHtml(payload.aluno),
            turma: escapeHtml(payload.turma),
            disciplina: escapeHtml(payload.disciplina),
            desempenho: escapeHtml(payload.desempenho),
            dataHora: escapeHtml(payload.dataHora),
            questaoAtual: escapeHtml(payload.questaoAtual),
        };

        return [
            "📘 <b>Resultado de Questionário</b>",
            "",
            `👤 <b>Aluno:</b> ${safe.aluno}`,
            `🏫 <b>Turma:</b> ${safe.turma}`,
            `🩺 <b>Disciplina:</b> ${safe.disciplina}`,
            `⭐ <b>Desempenho:</b> ${safe.desempenho} (${payload.estrelas} estrelas)`,
            `🎯 <b>Aproveitamento:</b> ${payload.aproveitamento}%`,
            `✅ <b>Acertos:</b> ${payload.acertos}`,
            `❌ <b>Erros:</b> ${payload.erros}`,
            `🧩 <b>Total de questões:</b> ${payload.totalQuestoes}`,
            `📍 <b>Status:</b> ${safe.questaoAtual}`,
            `🕒 <b>Enviado em:</b> ${safe.dataHora}`,
        ].join("\n");
    }

    function buildEventMessage(payload) {
        const safe = {
            aluno: escapeHtml(payload.aluno),
            turma: escapeHtml(payload.turma),
            disciplina: escapeHtml(payload.disciplina),
            dataHora: escapeHtml(payload.dataHora),
            nomeAnterior: escapeHtml(payload.nomeAnterior),
        };

        if (payload.tipo === "entrada") {
            return [
                "🚪 <b>Participante entrou no questionário</b>",
                "",
                `👤 <b>Nome:</b> ${safe.aluno}`,
                `🏫 <b>Turma:</b> ${safe.turma}`,
                `🩺 <b>Disciplina:</b> ${safe.disciplina}`,
                `🕒 <b>Horário:</b> ${safe.dataHora}`,
            ].join("\n");
        }

        if (payload.tipo === "alteracao_nome") {
            return [
                "✏️ <b>Participante alterou o nome</b>",
                "",
                `👤 <b>Nome anterior:</b> ${safe.nomeAnterior}`,
                `👤 <b>Novo nome:</b> ${safe.aluno}`,
                `🏫 <b>Turma:</b> ${safe.turma}`,
                `🩺 <b>Disciplina:</b> ${safe.disciplina}`,
                `🕒 <b>Horário:</b> ${safe.dataHora}`,
            ].join("\n");
        }

        return [
            "🔔 <b>Evento do questionário</b>",
            "",
            `👤 <b>Participante:</b> ${safe.aluno}`,
            `🏫 <b>Turma:</b> ${safe.turma}`,
            `🩺 <b>Disciplina:</b> ${safe.disciplina}`,
            `🕒 <b>Horário:</b> ${safe.dataHora}`,
        ].join("\n");
    }

    async function sendTelegramMessage(text) {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.chatId,
                text,
                parse_mode: "HTML",
                disable_web_page_preview: true,
            }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) {
            return {
                ok: false,
                code: "telegram_error",
                message: data.description || "O Telegram não aceitou a mensagem.",
                response: data,
            };
        }

        return {
            ok: true,
            response: data,
        };
    }

    async function sendResult(payload) {
        if (!isConfigured()) {
            return {
                ok: false,
                code: "missing_config",
                message: "Configure o botToken e o chatId em assets/js/enviar_questionario.js antes de enviar.",
            };
        }

        return sendTelegramMessage(buildMessage(payload));
    }

    async function sendEvent(payload) {
        if (!isConfigured()) {
            return {
                ok: false,
                code: "missing_config",
                message: "Configure o botToken e o chatId em assets/js/enviar_questionario.js antes de enviar.",
            };
        }

        return sendTelegramMessage(buildEventMessage(payload));
    }

    window.EnviarQuestionario = {
        isConfigured,
        sendResult,
        sendEvent,
        buildMessage,
        buildEventMessage,
    };
})();
