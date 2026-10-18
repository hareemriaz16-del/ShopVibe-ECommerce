// Global State
let allProducts = [];
let cart = [];
let currentCategory = 'all';
let currentSelectedProduct = null;
let customReviews = {}; // Store reviews per product ID

// DOM Elements
const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const categoryButtons = document.querySelectorAll('.cat-btn');
const productCountText = document.getElementById('product-count');
const sectionTitle = document.getElementById('section-title');

// Product Detail Modal Elements
const productModal = document.getElementById('product-modal');
const closeDetailBtn = document.getElementById('close-detail-btn');
const detailImg = document.getElementById('detail-img');
const detailCategory = document.getElementById('detail-category');
const detailTitle = document.getElementById('detail-title');
const detailPrice = document.getElementById('detail-price');
const detailOldPrice = document.getElementById('detail-old-price');
const detailDiscount = document.getElementById('detail-discount');
const detailDesc = document.getElementById('detail-desc');
const detailUsage = document.getElementById('detail-usage');
const modalAddCartBtn = document.getElementById('modal-add-cart-btn');
const reviewsList = document.getElementById('reviews-list');
const reviewForm = document.getElementById('review-form');

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

// Form & Modal Elements
const shippingModal = document.getElementById('shipping-modal');
const closeShippingBtn = document.getElementById('close-shipping-btn');
const checkoutForm = document.getElementById('checkout-form');
const successModal = document.getElementById('success-modal');
const continueShoppingBtn = document.getElementById('continue-shopping-btn');
const cardFields = document.getElementById('card-fields');
const paymentRadios = document.querySelectorAll('input[name="payment"]');

// Usage guidelines helper based on category
function getUsageInstruction(category) {
    const cat = category.toLowerCase();
    if (cat.includes('beauty') || cat.includes('skin')) {
        return "Apply evenly on clean skin. For best results, use twice daily (morning & night). Perform a patch test before first use.";
    } else if (cat.includes('fragrance')) {
        return "Spray onto pulse points such as wrists, neck, and behind ears from 3-6 inches away. Do not rub skin after applying.";
    } else if (cat.includes('furniture')) {
        return "Unpack carefully. Assemble following the provided instruction manual. Wipe clean with a soft dry cloth.";
    } else if (cat.includes('grocer')) {
        return "Store in a cool, dry place. Keep sealed after opening. Refer to expiry date printed on package.";
    } else if (cat.includes('laptop') || cat.includes('electronic')) {
        return "Charge fully before first use. Connect to standard Wi-Fi/Power outlet. Keep away from direct water contact.";
    } else {
        return "Inspect item upon unboxing. Follow care instructions on garment label/packaging for cleaning and maintenance.";
    }
}

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

// Display Products Grid
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
            <div class="img-container" onclick="openProductModal(${product.id})">
                <img src="${product.thumbnail}" alt="${product.title}" class="product-img" loading="lazy">
            </div>
            <div class="product-info">
                <span class="category-tag">${product.category.replace('-', ' ')}</span>
                <h3 class="product-title" onclick="openProductModal(${product.id})" title="${product.title}">${product.title}</h3>
                
                <div class="rating" onclick="openProductModal(${product.id})">
                    <i class="fa-solid fa-star"></i> ${product.rating}
                    <span>(${product.stock} in stock)</span>
                </div>

                <div class="price-row" onclick="openProductModal(${product.id})">
                    <span class="current-price">$${product.price}</span>
                    <span class="old-price">$${originalPrice}</span>
                </div>

                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${product.id})">
                    <i class="fa-solid fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;

        productGrid.appendChild(card);
    });
}

// Open Product Details Modal
function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    currentSelectedProduct = product;
    const discountPercentage = Math.round(product.discountPercentage || 10);
    const originalPrice = (product.price / (1 - discountPercentage / 100)).toFixed(2);

    detailImg.src = product.thumbnail;
    detailCategory.innerText = product.category.replace('-', ' ');
    detailTitle.innerText = product.title;
    detailPrice.innerText = `$${product.price}`;
    detailOldPrice.innerText = `$${originalPrice}`;
    detailDiscount.innerText = `-${discountPercentage}% OFF`;
    detailDesc.innerText = product.description || "High quality product built for long-lasting durability and optimal daily performance.";
    detailUsage.innerText = getUsageInstruction(product.category);

    renderReviews(productId);
    productModal.classList.add('active');
}

function renderReviews(productId) {
    reviewsList.innerHTML = '';
    const reviews = customReviews[productId] || [
        { name: "Ayesha K.", rating: 5, comment: "Amazing product! Quality is top notch and delivery was fast." },
        { name: "Ali R.", rating: 4, comment: "Good value for money. Exactly as described." }
    ];

    reviews.forEach(r => {
        const stars = "⭐".repeat(r.rating);
        const item = document.createElement('div');
        item.classList.add('review-item');
        item.innerHTML = `
            <div class="review-header">
                <span>${r.name}</span>
                <span class="review-stars">${stars}</span>
            </div>
            <p>${r.comment}</p>
        `;
        reviewsList.appendChild(item);
    });
}

// Review Form Submit Handler
reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentSelectedProduct) return;

    const name = document.getElementById('reviewer-name').value;
    const rating = parseInt(document.getElementById('reviewer-rating').value);
    const comment = document.getElementById('reviewer-comment').value;

    const pId = currentSelectedProduct.id;
    if (!customReviews[pId]) {
        customReviews[pId] = [
            { name: "Ayesha K.", rating: 5, comment: "Amazing product! Quality is top notch and delivery was fast." },
            { name: "Ali R.", rating: 4, comment: "Good value for money. Exactly as described." }
        ];
    }

    customReviews[pId].unshift({ name, rating, comment });
    renderReviews(pId);
    reviewForm.reset();
});

modalAddCartBtn.addEventListener('click', () => {
    if (currentSelectedProduct) {
        addToCart(currentSelectedProduct.id);
    }
});

closeDetailBtn.addEventListener('click', () => {
    productModal.classList.remove('active');
});

// Filter & Search
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

// Cart Functions
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
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadge.innerText = totalCount;

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

// Radio Payment Toggle
paymentRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'card') {
            cardFields.classList.remove('hidden');
        } else {
            cardFields.classList.add('hidden');
        }
    });
});

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

checkoutBtn.addEventListener('click', () => {
    closeCartDrawer();
    shippingModal.classList.add('active');
});

closeShippingBtn.addEventListener('click', () => {
    shippingModal.classList.remove('active');
});

checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const payment = document.querySelector('input[name="payment"]:checked').value === 'cod' ? 'Cash on Delivery' : 'Card Payment';

    document.getElementById('out-name').innerText = name;
    document.getElementById('out-phone').innerText = phone;
    document.getElementById('out-payment').innerText = payment;
    document.getElementById('out-order-id').innerText = '#SV-' + Math.floor(1000 + Math.random() * 9000);

    shippingModal.classList.remove('active');
    successModal.classList.add('active');

    cart = [];
    updateCartUI();
    checkoutForm.reset();
    cardFields.classList.add('hidden');
});

continueShoppingBtn.addEventListener('click', () => {
    successModal.classList.remove('active');
});

document.addEventListener('DOMContentLoaded', fetchProducts);