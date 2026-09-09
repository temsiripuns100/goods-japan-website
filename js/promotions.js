// promotions.js - Discount codes and countdown

let allPromotions = [];

document.addEventListener('DOMContentLoaded', () => {
    const promoContainer = document.getElementById('active-promos');
    const expiredContainer = document.getElementById('expired-promos');
    if (promoContainer) {
        initPromotions(promoContainer.id);
    }
    if (expiredContainer) {
        loadExpiredPromotions(expiredContainer.id);
    }
    
    initDiscountInput();
    
    // Init countdown if elements exist
    const countdownEl = document.getElementById('main-countdown');
    if (countdownEl) {
        const target = new Date();
        target.setDate(target.getDate() + 3);
        initCountdown(target, 'main-countdown');
    }
});

async function fetchPromotions() {
    try {
        const response = await fetch('data/promotions.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.promotions;
    } catch (error) {
        console.error('Error loading promotions:', error);
        return [];
    }
}

async function loadPromotions(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '<div class="loading">กำลังโหลดโปรโมชั่น...</div>';
    
    if (allPromotions.length === 0) {
        allPromotions = await fetchPromotions();
    }
    
    // Only show active ones
    const activePromos = allPromotions.filter(p => p.isActive && new Date(p.endDate) >= new Date());
    
    if (activePromos.length === 0) {
        container.innerHTML = '<div class="no-promos">ขณะนี้ยังไม่มีโปรโมชั่นใหม่</div>';
        return;
    }
    
    container.innerHTML = activePromos.map(p => renderPromoCard(p)).join('');
}

function renderPromoCard(promo) {
    const endDate = new Date(promo.endDate).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
    
    return `
        <div class="promo-card">
            <h3 class="promo-title">${promo.title}</h3>
            <p class="promo-desc">${promo.description}</p>
            <div class="promo-details">
                <div class="promo-code-wrap">
                    <span>โค้ดส่วนลด:</span>
                    <strong class="promo-code">${promo.code}</strong>
                </div>
                <div class="promo-discount">ลด ${promo.discountPercent}%</div>
                <div class="promo-expiry">หมดเขต: ${endDate}</div>
            </div>
            ${promo.minPurchase ? `<div class="promo-condition">ขั้นต่ำ ฿${promo.minPurchase}</div>` : ''}
        </div>
    `;
}

async function validateDiscountCode(code) {
    if (allPromotions.length === 0) {
        allPromotions = await fetchPromotions();
    }
    
    const promo = allPromotions.find(p => p.code.toUpperCase() === code.toUpperCase());
    
    if (!promo) {
        return { valid: false, message: 'ไม่พบโค้ดส่วนลดนี้' };
    }
    
    if (!promo.isActive) {
        return { valid: false, message: 'โค้ดส่วนลดนี้ไม่สามารถใช้ได้แล้ว' };
    }
    
    if (new Date(promo.endDate) < new Date()) {
        return { valid: false, message: 'โค้ดส่วนลดนี้หมดอายุแล้ว' };
    }
    
    return { 
        valid: true, 
        message: `ใช้โค้ดสำเร็จ! ได้รับส่วนลด ${promo.discountPercent}%`,
        discount: promo.discountPercent 
    };
}

function initDiscountInput() {
    const btn = document.querySelector('.discount-btn');
    const input = document.querySelector('.discount-input');
    const resultMsg = document.getElementById('discount-result');
    
    if (btn && input && resultMsg) {
        btn.addEventListener('click', async () => {
            const code = input.value.trim();
            if (!code) return;
            
            resultMsg.style.opacity = '0';
            
            const result = await validateDiscountCode(code);
            
            setTimeout(() => {
                resultMsg.textContent = result.message;
                resultMsg.className = `discount-msg ${result.valid ? 'success' : 'error'}`;
                resultMsg.style.transition = 'opacity 0.3s';
                resultMsg.style.opacity = '1';
                
                if (result.valid) {
                    resultMsg.style.color = '#2ecc71';
                } else {
                    resultMsg.style.color = '#e74c3c';
                }
            }, 300);
        });
    }
}

function initCountdown(targetDate, elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    function update() {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;
        
        if (distance < 0) {
            el.innerHTML = "โปรโมชั่นหมดเวลาแล้ว";
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        el.innerHTML = `
            <div class="countdown-item"><span class="val">${days}</span><span class="lbl">วัน</span></div>
            <div class="countdown-item"><span class="val">${hours.toString().padStart(2, '0')}</span><span class="lbl">ชม.</span></div>
            <div class="countdown-item"><span class="val">${minutes.toString().padStart(2, '0')}</span><span class="lbl">นาที</span></div>
            <div class="countdown-item"><span class="val">${seconds.toString().padStart(2, '0')}</span><span class="lbl">วิ</span></div>
        `;
    }
    
    update();
    setInterval(update, 1000);
}

function initPromotions(containerId) {
    loadPromotions(containerId);
}

async function loadExpiredPromotions(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (allPromotions.length === 0) {
        allPromotions = await fetchPromotions();
    }

    const expiredPromos = allPromotions.filter(p => !p.isActive || new Date(p.endDate) < new Date());

    if (expiredPromos.length === 0) {
        container.innerHTML = '<div class="no-promos">ยังไม่มีโปรโมชั่นที่หมดอายุ</div>';
        return;
    }

    container.innerHTML = expiredPromos.map(p => renderPromoCard(p)).join('');
}
