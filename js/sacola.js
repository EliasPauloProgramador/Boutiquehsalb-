// ==================== SACOLA.JS - GERENCIAMENTO DO CARRINHO ====================
// Este arquivo controla: adicionar/remover itens, localStorage, sidebar, total

// Chave do localStorage
const STORAGE_KEY = 'boutique_hsalb_cart';

// ==================== CLASSE DO CARRINHO ====================
class ShoppingCart {
    constructor() {
        this.items = this.loadFromStorage();
        this.updateCartCount();
        this.setupEventListeners();
    }
    
    // Carrega itens do localStorage
    loadFromStorage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch(e) {
                return [];
            }
        }
        return [];
    }
    
    // Salva itens no localStorage
    saveToStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
        this.updateCartCount();
    }
    
    // Adiciona item à sacola
    addItem(product, size = 'M', quantity = 1) {
        // Verifica se o produto já existe na sacola com o mesmo tamanho
        const existingIndex = this.items.findIndex(item => 
            item.id === product.id && item.size === size
        );
        
        if (existingIndex !== -1) {
            // Atualiza quantidade
            this.items[existingIndex].quantity += quantity;
        } else {
            // Adiciona novo item
            this.items.push({
                id: product.id,
                name: product.nome,
                price: product.preco_promocional || product.preco,
                size: size,
                quantity: quantity,
                image: product.imagens ? product.imagens[0] : 'placeholder.jpg',
                originalPrice: product.preco
            });
        }
        
        this.saveToStorage();
        this.updateCartCount();
        this.showAddedToast(product.nome);
        this.renderCartSidebar();
        
        return true;
    }
    
    // Remove item da sacola
    removeItem(id, size) {
        const index = this.items.findIndex(item => item.id === id && item.size === size);
        if (index !== -1) {
            this.items.splice(index, 1);
            this.saveToStorage();
            this.updateCartCount();
            this.renderCartSidebar();
            window.showToast('Item removido da sacola', 'success');
        }
    }
    
    // Atualiza quantidade de um item
    updateQuantity(id, size, newQuantity) {
        const index = this.items.findIndex(item => item.id === id && item.size === size);
        if (index !== -1) {
            if (newQuantity <= 0) {
                this.removeItem(id, size);
            } else {
                this.items[index].quantity = newQuantity;
                this.saveToStorage();
                this.updateCartCount();
                this.renderCartSidebar();
            }
        }
    }
    
    // Retorna todos os itens
    getItems() {
        return this.items;
    }
    
    // Calcula o subtotal
    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    // Calcula o total (com frete - por enquanto só subtotal)
    getTotal() {
        return this.getSubtotal();
    }
    
    // Retorna o número total de itens
    getTotalItems() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }
    
    // Limpa toda a sacola
    clearCart() {
        this.items = [];
        this.saveToStorage();
        this.updateCartCount();
        this.renderCartSidebar();
        window.showToast('Sacola esvaziada', 'success');
    }
    
    // Atualiza o contador no header
    updateCartCount() {
        const cartCountElements = document.querySelectorAll('#cartCount');
        const totalItems = this.getTotalItems();
        cartCountElements.forEach(el => {
            if (el) el.textContent = totalItems;
        });
    }
    
    // Mostra toast ao adicionar item
    showAddedToast(productName) {
        window.showToast(`✨ ${productName} adicionado à sacola!`, 'success');
    }
    
    // Renderiza a sidebar do carrinho
    renderCartSidebar() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotalElement = document.getElementById('cartTotal');
        
        if (!cartItemsContainer) return;
        
        const items = this.getItems();
        
        if (items.length === 0) {
            cartItemsContainer.innerHTML = '<div class="cart-empty">🛍️ Sua sacola está vazia</div>';
            if (cartTotalElement) cartTotalElement.textContent = '0 Kz';
            return;
        }
        
        // Renderiza os itens
        let itemsHtml = '';
        items.forEach(item => {
            itemsHtml += `
                <div class="cart-item" data-id="${item.id}" data-size="${item.size}">
                    <div class="cart-item-image">
                        <img src="images/produtos/${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/300x400/f5f5f5/999?text=HSALB'">
                    </div>
                    <div class="cart-item-info">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <div class="cart-item-price">${formatarPreco(item.price)}</div>
                        <div class="cart-item-size">Tamanho: ${item.size}</div>
                        <div class="cart-item-quantity">
                            <button class="qty-minus" data-id="${item.id}" data-size="${item.size}">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-plus" data-id="${item.id}" data-size="${item.size}">+</button>
                            <button class="cart-item-remove" data-id="${item.id}" data-size="${item.size}">🗑️ Remover</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        cartItemsContainer.innerHTML = itemsHtml;
        
        // Atualiza total
        if (cartTotalElement) {
            cartTotalElement.textContent = formatarPreco(this.getTotal());
        }
        
        // Adiciona eventos aos botões
        document.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                const size = btn.dataset.size;
                const item = this.items.find(i => i.id === id && i.size === size);
                if (item) {
                    this.updateQuantity(id, size, item.quantity - 1);
                }
            });
        });
        
        document.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                const size = btn.dataset.size;
                const item = this.items.find(i => i.id === id && i.size === size);
                if (item) {
                    this.updateQuantity(id, size, item.quantity + 1);
                }
            });
        });
        
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                const size = btn.dataset.size;
                this.removeItem(id, size);
            });
        });
    }
    
    // Abre a sidebar do carrinho
    openCart() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        if (sidebar) {
            sidebar.classList.add('open');
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.renderCartSidebar();
        }
    }
    
    // Fecha a sidebar do carrinho
    closeCart() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        if (sidebar) {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
    
    // Configura eventos da interface
    setupEventListeners() {
        // Botão do carrinho no header
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => this.openCart());
        }
        
        // Fechar carrinho
        const closeBtn = document.getElementById('closeCartBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeCart());
        }
        
        const overlay = document.getElementById('cartOverlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.closeCart());
        }
        
        const continueBtn = document.getElementById('continueShoppingBtn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.closeCart());
        }
        
        // Botão de finalizar pedido
        const checkoutBtn = document.getElementById('checkoutWhatsAppBtn');
        if (checkoutBtn && typeof window.finalizarPedidoWhatsApp === 'function') {
            checkoutBtn.addEventListener('click', () => {
                window.finalizarPedidoWhatsApp();
            });
        }
    }
}

// ==================== INICIALIZA O CARRINHO ====================
let cart;

document.addEventListener('DOMContentLoaded', function() {
    cart = new ShoppingCart();
    window.cart = cart; // Torna global para uso em outros scripts
});

// ==================== FUNÇÃO GLOBAL PARA ADICIONAR À SACOLA ====================
function adicionarAoSacola(produtoId, tamanho = 'M', quantidade = 1) {
    // Busca o produto no banco de dados global
    if (typeof window.produtosDB !== 'undefined' && window.produtosDB) {
        const produto = window.produtosDB.find(p => p.id === produtoId);
        if (produto && cart) {
            cart.addItem(produto, tamanho, quantidade);
            return true;
        }
    }
    
    // Fallback: tenta buscar do localStorage
    const produtosSalvos = localStorage.getItem('produtos_db');
    if (produtosSalvos) {
        const produtos = JSON.parse(produtosSalvos);
        const produto = produtos.find(p => p.id === produtoId);
        if (produto && cart) {
            cart.addItem(produto, tamanho, quantidade);
            return true;
        }
    }
    
    window.showToast('Erro ao adicionar produto', 'error');
    return false;
}

// ==================== FUNÇÃO PARA COMPRAR AGORA (Direto pelo WhatsApp) ====================
function comprarAgora(produto, tamanho = 'M', quantidade = 1) {
    if (!produto) return;
    
    // Cria um carrinho temporário com apenas este produto
    const tempItems = [{
        id: produto.id,
        name: produto.nome,
        price: produto.preco_promocional || produto.preco,
        size: tamanho,
        quantity: quantidade,
        image: produto.imagens ? produto.imagens[0] : 'placeholder.jpg'
    }];
    
    // Abre WhatsApp com este produto
    if (typeof window.enviarPedidoWhatsApp === 'function') {
        window.enviarPedidoWhatsApp(tempItems);
    }
}

// ==================== EXPORTA FUNÇÕES GLOBAIS ====================
window.adicionarAoSacola = adicionarAoSacola;
window.comprarAgora = comprarAgora;
window.ShoppingCart = ShoppingCart;