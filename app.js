// Global State
let allProducts = [];
let currentCategory = 'all';

// DOM Elements
const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const categoryButtons = document.querySelectorAll('.cat-btn');
const productCountText = document.getElementById('product-count');
const sectionTitle = document.getElementById('section-title');

// Fetch All Real Unique Products (No Repetition)
async function fetchProducts() {
    productGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px; font-size: 18px; color: #4b5563;">
        <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: #2563eb;"></i><br><br>Loading 100+ unique products from server...
    </div>`;

    try {
        // Fetching max unique items directly from public store database
        const response = await fetch('https://dummyjson.com/products?limit=194');
        const data = await response.json();
        
        // Save unique products
        allProducts = data.products;
        
        displayProducts(allProducts);
    } catch (error) {
        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ef4444; font-weight: 600;">Failed to load products. Please check your internet connection.</p>`;
    }
}

// Render Products Function
function displayProducts(products) {
    productGrid.innerHTML = '';
    productCountText.innerText = `${products.length} Unique Products`;

    if (products.length === 0) {
        productGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #6b7280;">
                <i class="fa-solid fa-box-open fa-3x" style="margin-bottom: 15px; color: #9ca3af;"></i>
                <h3 style="font-size: 20px; color: #374151;">No products found!</h3>
                <p style="margin-top: 5px;">Try searching with a different keyword or category.</p>
            </div>`;
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
                    <span>(${product.stock} left in stock)</span>
                </div>

                <div class="price-row">
                    <span class="current-price">$${product.price}</span>
                    <span class="old-price">$${originalPrice}</span>
                </div>

                <button class="add-to-cart-btn" onclick="addToCart(${product.id}, '${product.title.replace(/'/g, "\\'")}')">
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
        
        // Category Matching
        let matchesCategory = false;
        if (currentCategory === 'all') {
            matchesCategory = true;
        } else if (currentCategory === 'shirts') {
            matchesCategory = productCat.includes('shirt') || productCat.includes('tops') || productCat.includes('mens-shirts');
        } else if (currentCategory === 'shoes') {
            matchesCategory = productCat.includes('shoes');
        } else if (currentCategory === 'watches') {
            matchesCategory = productCat.includes('watches');
        } else {
            matchesCategory = productCat.includes(currentCategory.toLowerCase());
        }

        // Search Keyword Matching
        const matchesSearch = product.title.toLowerCase().includes(searchTerm) || 
                              productCat.includes(searchTerm) ||
                              (product.description && product.description.toLowerCase().includes(searchTerm));

        return matchesCategory && matchesSearch;
    });

    displayProducts(filtered);
}

// Category Buttons Click Handlers
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

// Search Input Listener
if (searchInput) {
    searchInput.addEventListener('input', filterAndSearch);
}

// Cart Functionality
function addToCart(id, title) {
    const cartCountElem = document.getElementById('cart-count');
    let currentCount = parseInt(cartCountElem.innerText || '0');
    cartCountElem.innerText = currentCount + 1;

    alert(`"${title}" added to your cart!`);
}

// Initial Call
document.addEventListener('DOMContentLoaded', fetchProducts);