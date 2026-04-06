// ==================== PRODUTOS.JS (VERSÃO CORRIGIDA) ====================
// Gerencia: carregar produtos do JSON, filtrar, modal de detalhes

// Variável global para armazenar todos os produtos
let produtosData = [];
let produtosFiltrados = [];
let currentPage = 1;
const itemsPerPage = 12;

// ==================== CARREGAR PRODUTOS DO JSON ====================
async function carregarProdutos() {
    try {
        const response = await fetch('data/produtos.json');
        const data = await response.json();
        produtosData = data.produtos;
        produtosFiltrados = [...produtosData];
        
        localStorage.setItem('produtos_db', JSON.stringify(produtosData));
        window.produtosDB = produtosData;
        
        // Renderiza os produtos na página de catálogo
        if (document.getElementById('productsGrid')) {
            renderizarProdutos();
            configurarFiltros();
            configurarOrdenacao();
        }
        
        // Renderiza os produtos em destaque na página inicial
        if (document.getElementById('featuredGrid')) {
            carregarProdutosDestaque();
        }
        
        return produtosData;
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        mostrarErro('Erro ao carregar produtos. Tente novamente.');
        return [];
    }
}

// ==================== RENDERIZAR PRODUTOS NA GRID (CATÁLOGO) ====================
function renderizarProdutos() {
    const grid = document.getElementById('productsGrid');
    const countElement = document.getElementById('productsCount');
    
    if (!grid) return;
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const produtosPagina = produtosFiltrados.slice(start, end);
    
    if (produtosPagina.length === 0) {
        grid.innerHTML = `
            <div class="no-products">
                <span>🔍</span>
                <h3>Nenhum produto encontrado</h3>
                <p>Tente ajustar os filtros ou buscar outra categoria</p>
                <button class="btn-dourado" onclick="limparTodosFiltros()">Limpar Filtros</button>
            </div>
        `;
        if (countElement) countElement.textContent = '0 produtos';
        return;
    }
    
    if (countElement) {
        countElement.textContent = `${produtosFiltrados.length} ${produtosFiltrados.length === 1 ? 'produto' : 'produtos'}`;
    }
    
    grid.innerHTML = produtosPagina.map(produto => {
        const imagemSrc = produto.imagens && produto.imagens[0] 
            ? `images/produtos/${produto.imagens[0]}` 
            : 'https://placehold.co/300x400/f5f5f5/999?text=HSALB';
        
        return `
            <div class="product-card" data-id="${produto.id}">
                <div class="product-image">
                    <img src="${imagemSrc}" 
                         alt="${produto.nome}"
                         onerror="this.src='https://placehold.co/300x400/f5f5f5/999?text=HSALB'">
                    ${produto.preco_promocional ? '<span class="product-badge">Promoção</span>' : ''}
                    ${produto.novidade ? '<span class="product-badge" style="background:#2E7D32; color:white;">Novidade</span>' : ''}
                    ${produto.destaque ? '<span class="product-badge" style="background:#D4AF37; color:#1A1A1A;">Destaque</span>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${produto.nome}</h3>
                    <p class="product-desc">${produto.descricao.substring(0, 60)}...</p>
                    <div class="product-price">
                        ${produto.preco_promocional ? `
                            <span class="old-price">${formatarPreco(produto.preco)}</span>
                            <span class="current-price">${formatarPreco(produto.preco_promocional)}</span>
                        ` : `
                            <span class="current-price">${formatarPreco(produto.preco)}</span>
                        `}
                        <span class="installment">ou até 3x de ${formatarPreco(Math.floor((produto.preco_promocional || produto.preco) / 3))}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-cart" onclick="window.abrirModalProduto(${produto.id})">
                            Ver Detalhes
                        </button>
                        <button class="btn-add-to-cart" onclick="window.adicionarAoSacolaRapido(${produto.id})">
                            Adicionar à Sacola
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    renderizarPaginacao();
}

// ==================== CARREGAR PRODUTOS EM DESTAQUE (PÁGINA INICIAL) ====================
function carregarProdutosDestaque() {
    const featuredGrid = document.getElementById('featuredGrid');
    if (!featuredGrid) return;
    
    // Se ainda não carregou, tenta do localStorage
    if (!produtosData || produtosData.length === 0) {
        const stored = localStorage.getItem('produtos_db');
        if (stored) {
            produtosData = JSON.parse(stored);
            window.produtosDB = produtosData;
        } else {
            featuredGrid.innerHTML = '<div class="loading-spinner">Carregando produtos...</div>';
            return;
        }
    }
    
    const destaques = produtosData.filter(p => p.destaque === true).slice(0, 8);
    
    if (destaques.length === 0) {
        featuredGrid.innerHTML = '<div class="loading-spinner">Nenhum produto em destaque no momento.</div>';
        return;
    }
    
    featuredGrid.innerHTML = destaques.map(produto => {
        const imagemSrc = produto.imagens && produto.imagens[0] 
            ? `images/produtos/${produto.imagens[0]}` 
            : 'https://placehold.co/300x400/f5f5f5/999?text=HSALB';
        
        return `
            <div class="product-card" data-id="${produto.id}">
                <div class="product-image">
                    <img src="${imagemSrc}" 
                         alt="${produto.nome}"
                         onerror="this.src='https://placehold.co/300x400/f5f5f5/999?text=HSALB'">
                    ${produto.preco_promocional ? '<span class="product-badge">Promoção</span>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${produto.nome}</h3>
                    <div class="product-price">
                        ${produto.preco_promocional ? `
                            <span class="old-price">${formatarPreco(produto.preco)}</span>
                            <span class="current-price">${formatarPreco(produto.preco_promocional)}</span>
                        ` : `
                            <span class="current-price">${formatarPreco(produto.preco)}</span>
                        `}
                    </div>
                    <div class="product-actions">
                        <button class="btn-cart" onclick="window.abrirModalProduto(${produto.id})">
                            Ver Detalhes
                        </button>
                        <button class="btn-add-to-cart" onclick="window.adicionarAoSacolaRapido(${produto.id})">
                            Adicionar à Sacola
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== ABRIR MODAL COM DETALHES DO PRODUTO ====================
function abrirModalProduto(produtoId) {
    console.log('Abrindo modal do produto:', produtoId);
    
    // Garantir que produtosData está carregado
    if (!produtosData || produtosData.length === 0) {
        const stored = localStorage.getItem('produtos_db');
        if (stored) {
            produtosData = JSON.parse(stored);
            window.produtosDB = produtosData;
        } else {
            window.showToast('Erro: Produtos não carregados. Recarregue a página.', 'error');
            return;
        }
    }
    
    const produto = produtosData.find(p => p.id === produtoId);
    if (!produto) {
        window.showToast('Produto não encontrado', 'error');
        return;
    }
    
    const modalBody = document.getElementById('modalBody');
    if (!modalBody) {
        window.showToast('Erro ao abrir detalhes', 'error');
        return;
    }
    
    const getImageSrc = (imgPath) => {
        if (!imgPath) return '';
        return `images/produtos/${imgPath}`;
    };
    
    const mainImageSrc = getImageSrc(produto.imagens[0]);
    
    const tamanhosHtml = produto.tamanhos.map(tamanho => `
        <button class="modal-size-btn" data-size="${tamanho}" onclick="window.selecionarTamanhoModal('${tamanho}')">
            ${tamanho}
        </button>
    `).join('');
    
    modalBody.innerHTML = `
        <div class="modal-product">
            <div class="modal-gallery">
                <div class="modal-main-image">
                    <img id="modalMainImage" src="${mainImageSrc}" 
                         alt="${produto.nome}"
                         style="width:100%; height:auto; max-height:400px; object-fit:contain;">
                </div>
            </div>
            <div class="modal-info">
                <h2>${produto.nome}</h2>
                <div class="modal-price">
                    ${produto.preco_promocional ? `
                        <span class="old-price">${formatarPreco(produto.preco)}</span>
                        <span class="current-price">${formatarPreco(produto.preco_promocional)}</span>
                    ` : `
                        <span class="current-price">${formatarPreco(produto.preco)}</span>
                    `}
                    <span class="installment">ou até 3x de ${formatarPreco(Math.floor((produto.preco_promocional || produto.preco) / 3))}</span>
                </div>
                
                <div class="modal-sizes">
                    <h4>Tamanho:</h4>
                    <div class="size-options">
                        ${tamanhosHtml}
                    </div>
                </div>
                
                <div class="modal-quantity">
                    <h4>Quantidade:</h4>
                    <div class="quantity-controls">
                        <button onclick="window.alterarQuantidadeModal(-1)">-</button>
                        <input type="number" id="modalQuantidade" value="1" min="1" max="10">
                        <button onclick="window.alterarQuantidadeModal(1)">+</button>
                    </div>
                </div>
                
                <div class="modal-description">
                    <h4>Descrição:</h4>
                    <p>${produto.descricao}</p>
                </div>
                
                <div class="modal-details">
                    <p><strong>Material:</strong> ${produto.material}</p>
                    <p><strong>Cuidados:</strong> ${produto.cuidados}</p>
                    <p><strong>Estoque:</strong> ${produto.estoque > 0 ? `${produto.estoque} unidades` : 'Sob consulta'}</p>
                </div>
                
                <div class="modal-actions">
                    <button class="btn-cart" onclick="window.adicionarDoModal(${produto.id})">
                        Adicionar à Sacola
                    </button>
                    <button class="btn-whatsapp" onclick="window.comprarDoModal(${produto.id})">
                        Comprar pelo WhatsApp
                    </button>
                </div>
            </div>
        </div>
    `;
    
    window.modalProdutoAtual = produto;
    window.modalTamanhoSelecionado = produto.tamanhos[0] || 'M';
    
    setTimeout(() => {
        const primeiroBtn = document.querySelector('.modal-size-btn');
        if (primeiroBtn) primeiroBtn.classList.add('active');
    }, 50);
    
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                window.fecharModalGlobal();
            }
        });
    }
}

// ==================== FECHAR MODAL ====================
function fecharModalGlobal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// ==================== ADICIONAR À SACOLA RÁPIDO ====================
function adicionarAoSacolaRapido(produtoId) {
    // Garantir que produtosData está carregado
    if (!produtosData || produtosData.length === 0) {
        const stored = localStorage.getItem('produtos_db');
        if (stored) {
            produtosData = JSON.parse(stored);
            window.produtosDB = produtosData;
        } else {
            window.showToast('Erro: Produtos não carregados.', 'error');
            return;
        }
    }
    
    const produto = produtosData.find(p => p.id === produtoId);
    if (!produto) {
        window.showToast('Erro ao adicionar produto', 'error');
        return;
    }
    
    const tamanhoPadrao = produto.tamanhos && produto.tamanhos.length > 0 ? produto.tamanhos[0] : 'M';
    
    if (window.cart) {
        window.cart.addItem(produto, tamanhoPadrao, 1);
    } else {
        window.showToast('Erro ao acessar sacola', 'error');
    }
}

// ==================== FUNÇÕES DO MODAL ====================
function mudarImagemModal(src) {
    const mainImage = document.getElementById('modalMainImage');
    if (mainImage) mainImage.src = src;
}

function selecionarTamanhoModal(tamanho) {
    window.modalTamanhoSelecionado = tamanho;
    
    document.querySelectorAll('.modal-size-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.size === tamanho) btn.classList.add('active');
    });
}

function alterarQuantidadeModal(delta) {
    const input = document.getElementById('modalQuantidade');
    if (!input) return;
    let newValue = parseInt(input.value) + delta;
    if (newValue < 1) newValue = 1;
    if (newValue > 10) newValue = 10;
    input.value = newValue;
}

function adicionarDoModal(produtoId) {
    const quantidade = parseInt(document.getElementById('modalQuantidade')?.value || 1);
    const produto = window.modalProdutoAtual;
    const tamanho = window.modalTamanhoSelecionado;
    
    if (produto && window.cart) {
        window.cart.addItem(produto, tamanho, quantidade);
        fecharModalGlobal();
        window.showToast(`${produto.nome} adicionado à sacola!`, 'success');
    }
}

function comprarDoModal(produtoId) {
    const quantidade = parseInt(document.getElementById('modalQuantidade')?.value || 1);
    const produto = window.modalProdutoAtual;
    const tamanho = window.modalTamanhoSelecionado;
    
    if (produto && typeof window.comprarProdutoDireto === 'function') {
        window.comprarProdutoDireto(produto, tamanho, quantidade);
        fecharModalGlobal();
    }
}

// ==================== RENDERIZAR PAGINAÇÃO ====================
function renderizarPaginacao() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    const totalPages = Math.ceil(produtosFiltrados.length / itemsPerPage);
    
    if (totalPages <= 1) {
        const existingPagination = document.querySelector('.pagination');
        if (existingPagination) existingPagination.remove();
        return;
    }
    
    let paginationHtml = '<div class="pagination">';
    
    paginationHtml += `
        <button class="page-btn" onclick="mudarPagina(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            Anterior
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHtml += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="mudarPagina(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHtml += `<span class="page-dots">...</span>`;
        }
    }
    
    paginationHtml += `
        <button class="page-btn" onclick="mudarPagina(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            Próximo
        </button>
    `;
    
    paginationHtml += '</div>';
    
    const existingPagination = document.querySelector('.pagination');
    if (existingPagination) existingPagination.remove();
    grid.insertAdjacentHTML('afterend', paginationHtml);
}

function mudarPagina(page) {
    const totalPages = Math.ceil(produtosFiltrados.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderizarProdutos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== FILTROS ====================
function configurarFiltros() {
    const categoriaRadios = document.querySelectorAll('#filterCategorias input[type="radio"]');
    categoriaRadios.forEach(radio => {
        radio.addEventListener('change', () => aplicarFiltros());
    });
    
    const precoRadios = document.querySelectorAll('#filterPreco input[type="radio"]');
    precoRadios.forEach(radio => {
        radio.addEventListener('change', () => aplicarFiltros());
    });
    
    const tamanhoCheckboxes = document.querySelectorAll('#filterTamanhos input[type="checkbox"]');
    tamanhoCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => aplicarFiltros());
    });
    
    const limparBtn = document.getElementById('limparFiltrosBtn');
    if (limparBtn) {
        limparBtn.addEventListener('click', () => limparTodosFiltros());
    }
}

function aplicarFiltros() {
    const categoriaSelecionada = document.querySelector('#filterCategorias input[type="radio"]:checked')?.value;
    const filtroCategoriaAtivo = categoriaSelecionada && categoriaSelecionada !== 'todos';
    
    let precoMin = 0, precoMax = Infinity;
    const precoSelecionado = document.querySelector('#filterPreco input[type="radio"]:checked');
    if (precoSelecionado && precoSelecionado.value !== 'todos') {
        const [min, max] = precoSelecionado.value.split('-');
        precoMin = parseInt(min) || 0;
        precoMax = max ? parseInt(max) : Infinity;
    }
    
    const tamanhosSelecionados = [];
    document.querySelectorAll('#filterTamanhos input[type="checkbox"]:checked').forEach(cb => {
        tamanhosSelecionados.push(cb.value);
    });
    
    produtosFiltrados = produtosData.filter(produto => {
        if (filtroCategoriaAtivo && produto.categoria !== categoriaSelecionada) {
            return false;
        }
        
        const precoProduto = produto.preco_promocional || produto.preco;
        if (precoProduto < precoMin || precoProduto > precoMax) {
            return false;
        }
        
        if (tamanhosSelecionados.length > 0) {
            const temTamanho = produto.tamanhos.some(t => tamanhosSelecionados.includes(t));
            if (!temTamanho) return false;
        }
        
        return true;
    });
    
    const ordenarSelect = document.getElementById('ordenarProdutos');
    if (ordenarSelect) {
        ordenarProdutos(ordenarSelect.value);
    }
    
    currentPage = 1;
    renderizarProdutos();
}

function ordenarProdutos(criterio) {
    switch(criterio) {
        case 'menor-preco':
            produtosFiltrados.sort((a, b) => {
                const precoA = a.preco_promocional || a.preco;
                const precoB = b.preco_promocional || b.preco;
                return precoA - precoB;
            });
            break;
        case 'maior-preco':
            produtosFiltrados.sort((a, b) => {
                const precoA = a.preco_promocional || a.preco;
                const precoB = b.preco_promocional || b.preco;
                return precoB - precoA;
            });
            break;
        default:
            produtosFiltrados.sort((a, b) => {
                if (a.destaque && !b.destaque) return -1;
                if (!a.destaque && b.destaque) return 1;
                if (a.novidade && !b.novidade) return -1;
                if (!a.novidade && b.novidade) return 1;
                return 0;
            });
    }
}

function configurarOrdenacao() {
    const ordenarSelect = document.getElementById('ordenarProdutos');
    if (ordenarSelect) {
        ordenarSelect.addEventListener('change', () => {
            ordenarProdutos(ordenarSelect.value);
            currentPage = 1;
            renderizarProdutos();
        });
    }
}

function limparTodosFiltros() {
    const todosRadio = document.querySelector('#filterCategorias input[value="todos"]');
    if (todosRadio) todosRadio.checked = true;
    
    const todosPreco = document.querySelector('#filterPreco input[value="todos"]');
    if (todosPreco) todosPreco.checked = true;
    
    document.querySelectorAll('#filterTamanhos input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    produtosFiltrados = [...produtosData];
    currentPage = 1;
    renderizarProdutos();
}

function mostrarErro(mensagem) {
    const grid = document.getElementById('productsGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="no-products">
                <span>⚠️</span>
                <h3>Erro ao carregar produtos</h3>
                <p>${mensagem}</p>
                <button class="btn-dourado" onclick="location.reload()">Tentar Novamente</button>
            </div>
        `;
    }
    window.showToast(mensagem, 'error');
}

// ==================== INICIALIZA ====================
document.addEventListener('DOMContentLoaded', function() {
    carregarProdutos();
});

// ==================== EXPORTA FUNÇÕES GLOBAIS ====================
// Todas as funções são exportadas para window para funcionarem na home
window.adicionarAoSacolaRapido = adicionarAoSacolaRapido;
window.abrirModalProduto = abrirModalProduto;
window.adicionarDoModal = adicionarDoModal;
window.comprarDoModal = comprarDoModal;
window.mudarPagina = mudarPagina;
window.limparTodosFiltros = limparTodosFiltros;
window.fecharModalGlobal = fecharModalGlobal;
window.mudarImagemModal = mudarImagemModal;
window.selecionarTamanhoModal = selecionarTamanhoModal;
window.alterarQuantidadeModal = alterarQuantidadeModal;
window.produtosData = produtosData;