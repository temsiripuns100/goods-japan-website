// sakura.js - Cherry blossom falling animation

document.addEventListener('DOMContentLoaded', () => {
    initSakura();
});

function createPetal(container) {
    const petal = document.createElement('div');
    petal.classList.add('sakura-petal');
    
    // Randomize properties
    const size = Math.random() * 10 + 10; // 10px to 20px
    const startX = Math.random() * window.innerWidth;
    const duration = Math.random() * 5 + 5; // 5s to 10s
    const opacity = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
    const isPink = Math.random() > 0.3; // 70% chance of pink
    const isRound = Math.random() > 0.5; // 50% chance of round
    
    petal.style.width = `${size}px`;
    petal.style.height = isRound ? `${size}px` : `${size * 1.5}px`;
    petal.style.left = `${startX}px`;
    petal.style.top = `-20px`;
    petal.style.opacity = opacity;
    petal.style.backgroundColor = isPink ? '#ffb7c5' : '#ffffff';
    petal.style.borderRadius = isRound ? '50%' : '50% 0 50% 0';
    petal.style.position = 'absolute';
    petal.style.transform = `rotate(${Math.random() * 360}deg)`;
    petal.style.pointerEvents = 'none';
    petal.style.zIndex = '999';
    petal.style.boxShadow = '0 0 5px rgba(0,0,0,0.1)';
    
    // Animation via Web Animations API for better performance and control
    const animation = petal.animate([
        { transform: `translate3d(0, 0, 0) rotate(0deg)` },
        { transform: `translate3d(${Math.random() * 200 - 100}px, ${window.innerHeight + 50}px, 0) rotate(${Math.random() * 360 + 360}deg)` }
    ], {
        duration: duration * 1000,
        easing: 'linear'
    });
    
    container.appendChild(petal);
    
    // Remove petal after animation finishes
    animation.onfinish = () => {
        petal.remove();
    };
}

function initSakura() {
    let container = document.querySelector('.sakura-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'sakura-container';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.overflow = 'hidden';
        container.style.zIndex = '998';
        document.body.appendChild(container);
    }
    
    // Initial batch
    for (let i = 0; i < 15; i++) {
        setTimeout(() => createPetal(container), Math.random() * 3000);
    }
    
    // Spawn new ones periodically
    setInterval(() => {
        for (let i = 0; i < 5; i++) {
            createPetal(container);
        }
    }, 3000);
}
