// products.js - Product loading, filtering, searching, sorting

let allProducts = [];
let currentCategory = 'all';
let currentSort = 'newest';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
    // Determine context (homepage or shop page)
    const shopContainer = document.getElementById('product-grid');
    const homeContainer = document.getElementById('new-arrivals');
    
    if (shopContainer) {
        initProducts(shopContainer.id);
    } else if (homeContainer) {
        loadProducts(homeContainer.id, 8); // Load 8 products for homepage
    }
});

async function fetchProducts() {
    try {
        const response = await fetch('data/products.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.products;
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

async function loadProducts(containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '<div class="loading">กำลังโหลดสินค้า...</div>';
    
    if (allProducts.length === 0) {
        allProducts = await fetchProducts();
    }
    
    let displayProducts = [...allProducts];
    
    if (limit) {
        // Sort by newest first, then limit
        displayProducts.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
        displayProducts = displayProducts.slice(0, limit);
    }
    
    renderProductsList(container, displayProducts);
}

function renderProductCard(product) {
    let badgesHtml = '';
    if (product.isNew && product.status !== 'sold') {
        badgesHtml += '<span class="badge badge-new">มาใหม่</span>';
    }
    if (product.isSale && product.status !== 'sold') {
        badgesHtml += '<span class="badge badge-sale">ลดราคา</span>';
    }
    if (product.status === 'sold') {
        badgesHtml += '<span class="badge badge-sold">ขายแล้ว</span>';
    }
    
    let priceHtml = '';
    if (product.isSale && product.originalPrice) {
        priceHtml = `
            <span class="price-current">฿${product.price.toLocaleString()}</span>
            <span class="price-original" style="text-decoration: line-through; color: #888; font-size: 0.9em;">฿${product.originalPrice.toLocaleString()}</span>
        `;
    } else {
        priceHtml = `<span class="price-current">฿${product.price.toLocaleString()}</span>`;
    }
    
    const categoryNames = {
        ceramics: 'เซรามิก',
        kitchen: 'เครื่องครัว',
        collectibles: 'ของสะสม',
        camera: 'กล้อง',
        stationery: 'เครื่องเขียน',
        decor: 'ของตกแต่ง'
    };
    const catName = categoryNames[product.category] || product.category;

    return `
        <div class="product-card ${product.status === 'sold' ? 'sold-out' : ''}" data-id="${product.id}">
            <div class="product-image-wrap">
                ${badgesHtml}
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
            </div>
            <div class="product-info">
                <div class="product-category tag">${catName}</div>
                <h3 class="product-name-th">${product.name}</h3>
                <p class="product-name-jp">${product.nameJp}</p>
                <div class="product-price">${priceHtml}</div>
                <button class="btn btn-view" ${product.status === 'sold' ? 'disabled' : ''}>
                    ${product.status === 'sold' ? 'สินค้าหมด' : 'ดูรายละเอียด'}
                </button>
            </div>
        </div>
    `;
}

function renderProductsList(container, products) {
    if (products.length === 0) {
        container.innerHTML = '<div class="no-products">ไม่พบสินค้าที่ตรงกับเงื่อนไข</div>';
        return;
    }
    
    const html = products.map(p => renderProductCard(p)).join('');
    container.innerHTML = html;
}

function applyFiltersAndSort() {
    const container = document.getElementById('product-grid');
    if (!container) return;
    
    let filtered = [...allProducts];
    
    // Category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }
    
    // Search
    if (currentSearch) {
        const query = currentSearch.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.nameJp.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
    }
    
    // Sort
    switch (currentSort) {
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'latest':
            filtered.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
            break;
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name, 'th'));
            break;
    }
    
    renderProductsList(container, filtered);
}

function initProductFilters() {
    // Category Buttons
    const catButtons = document.querySelectorAll('.filter-btn');
    catButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            catButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category || 'all';
            applyFiltersAndSort();
        });
    });
    
    // Search Input
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value;
            applyFiltersAndSort();
        });
    }
    
    // Sort Dropdown
    const sortSelect = document.querySelector('.sort-select select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFiltersAndSort();
        });
    }
}

async function initProducts(containerId) {
    allProducts = await fetchProducts();
    applyFiltersAndSort();
    initProductFilters();
}
