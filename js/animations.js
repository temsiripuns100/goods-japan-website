// animations.js - Scroll effects and visual enhancements

document.addEventListener('DOMContentLoaded', () => {
    initScrollEffects();
    initSparkle();
    initMascot();
    initParallax();
});

function initScrollEffects() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optional: stop observing once visible
                    // observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        
        fadeElements.forEach(el => observer.observe(el));
    } else {
        // Fallback
        fadeElements.forEach(el => el.classList.add('visible'));
    }
}

function initSparkle() {
    // Add sparkle effect to specific elements using CSS animation classes
    // For JS approach:
    setInterval(() => {
        const badges = document.querySelectorAll('.badge-new, .badge-sale');
        badges.forEach(badge => {
            if (Math.random() > 0.8) {
                badge.style.transform = 'scale(1.1)';
                setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
            }
        });
    }, 2000);
}

function initMascot() {
    const mascot = document.createElement('div');
    mascot.className = 'mascot-neko';
    mascot.style.position = 'fixed';
    mascot.style.bottom = '20px';
    mascot.style.right = '20px';
    mascot.style.width = '60px';
    mascot.style.height = '60px';
    mascot.style.cursor = 'pointer';
    mascot.style.zIndex = '1000';
    mascot.style.backgroundImage = 'url("../assets/images/neko.png")'; // Placeholder
    mascot.style.backgroundSize = 'contain';
    mascot.style.backgroundRepeat = 'no-repeat';
    mascot.style.filter = 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))';
    mascot.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    // Default text fallback if no image
    mascot.innerHTML = '<div style="font-size: 40px; text-align:center; line-height: 60px;">🐱</div>';
    
    const tooltip = document.createElement('div');
    tooltip.className = 'mascot-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.bottom = '70px';
    tooltip.style.right = '10px';
    tooltip.style.backgroundColor = '#fff';
    tooltip.style.padding = '10px 15px';
    tooltip.style.borderRadius = '20px 20px 0 20px';
    tooltip.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    tooltip.style.fontFamily = 'Prompt, sans-serif';
    tooltip.style.fontSize = '14px';
    tooltip.style.opacity = '0';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.transition = 'opacity 0.3s, transform 0.3s';
    tooltip.style.transform = 'translateY(10px)';
    tooltip.style.whiteSpace = 'nowrap';
    tooltip.style.border = '2px solid #ffb7c5';
    
    mascot.appendChild(tooltip);
    document.body.appendChild(mascot);
    
    const messages = [
        'วันนี้มีสินค้าใหม่เข้า!',
        'ใช้โค้ด SAKURA10 ลด 10%!',
        'ยินดีต้อนรับสู่ Goods Japan',
        'เซรามิกญี่ปุ่นแท้ ราคาถูก!',
        'สนใจสอบถามได้นะคะ 🌸'
    ];
    
    mascot.addEventListener('mouseenter', () => {
        mascot.style.transform = 'scale(1.1) rotate(-5deg)';
    });
    
    mascot.addEventListener('mouseleave', () => {
        mascot.style.transform = 'scale(1) rotate(0deg)';
    });
    
    mascot.addEventListener('click', () => {
        mascot.style.transform = 'scale(0.9)';
        setTimeout(() => mascot.style.transform = 'scale(1.1) rotate(-5deg)', 150);
        
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        tooltip.textContent = randomMsg;
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(10px)';
        }, 3000);
    });
}

function initParallax() {
    const hero = document.querySelector('.hero-section');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrollPos = window.scrollY;
            if (scrollPos < window.innerHeight) {
                // Adjust background position
                hero.style.backgroundPositionY = `${scrollPos * 0.5}px`;
            }
        });
    }
}
