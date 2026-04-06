// ==================== WHATSAPP.JS ====================
// Gerencia: envio de pedidos via WhatsApp, formatação de mensagens

// Número da Boutique HSALB (substitua pelo número real)
const WHATSAPP_NUMBER = "244941299293"; // Formato: CÓDIGO PAÍS + NÚMERO (sem +)
const WHATSAPP_MESSAGE = "Olá! Gostaria de fazer um pedido na Boutique HSALB:";

// ==================== FORMATAR ITENS PARA MENSAGEM ====================
function formatarItensParaWhatsApp(itens) {
    if (!itens || itens.length === 0) return '';
    
    let itensFormatados = '';
    let total = 0;
    
    itens.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        itensFormatados += `${index + 1}. *${item.name}*\n`;
        itensFormatados += `   Tamanho: ${item.size} | Quantidade: ${item.quantity}\n`;
        itensFormatados += `   Valor: ${formatarPreco(item.price)} = ${formatarPreco(subtotal)}\n\n`;
    });
    
    return {
        itensTexto: itensFormatados,
        total: total
    };
}

// ==================== GERAR MENSAGEM COMPLETA DO PEDIDO ====================
function gerarMensagemPedido(itens) {
    const { itensTexto, total } = formatarItensParaWhatsApp(itens);
    const dataAtual = new Date().toLocaleDateString('pt-AO');
    const horaAtual = new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
    
    return `
*👗 BOUTIQUE HSALB - PEDIDO #${gerarIDUnico()}*
*Data:* ${dataAtual} às ${horaAtual}

━━━━━━━━━━━━━━━━━━━━

*📦 ITENS DO PEDIDO:*

${itensTexto}

━━━━━━━━━━━━━━━━━━━━

*💰 RESUMO:*
Subtotal: ${formatarPreco(total)}
Frete: *A calcular*
━━━━━━━━━━━━━━━━━━━━
*TOTAL: ${formatarPreco(total)}*

━━━━━━━━━━━━━━━━━━━━

*👤 DADOS DO CLIENTE:*
Nome: __________________
Telefone: __________________
Endereço: __________________
Bairro: __________________
Município: __________________
Província: __________________
Ponto de referência: __________________

━━━━━━━━━━━━━━━━━━━━

*💳 FORMA DE PAGAMENTO:*
[ ] Pix (10% OFF)
[ ] Cartão de Crédito
[ ] Transferência Bancária
[ ] Dinheiro na Entrega

━━━━━━━━━━━━━━━━━━━━

*📋 OBSERVAÇÕES:*
__________________________________
__________________________________

━━━━━━━━━━━━━━━━━━━━
*Envie este pedido para confirmar sua compra!*
*Boutique HSALB - Zango 3, Icolo e Bengo*
    `.trim();
}

// ==================== ENVIAR PEDIDO VIA WHATSAPP ====================
function enviarPedidoWhatsApp(itens) {
    if (!itens || itens.length === 0) {
        window.showToast('Sua sacola está vazia! Adicione alguns produtos.', 'error');
        return false;
    }
    
    const mensagem = gerarMensagemPedido(itens);
    const mensagemCodificada = encodeURIComponent(mensagem);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensagemCodificada}`;
    
    // Abre WhatsApp em nova aba
    window.open(url, '_blank');
    
    return true;
}

// ==================== FINALIZAR PEDIDO (COM ITENS DA SACOLA) ====================
function finalizarPedidoWhatsApp() {
    if (!window.cart) {
        window.showToast('Erro ao acessar sacola', 'error');
        return;
    }
    
    const itens = window.cart.getItems();
    
    if (itens.length === 0) {
        window.showToast('Sua sacola está vazia! Adicione alguns produtos.', 'error');
        return;
    }
    
    const enviado = enviarPedidoWhatsApp(itens);
    
    if (enviado) {
        // Opcional: limpar sacola após enviar? (comentado para não limpar automaticamente)
        // window.cart.clearCart();
        
        // Fecha a sidebar do carrinho
        if (window.cart.closeCart) {
            window.cart.closeCart();
        }
        
        window.showToast('Pedido encaminhado para o WhatsApp!', 'success');
    }
    
    return enviado;
}

// ==================== COMPRAR PRODUTO ESPECÍFICO (DIRETO) ====================
function comprarProdutoDireto(produto, tamanho = 'M', quantidade = 1) {
    if (!produto) {
        window.showToast('Produto não encontrado', 'error');
        return;
    }
    
    const preco = produto.preco_promocional || produto.preco;
    
    const itens = [{
        id: produto.id,
        name: produto.nome,
        price: preco,
        size: tamanho,
        quantity: quantidade,
        image: produto.imagens ? produto.imagens[0] : 'placeholder.jpg'
    }];
    
    enviarPedidoWhatsApp(itens);
}

// ==================== COMPRAR MÚLTIPLOS PRODUTOS (SELECIONADOS) ====================
function comprarProdutosSelecionados(produtosSelecionados) {
    if (!produtosSelecionados || produtosSelecionados.length === 0) {
        window.showToast('Nenhum produto selecionado', 'error');
        return;
    }
    
    enviarPedidoWhatsApp(produtosSelecionados);
}

// ==================== GERAR LINK DIRETO DO WHATSAPP ====================
function gerarLinkWhatsApp(mensagemPersonalizada) {
    const mensagem = mensagemPersonalizada || WHATSAPP_MESSAGE;
    const mensagemCodificada = encodeURIComponent(mensagem);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${mensagemCodificada}`;
}

// ==================== ABRIR WHATSAPP COM MENSAGEM PERSONALIZADA ====================
function abrirWhatsAppPersonalizado(mensagem) {
    const url = gerarLinkWhatsApp(mensagem);
    window.open(url, '_blank');
}

// ==================== ENVIAR MENSAGEM DE SUPORTE (CONTATO) ====================
function enviarSuporteWhatsApp(nome, telefone, motivo, mensagem, numeroPedido = '') {
    let textoSuporte = `
*📞 SUPORTE BOUTIQUE HSALB*

*DADOS DO CLIENTE*
Nome: ${nome}
Telefone: ${telefone}

*TIPO DE CONTATO*
${motivo}
${numeroPedido ? `*Pedido:* ${numeroPedido}` : ''}

*MENSAGEM*
${mensagem}

*Enviado em:* ${new Date().toLocaleString('pt-AO')}

Por favor, responder em até 24h.
    `.trim();
    
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(textoSuporte)}`;
    window.open(url, '_blank');
}

// ==================== FUNÇÕES PARA O FORMULÁRIO DE CONTATO ====================
function enviarContatoWhatsApp(dados) {
    const { nome, telefone, motivo, mensagem, numeroPedido } = dados;
    enviarSuporteWhatsApp(nome, telefone, motivo, mensagem, numeroPedido);
}

// ==================== EXPORTA FUNÇÕES GLOBAIS ====================
window.enviarPedidoWhatsApp = enviarPedidoWhatsApp;
window.finalizarPedidoWhatsApp = finalizarPedidoWhatsApp;
window.comprarProdutoDireto = comprarProdutoDireto;
window.comprarProdutosSelecionados = comprarProdutosSelecionados;
window.abrirWhatsAppPersonalizado = abrirWhatsAppPersonalizado;
window.enviarContatoWhatsApp = enviarContatoWhatsApp;
window.enviarSuporteWhatsApp = enviarSuporteWhatsApp;
window.gerarLinkWhatsApp = gerarLinkWhatsApp;

// ==================== CONFIGURAÇÃO DO BOTÃO DE FINALIZAR ====================
document.addEventListener('DOMContentLoaded', function() {
    // Configura o botão de finalizar pedido na sidebar
    const checkoutBtn = document.getElementById('checkoutWhatsAppBtn');
    if (checkoutBtn) {
        // Remove listener antigo se existir
        const newBtn = checkoutBtn.cloneNode(true);
        checkoutBtn.parentNode.replaceChild(newBtn, checkoutBtn);
        newBtn.addEventListener('click', () => {
            if (window.cart) {
                finalizarPedidoWhatsApp();
            }
        });
    }
});