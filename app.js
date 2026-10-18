// Global State
let allProducts = [];
let cart = [];
let currentCategory = 'all';

// DOM Elements
const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const categoryButtons = document.querySelectorAll('.cat-btn');
const productCountText = document.getElementById('product-count');
const sectionTitle = document.getElementById('section-title');

// Cart Drawer Elements
const openCartBtn = document.getElementById('open-cart-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountBadge = document.getElementById('cart-count');
const cartSubtotalElem = document.getElementById('cart-subtotal');
const cartTotalElem = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

// Modal Elements
const checkoutModal = document.getElementById('checkout-modal');
const closeModalBtn = document.getElementById('close-modal-btn');

// Fetch Products from API
async function fetchProducts() {
    productGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px; font-size: 18px; color: #4b5563;">
        <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: #2563eb;"></i><br><br>Loading products...
    </div>`;

    try {
        const response = await fetch('https://dummyjson.com/products?limit=194');
        const data = await response.json();
        allProducts = data.products;
        displayProducts(allProducts);
    } catch (error) {
        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">Failed to load products.</p>`;
    }
}

// Display Product Cards
function displayProducts(products) {
    productGrid.innerHTML = '';
    productCountText.innerText = `${products.length} Items Available`;

    if (products.length === 0) {
        productGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #6b7280;">No products found matching your search.</div>`;
        return;
    }

    products.forEach(product => {
        const discountPercentage = Math.round(product.discountPercentage || 10);
        const originalPrice = (product.price / (1 - discountPercentage / 100)).toFixed(2);

        const card = document.createElement('div');
        card.classList.add('product-card');

        card.innerHTML = `
            <span class="badge-discount">-${discountPercentage}% OFF</span>
            <div class="img-container">
                <img src="${product.thumbnail}" alt="${product.title}" class="product-img" loading="lazy">
            </div>
            <div class="product-info">
                <span class="category-tag">${product.category.replace('-', ' ')}</span>
                <h3 class="product-title" title="${product.title}">${product.title}</h3>
                
                <div class="rating">
                    <i class="fa-solid fa-star"></i> ${product.rating}
                    <span>(${product.stock} in stock)</span>
                </div>

                <div class="price-row">
                    <span class="current-price">$${product.price}</span>
                    <span class="old-price">$${originalPrice}</span>
                </div>

                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    <i class="fa-solid fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;

        productGrid.appendChild(card);
    });
}

// Filter and Search Logic
function filterAndSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    const filtered = allProducts.filter(product => {
        const productCat = product.category.toLowerCase();
        
        let matchesCategory = false;
        if (currentCategory === 'all') {
            matchesCategory = true;
        } else if (currentCategory === 'shirts') {
            matchesCategory = productCat.includes('shirt') || productCat.includes('tops');
        } else if (currentCategory === 'shoes') {
            matchesCategory = productCat.includes('shoes');
        } else if (currentCategory === 'watches') {
            matchesCategory = productCat.includes('watches');
        } else {
            matchesCategory = productCat.includes(currentCategory.toLowerCase());
        }

        const matchesSearch = product.title.toLowerCase().includes(searchTerm) || 
                              productCat.includes(searchTerm) ||
                              (product.description && product.description.toLowerCase().includes(searchTerm));

        return matchesCategory && matchesSearch;
    });

    displayProducts(filtered);
}

// CART MANAGEMENT FUNCTIONS (Module 4)
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    openCartDrawer();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
    }
    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function updateCartUI() {
    // Total Count
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadge.innerText = totalCount;

    // Render Items
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="empty-cart-msg">Your cart is empty!</p>`;
        checkoutBtn.disabled = true;
    } else {
        checkoutBtn.disabled = false;
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <img src="${item.thumbnail}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }

    // Price Calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartSubtotalElem.innerText = `$${subtotal.toFixed(2)}`;
    cartTotalElem.innerText = `$${subtotal.toFixed(2)}`;
}

// Drawer Controls
function openCartDrawer() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('active');
}

function closeCartDrawer() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('active');
}

// Event Listeners
categoryButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        const targetBtn = e.target.closest('.cat-btn') || e.target;
        targetBtn.classList.add('active');

        currentCategory = targetBtn.getAttribute('data-category');
        sectionTitle.innerText = targetBtn.innerText;
        filterAndSearch();
    });
});

if (searchInput) {
    searchInput.addEventListener('input', filterAndSearch);
}

openCartBtn.addEventListener('click', openCartDrawer);
closeCartBtn.addEventListener('click', closeCartDrawer);
cartOverlay.addEventListener('click', closeCartDrawer);

// Checkout Handling
checkoutBtn.addEventListener('click', () => {
    cart = [];
    updateCartUI();
    closeCartDrawer();
    checkoutModal.classList.add('active');
});

closeModalBtn.addEventListener('click', () => {
    checkoutModal.classList.remove('active');
});

// App Initialization
document.addEventListener('DOMContentLoaded', fetchProducts);