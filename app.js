// Mock Product Data Array for Module 2
const products = [
    {
        id: 1,
        title: "Classic White Sneakers",
        category: "Shoes",
        price: "$49.99",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80"
    },
    {
        id: 2,
        title: "Denim Jacket",
        category: "Clothing",
        price: "$69.99",
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80"
    },
    {
        id: 3,
        title: "Leather Wrist Watch",
        category: "Accessories",
        price: "$89.99",
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80"
    },
    {
        id: 4,
        title: "Running Sports Shoes",
        category: "Shoes",
        price: "$59.99",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"
    },
    {
        id: 5,
        title: "Casual Cotton T-Shirt",
        category: "Clothing",
        price: "$24.99",
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80"
    },
    {
        id: 6,
        title: "Stylish Sunglasses",
        category: "Accessories",
        price: "$34.99",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80"
    }
];

// Function to Render Products Dynamically into the Grid Container
function displayProducts(productList) {
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = ''; // Clear existing content

    productList.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="product-img">
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">${product.price}</p>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;

        productGrid.appendChild(productCard);
    });
}

// Initial Call when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    displayProducts(products);
});

// Dummy Add to Cart function for testing
function addToCart(productId) {
    alert(`Product ID ${productId} added to cart!`);
}