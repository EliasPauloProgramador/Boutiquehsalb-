// ==================== CONTATO.JS ====================

const EMAIL_SUPORTE = "suporte@boutiquehsalb.com";

document.addEventListener('DOMContentLoaded', function() {
    const contatoForm = document.getElementById('contatoForm');
    
    if (contatoForm) {
        contatoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            enviarMensagemContato();
        });
    }
});

function enviarMensagemContato() {
    const motivo = document.getElementById('motivo')?.value;
    const nome = document.getElementById('nome')?.value;
    const telefone = document.getElementById('telefone')?.value;
    const email = document.getElementById('email')?.value;
    const numeroPedido = document.getElementById('numeroPedido')?.value;
    const mensagem = document.getElementById('mensagem')?.value;
    
    if (!nome || !telefone || !mensagem) {
        window.showToast('Por favor, preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    if (!motivo) {
        window.showToast('Selecione o motivo do contato', 'error');
        return;
    }
    
    const dadosContato = {
        nome: nome,
        telefone: telefone,
        email: email || 'Não informado',
        motivo: getMotivoTexto(motivo),
        numeroPedido: numeroPedido || 'Não informado',
        mensagem: mensagem,
        data: new Date().toLocaleString('pt-AO')
    };
    
    enviarViaWhatsApp(dadosContato);
    limparFormulario();
    window.showToast('Mensagem enviada com sucesso! Responderemos em breve.', 'success');
}

function getMotivoTexto(motivo) {
    const motivos = {
        'duvida': 'Dúvida sobre produto',
        'reclamacao': 'Reclamação',
        'sugestao': 'Sugestão',
        'pedido': 'Acompanhar pedido',
        'outro': 'Outro'
    };
    return motivos[motivo] || motivo;
}

function enviarViaWhatsApp(dados) {
    const mensagem = `
*SUPORTE BOUTIQUE HSALB*

*DADOS DO CLIENTE*
Nome: ${dados.nome}
Telefone: ${dados.telefone}
Email: ${dados.email}

*TIPO DE CONTATO*
${dados.motivo}
${dados.numeroPedido !== 'Não informado' ? `*Pedido:* ${dados.numeroPedido}` : ''}

*MENSAGEM*
${dados.mensagem}

*Enviado em:* ${dados.data}

-----------------------------------
Por favor, responder em até 24h.
    `.trim();
    
    const url = `https://wa.me/244941299293?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

function limparFormulario() {
    const form = document.getElementById('contatoForm');
    if (form) {
        form.reset();
    }
}

function validarTelefone(telefone) {
    const numeros = telefone.replace(/\D/g, '');
    return numeros.length >= 9 && numeros.length <= 12;
}

function validarEmail(email) {
    const regex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return regex.test(email);
}

window.enviarMensagemContato = enviarMensagemContato;
window.validarTelefone = validarTelefone;
window.validarEmail = validarEmail;