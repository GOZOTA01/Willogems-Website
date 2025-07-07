// Quotation Page JavaScript

// Global variables
let cart = [];
let products = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeProducts();
    setupEventListeners();
    loadCartFromStorage();
    updateCartDisplay();
});

// Initialize products data
function initializeProducts() {
    const productCards = document.querySelectorAll('.product-card');
    products = Array.from(productCards).map(card => ({
        id: card.dataset.name,
        name: card.dataset.name,
        category: card.dataset.category,
        price: parseFloat(card.dataset.price),
        image: card.querySelector('.product-image img').src
    }));
}

// Setup event listeners
function setupEventListeners() {
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.addEventListener('change', filterProducts);

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', filterProducts);

    // Search button
    const searchButton = document.querySelector('.search-bar button');
    searchButton.addEventListener('click', filterProducts);

    // Quote form submission
    const quoteForm = document.getElementById('quoteForm');
    quoteForm.addEventListener('submit', handleQuoteSubmission);

    // Modal close on outside click
    const modal = document.getElementById('quoteModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
}

// Filter products based on category and search
function filterProducts() {
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    const selectedCategory = categoryFilter.value;
    const searchTerm = searchInput.value.toLowerCase();

    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        const category = card.dataset.category;
        const name = card.dataset.name.toLowerCase();
        const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
        const matchesSearch = name.includes(searchTerm);

        if (matchesCategory && matchesSearch) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.3s ease-out';
        } else {
            card.style.display = 'none';
        }
    });
}

// Add product to quote
function addToQuote(button) {
    const productCard = button.closest('.product-card');
    const productName = productCard.dataset.name;
    const productPrice = parseFloat(productCard.dataset.price);
    const productImage = productCard.querySelector('.product-image img').src;

    // Check if product already exists in cart
    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity += 1;
        existingItem.total = existingItem.quantity * existingItem.price;
    } else {
        cart.push({
            name: productName,
            price: productPrice,
            quantity: 1,
            total: productPrice,
            image: productImage
        });
    }

    // Visual feedback
    button.innerHTML = '<i class="fas fa-check"></i> Added!';
    button.style.background = '#28a745';
    button.disabled = true;

    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-plus"></i> Add to Quote';
        button.style.background = '';
        button.disabled = false;
    }, 1500);

    saveCartToStorage();
    updateCartDisplay();
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    const requestQuoteBtn = document.getElementById('requestQuoteBtn');

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>No items in your quote yet</p>
                <p>Select products from the left to build your quote</p>
            </div>
        `;
        cartSummary.style.display = 'none';
        requestQuoteBtn.disabled = true;
        return;
    }

    // Display cart items
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-name="${item.name}">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateQuantity('${item.name}', -1)">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" 
                       min="1" onchange="updateQuantityInput('${item.name}', this.value)">
                <button class="quantity-btn" onclick="updateQuantity('${item.name}', 1)">+</button>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart('${item.name}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    // Update summary
    updateCartSummary();
    cartSummary.style.display = 'block';
    requestQuoteBtn.disabled = false;
}

// Update quantity with buttons
function updateQuantity(productName, change) {
    const item = cart.find(item => item.name === productName);
    if (item) {
        const newQuantity = item.quantity + change;
        if (newQuantity >= 1) {
            item.quantity = newQuantity;
            item.total = item.quantity * item.price;
            saveCartToStorage();
            updateCartDisplay();
        }
    }
}

// Update quantity with input
function updateQuantityInput(productName, newQuantity) {
    const item = cart.find(item => item.name === productName);
    if (item && newQuantity >= 1) {
        item.quantity = parseInt(newQuantity);
        item.total = item.quantity * item.price;
        saveCartToStorage();
        updateCartDisplay();
    }
}

// Remove item from cart
function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    saveCartToStorage();
    updateCartDisplay();
}

// Clear entire cart
function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('Are you sure you want to clear all items from your quote?')) {
        cart = [];
        saveCartToStorage();
        updateCartDisplay();
    }
}

// Update cart summary
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.15; // 15% tax
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('willogemsQuoteCart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('willogemsQuoteCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Request quote modal
function requestQuote() {
    if (cart.length === 0) {
        alert('Please add some products to your quote first.');
        return;
    }
    
    const modal = document.getElementById('quoteModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('quoteModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('quoteForm').reset();
}

// Handle quote form submission
async function handleQuoteSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const quoteData = {
        customer: {
            name: formData.get('customerName'),
            email: formData.get('customerEmail'),
            phone: formData.get('customerPhone')
        },
        project: {
            description: formData.get('projectDescription'),
            deliveryAddress: formData.get('deliveryAddress'),
            urgency: formData.get('urgency')
        },
        items: cart,
        summary: {
            subtotal: cart.reduce((sum, item) => sum + item.total, 0),
            tax: cart.reduce((sum, item) => sum + item.total, 0) * 0.15,
            total: cart.reduce((sum, item) => sum + item.total, 0) * 1.15
        },
        timestamp: new Date().toISOString()
    };

    const submitBtn = e.target.querySelector('.submit-quote-btn');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // Send to backend (you'll need to implement this endpoint)
        const response = await fetch('/api/quote-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(quoteData)
        });

        if (response.ok) {
            // Success
            showNotification('Quote request sent successfully! We\'ll get back to you soon.', 'success');
            closeModal();
            clearCart();
        } else {
            throw new Error('Failed to send quote request');
        }
    } catch (error) {
        console.error('Error sending quote request:', error);
        showNotification('Failed to send quote request. Please try again or contact us directly.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;

    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
    `;

    notification.querySelector('button').style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        margin-left: auto;
        padding: 0;
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Export cart data (for debugging)
function exportCartData() {
    const data = {
        cart: cart,
        summary: {
            subtotal: cart.reduce((sum, item) => sum + item.total, 0),
            tax: cart.reduce((sum, item) => sum + item.total, 0) * 0.15,
            total: cart.reduce((sum, item) => sum + item.total, 0) * 1.15
        }
    };
    console.log('Cart Data:', data);
    return data;
}

// Add smooth scrolling for better UX
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Add loading states for better UX
function showLoading(element) {
    element.classList.add('loading');
    element.disabled = true;
}

function hideLoading(element) {
    element.classList.remove('loading');
    element.disabled = false;
}

// Add keyboard navigation for accessibility
document.addEventListener('keydown', function(e) {
    // Tab navigation for cart items
    if (e.key === 'Tab') {
        const cartItems = document.querySelectorAll('.cart-item');
        cartItems.forEach(item => {
            item.setAttribute('tabindex', '0');
        });
    }
});

// Add touch support for mobile
if ('ontouchstart' in window) {
    document.addEventListener('DOMContentLoaded', function() {
        // Add touch feedback for buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            
            button.addEventListener('touchend', function() {
                this.style.transform = '';
            });
        });
    });
} 