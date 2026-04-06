// ==================== MAIN.JS - INICIALIZAÇÃO GERAL ====================

document.addEventListener('DOMContentLoaded', function() {
    
    // ==================== MENU MOBILE ====================
    const menuMobileBtn = document.getElementById('menuMobileBtn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuMobileBtn && navMenu) {
        menuMobileBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const icon = menuMobileBtn.querySelector('ion-icon');
            if (navMenu.classList.contains('active')) {
                if (icon) icon.setAttribute('name', 'close-outline');
            } else {
                if (icon) icon.setAttribute('name', 'menu-outline');
            }
        });
        
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                const icon = menuMobileBtn.querySelector('ion-icon');
                if (icon) icon.setAttribute('name', 'menu-outline');
            });
        });
    }
    
    // ==================== BANNER SLIDER ====================
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const dotsContainer = document.getElementById('sliderDots');
    
    let currentSlide = 0;
    let slideInterval;
    const intervalTime = 5000;
    
    if (slides.length > 0) {
        if (dotsContainer) {
            for (let i = 0; i < slides.length; i++) {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
        }
        
        function goToSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            const dots = document.querySelectorAll('.dot');
            dots.forEach(dot => dot.classList.remove('active'));
            
            slides[index].classList.add('active');
            if (dots[index]) dots[index].classList.add('active');
            currentSlide = index;
        }
        
        function nextSlide() {
            let next = currentSlide + 1;
            if (next >= slides.length) next = 0;
            goToSlide(next);
        }
        
        function prevSlide() {
            let prev = currentSlide - 1;
            if (prev < 0) prev = slides.length - 1;
            goToSlide(prev);
        }
        
        if (prevBtn) prevBtn.addEventListener('click', () => {
            prevSlide();
            resetInterval();
        });
        
        if (nextBtn) nextBtn.addEventListener('click', () => {
            nextSlide();
            resetInterval();
        });
        
        function startInterval() {
            slideInterval = setInterval(nextSlide, intervalTime);
        }
        
        function resetInterval() {
            clearInterval(slideInterval);
            startInterval();
        }
        
        startInterval();
        
        const sliderContainer = document.querySelector('.slider-container');
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', () => {
                clearInterval(slideInterval);
            });
            sliderContainer.addEventListener('mouseleave', () => {
                startInterval();
            });
        }
    }
    
    // ==================== NEWSLETTER FORM ====================
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value;
            
            if (email) {
                let newsletters = JSON.parse(localStorage.getItem('newsletter_emails') || '[]');
                if (!newsletters.includes(email)) {
                    newsletters.push(email);
                    localStorage.setItem('newsletter_emails', JSON.stringify(newsletters));
                }
                
                window.showToast('Obrigado por se inscrever! Você receberá nossas novidades em breve.', 'success');
                emailInput.value = '';
            }
        });
    }
    
    // ==================== ANIMAÇÕES AO SCROLL ====================
    const animateElements = document.querySelectorAll('.step-card, .category-card, .product-card, .diferencial-card, .depoimento-card');
    
    function checkScroll() {
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
    
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.5s ease';
    });
    
    window.addEventListener('scroll', checkScroll);
    checkScroll();
    
    // ==================== TOAST ====================
    window.showToast = function(message, type = 'success') {
        const existingToast = document.querySelector('.toast-message');
        if (existingToast) existingToast.remove();
        
        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;
        toast.innerHTML = `
            <ion-icon name="${type === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'}"></ion-icon>
            <span>${message}</span>
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#2E7D32' : '#C41E3A'};
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            font-size: 0.9rem;
            z-index: 2000;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };
    
    // ==================== FILTRO DE URL ====================
    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const categoria = params.get('cat');
        if (categoria) {
            localStorage.setItem('filtro_categoria', categoria);
        }
    }
    getUrlParams();
});

// ==================== FUNÇÃO PARA FORMATAR PREÇO ====================
function formatarPreco(valor) {
    return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valor).replace('AOA', '') + ' Kz';
}

// ==================== GERAR ID ÚNICO ====================
function gerarIDUnico() {
    return 'HSALB-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// ==================== FUNÇÕES GLOBAIS DO MODAL ====================
function abrirModalGlobal() {
    const modal = document.getElementById('productModal');
    const overlay = document.getElementById('cartOverlay');
    if (modal) {
        modal.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                fecharModalGlobal();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                fecharModalGlobal();
            }
        });
    }
}

function fecharModalGlobal() {
    const modal = document.getElementById('productModal');
    const overlay = document.getElementById('cartOverlay');
    if (modal) {
        modal.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

window.abrirModalGlobal = abrirModalGlobal;
window.fecharModalGlobal = fecharModalGlobal;