// Main Application JavaScript
class InvoiceCryptoApp {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.portfolio = JSON.parse(localStorage.getItem('portfolio')) || [];
        this.user = JSON.parse(localStorage.getItem('user')) || this.createDefaultUser();
        this.invoiceCount = parseInt(localStorage.getItem('invoiceCount')) || 0;
        this.init();
    }

    createDefaultUser() {
        return {
            name: "Free User",
            email: "",
            plan: "free",
            subscription: null,
            features: {
                maxInvoices: 5,
                multiCurrency: false,
                recurringInvoices: false,
                taxCalculation: false,
                clientManagement: false,
                advancedAnalytics: false
            }
        };
    }

    init() {
        this.applyTheme();
        this.setupEventListeners();
        this.loadCryptoData();
        this.updatePortfolio();
        this.updateUIForPlan();
        this.updateInvoiceLimitDisplay();
    }

    applyTheme() {
        document.body.className = `${this.currentTheme}-theme`;
        this.updateThemeToggle();
    }

    updateThemeToggle() {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.textContent = this.currentTheme === 'dark' ? '🌙' : '☀️';
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.currentTheme);
        this.applyTheme();
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                showSection(target);
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Recurring invoice toggle
        const recurringCheckbox = document.getElementById('recurringInvoice');
        const recurringFrequency = document.getElementById('recurringFrequency');
        if (recurringCheckbox && recurringFrequency) {
            recurringCheckbox.addEventListener('change', (e) => {
                recurringFrequency.style.display = e.target.checked ? 'block' : 'none';
            });
        }
    }

    updateUIForPlan() {
        const isPro = this.user.plan === 'pro';
        
        // Update header plan badge
        this.updateHeaderPlan();
        
        // Show/hide pro features
        this.toggleProFeatures(isPro);
        
        // Update membership section
        this.updateMembershipSection();
        
        // Update invoice limit display
        this.updateInvoiceLimitDisplay();
    }

    updateHeaderPlan() {
        const userPlan = document.getElementById('userPlan');
        if (userPlan) {
            userPlan.textContent = this.user.plan === 'pro' ? 'PRO' : 'FREE';
            userPlan.className = `user-plan ${this.user.plan}`;
        }
    }

    toggleProFeatures(isPro) {
        const proElements = document.querySelectorAll('.pro-feature');
        proElements.forEach(element => {
            if (isPro) {
                element.classList.remove('pro-feature-locked');
            } else {
                element.classList.add('pro-feature-locked');
            }
        });

        // Enable/disable pro inputs
        const proInputs = document.querySelectorAll('.pro-feature input, .pro-feature select');
        proInputs.forEach(input => {
            input.disabled = !isPro;
        });
    }

    updateMembershipSection() {
        const freePlanBtn = document.getElementById('freePlanBtn');
        const proPlanBtn = document.getElementById('proPlanBtn');
        
        if (this.user.plan === 'pro') {
            if (freePlanBtn) freePlanBtn.textContent = 'Free Plan';
            if (proPlanBtn) {
                proPlanBtn.textContent = 'Manage Subscription';
                proPlanBtn.onclick = () => this.showSubscriptionManagement();
            }
        } else {
            if (freePlanBtn) freePlanBtn.textContent = 'Current Plan';
            if (proPlanBtn) {
                proPlanBtn.textContent = 'Upgrade to Pro';
                proPlanBtn.onclick = () => this.showPaymentForm();
            }
        }
    }

    updateInvoiceLimitDisplay() {
        const invoiceLimit = document.getElementById('invoiceLimit');
        const invoiceCount = document.getElementById('invoiceCount');
        
        if (invoiceLimit) {
            if (this.user.plan === 'pro') {
                invoiceLimit.textContent = 'Unlimited invoices (Pro)';
                invoiceLimit.style.color = 'var(--secondary-color)';
            } else {
                invoiceLimit.textContent = `Monthly invoices: ${this.invoiceCount}/${this.user.features.maxInvoices}`;
                invoiceLimit.style.color = this.invoiceCount >= this.user.features.maxInvoices ? 
                    'var(--danger-color)' : 'var(--text-primary)';
            }
        }
        
        if (invoiceCount) {
            invoiceCount.textContent = this.invoiceCount;
        }
    }

    showPaymentForm() {
        document.getElementById('paymentForm').style.display = 'block';
        document.querySelector('.pricing-grid').style.display = 'none';
        document.getElementById('subscriptionManagement').style.display = 'none';
    }

    hidePaymentForm() {
        document.getElementById('paymentForm').style.display = 'none';
        document.querySelector('.pricing-grid').style.display = 'grid';
    }

    async processPayment() {
        const cardNumber = document.getElementById('cardNumber').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        const cardName = document.getElementById('cardName').value;

        // Basic validation
        if (!this.validatePaymentForm(cardNumber, expiryDate, cvv, cardName)) {
            this.showToast('Please fill all payment details correctly', 'error');
            return;
        }

        // Show loading
        this.showPaymentLoading(true);

        try {
            // Simulate API call to payment processor
            await this.simulatePaymentProcessing();
            
            // Upgrade user to pro
            this.upgradeToPro();
            
            this.showToast('🎉 Welcome to Pro! Advanced features unlocked.', 'success');
            this.hidePaymentForm();
            
        } catch (error) {
            this.showToast('Payment failed. Please try again.', 'error');
        } finally {
            this.showPaymentLoading(false);
        }
    }

    validatePaymentForm(cardNumber, expiryDate, cvv, cardName) {
        if (!cardNumber || !expiryDate || !cvv || !cardName) return false;
        
        // Basic card number validation
        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        if (cleanCardNumber.length !== 16 || isNaN(cleanCardNumber)) return false;
        
        // Basic expiry date validation
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) return false;
        
        // Basic CVV validation
        if (cvv.length !== 3 || isNaN(cvv)) return false;
        
        return true;
    }

    simulatePaymentProcessing() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 90% success rate
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('Payment processing failed'));
                }
            }, 2000);
        });
    }

    upgradeToPro() {
        this.user.plan = 'pro';
        this.user.subscription = {
            plan: 'pro',
            price: 9,
            currency: 'USD',
            status: 'active',
            startDate: new Date().toISOString(),
            nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        this.user.features = {
            maxInvoices: Infinity,
            multiCurrency: true,
            recurringInvoices: true,
            taxCalculation: true,
            clientManagement: true,
            advancedAnalytics: true
        };

        localStorage.setItem('user', JSON.stringify(this.user));
        this.updateUIForPlan();
        
        // Track conversion
        this.trackEvent('pro_subscription_started');
    }

    showSubscriptionManagement() {
        document.getElementById('subscriptionManagement').style.display = 'block';
        document.querySelector('.pricing-grid').style.display = 'none';
        document.getElementById('paymentForm').style.display = 'none';
        
        // Update next billing date
        const nextBillingDate = document.getElementById('nextBillingDate');
        if (nextBillingDate && this.user.subscription) {
            nextBillingDate.textContent = new Date(this.user.subscription.nextBilling).toLocaleDateString();
        }
    }

    hideSubscriptionManagement() {
        document.getElementById('subscriptionManagement').style.display = 'none';
        document.querySelector('.pricing-grid').style.display = 'grid';
    }

    cancelSubscription() {
        if (confirm('Are you sure you want to cancel your Pro subscription? You\'ll lose access to advanced features at the end of your billing period.')) {
            this.user.plan = 'free';
            this.user.subscription.status = 'cancelled';
            this.user.features = this.createDefaultUser().features;
            
            localStorage.setItem('user', JSON.stringify(this.user));
            this.updateUIForPlan();
            this.hideSubscriptionManagement();
            
            this.showToast('Subscription cancelled. You have access until the end of your billing period.', 'warning');
            this.trackEvent('pro_subscription_cancelled');
        }
    }

    showPaymentLoading(show) {
        const paymentText = document.getElementById('paymentText');
        const paymentLoading = document.getElementById('paymentLoading');
        
        if (show) {
            paymentText.style.display = 'none';
            paymentLoading.style.display = 'inline';
        } else {
            paymentText.style.display = 'inline';
            paymentLoading.style.display = 'none';
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    checkInvoiceLimit() {
        if (this.user.plan === 'free' && this.invoiceCount >= this.user.features.maxInvoices) {
            this.showToast(`You've reached your monthly invoice limit (${this.user.features.maxInvoices}). Upgrade to Pro for unlimited invoices.`, 'error');
            showSection('membership');
            return false;
        }
        return true;
    }

    trackEvent(eventName, properties = {}) {
        // In a real app, this would send to analytics service
        console.log('Event:', eventName, properties);
        
        // Store in localStorage for demo
        const analytics = JSON.parse(localStorage.getItem('analytics')) || [];
        analytics.push({
            event: eventName,
            timestamp: new Date().toISOString(),
            properties: properties
        });
        localStorage.setItem('analytics', JSON.stringify(analytics));
    }

    // Enhanced invoice generation with pro features
    generateInvoice() {
        if (!this.checkInvoiceLimit()) {
            return;
        }

        const clientName = document.getElementById('clientName').value;
        const amount = document.getElementById('invoiceAmount').value;
        const description = document.getElementById('invoiceDescription').value;

        if (!clientName || !amount) {
            this.showToast('Please fill in client name and amount', 'error');
            return;
        }

        // Increment invoice count for free users
        if (this.user.plan === 'free') {
            this.invoiceCount++;
            localStorage.setItem('invoiceCount', this.invoiceCount.toString());
            this.updateInvoiceLimitDisplay();
        }

        // Generate preview with enhanced features for pro users
        this.generateInvoicePreview(clientName, amount, description);
        
        this.trackEvent('invoice_created', {
            plan: this.user.plan,
            amount: amount
        });
    }

    generateInvoicePreview(clientName, amount, description) {
        document.getElementById('previewClient').textContent = clientName;
        document.getElementById('previewAmount').textContent = parseFloat(amount).toFixed(2);
        document.getElementById('previewDescription').textContent = description;
        document.getElementById('previewNumber').textContent = 'INV-' + Date.now().toString().slice(-6);
        document.getElementById('previewDate').textContent = new Date().toLocaleDateString();

        // Show pro features in preview if available
        const proFeaturesPreview = document.getElementById('proFeaturesPreview');
        proFeaturesPreview.innerHTML = '';
        
        if (this.user.plan === 'pro') {
            this.addProFeaturesToPreview(amount);
        }

        document.getElementById('invoicePreview').style.display = 'block';
    }

    addProFeaturesToPreview(amount) {
        const proFeaturesPreview = document.getElementById('proFeaturesPreview');
        
        let proFeaturesHtml = '';
        
        // Tax calculation
        const taxRate = document.getElementById('taxRate') ? parseFloat(document.getElementById('taxRate').value) : 0;
        if (taxRate > 0) {
            const taxAmount = (parseFloat(amount) * taxRate / 100).toFixed(2);
            const total = (parseFloat(amount) + parseFloat(taxAmount)).toFixed(2);
            proFeaturesHtml += `
                <p><strong>Tax (${taxRate}%):</strong> $${taxAmount}</p>
                <p><strong>Total:</strong> $${total}</p>
            `;
        }
        
        // Currency
        const currency = document.getElementById('invoiceCurrency') ? document.getElementById('invoiceCurrency').value : 'USD';
        if (currency !== 'USD') {
            proFeaturesHtml += `<p><strong>Currency:</strong> ${currency}</p>`;
        }
        
        // Recurring invoice
        const isRecurring = document.getElementById('recurringInvoice') ? document.getElementById('recurringInvoice').checked : false;
        if (isRecurring) {
            const frequency = document.getElementById('recurringFrequency') ? document.getElementById('recurringFrequency').value : 'monthly';
            proFeaturesHtml += `<p><strong>Recurring:</strong> ${frequency.charAt(0).toUpperCase() + frequency.slice(1)}</p>`;
        }
        
        proFeaturesPreview.innerHTML = proFeaturesHtml;
    }

    downloadInvoice() {
        this.showToast('Invoice PDF downloaded successfully!', 'success');
        // In a real app, this would generate and download a PDF
    }

    // Crypto data loading
    async loadCryptoData() {
        try {
            // Using CoinGecko API for demo
            const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false');
            const data = await response.json();
            this.displayCryptoData(data);
        } catch (error) {
            console.error('Error loading crypto data:', error);
            // Fallback to mock data if API fails
            this.displayMockCryptoData();
        }
    }

    displayCryptoData(cryptoData) {
        const cryptoGrid = document.getElementById('cryptoGrid');
        if (!cryptoGrid) return;

        cryptoGrid.innerHTML = cryptoData.map(crypto => `
            <div class="crypto-card">
                <div class="crypto-header">
                    <div class="crypto-icon">${crypto.symbol.toUpperCase().charAt(0)}</div>
                    <div class="crypto-names">
                        <h3>${crypto.name}</h3>
                        <span class="crypto-symbol">${crypto.symbol.toUpperCase()}</span>
                    </div>
                    ${this.user.plan === 'pro' ? '<span class="pro-badge">PRO</span>' : ''}
                </div>
                <div class="crypto-price">
                    <div class="price">$${crypto.current_price.toLocaleString()}</div>
                    <div class="price-change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                        ${crypto.price_change_percentage_24h >= 0 ? '+' : ''}${crypto.price_change_percentage_24h?.toFixed(2) || '0.00'}%
                    </div>
                    ${this.user.plan === 'pro' ? `
                        <div class="crypto-stats">
                            <small>24h High: $${crypto.high_24h?.toLocaleString() || 'N/A'}</small>
                            <small>24h Low: $${crypto.low_24h?.toLocaleString() || 'N/A'}</small>
                        </div>
                    ` : ''}
                </div>
                <button class="btn btn-outline" onclick="addToPortfolio('${crypto.id}', '${crypto.name}', '${crypto.symbol}', ${crypto.current_price})" style="margin-top: 1rem; width: 100%;">
                    Add to Portfolio
                </button>
            </div>
        `).join('');
    }

    displayMockCryptoData() {
        const cryptoGrid = document.getElementById('cryptoGrid');
        if (!cryptoGrid) return;

        const mockData = [
            { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', current_price: 45218.75, price_change_percentage_24h: 2.34, high_24h: 45500, low_24h: 44800 },
            { id: 'ethereum', name: 'Ethereum', symbol: 'eth', current_price: 2415.67, price_change_percentage_24h: 1.56, high_24h: 2450, low_24h: 2380 },
            { id: 'cardano', name: 'Cardano', symbol: 'ada', current_price: 0.5123, price_change_percentage_24h: -0.78, high_24h: 0.52, low_24h: 0.50 },
            { id: 'solana', name: 'Solana', symbol: 'sol', current_price: 98.45, price_change_percentage_24h: 5.23, high_24h: 100, low_24h: 95 },
            { id: 'binancecoin', name: 'Binance Coin', symbol: 'bnb', current_price: 312.89, price_change_percentage_24h: 0.92, high_24h: 315, low_24h: 310 }
        ];

        cryptoGrid.innerHTML = mockData.map(crypto => `
            <div class="crypto-card">
                <div class="crypto-header">
                    <div class="crypto-icon">${crypto.symbol.toUpperCase().charAt(0)}</div>
                    <div class="crypto-names">
                        <h3>${crypto.name}</h3>
                        <span class="crypto-symbol">${crypto.symbol.toUpperCase()}</span>
                    </div>
                    ${this.user.plan === 'pro' ? '<span class="pro-badge">PRO</span>' : ''}
                </div>
                <div class="crypto-price">
                    <div class="price">$${crypto.current_price.toLocaleString()}</div>
                    <div class="price-change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                        ${crypto.price_change_percentage_24h >= 0 ? '+' : ''}${crypto.price_change_percentage_24h.toFixed(2)}%
                    </div>
                    ${this.user.plan === 'pro' ? `
                        <div class="crypto-stats">
                            <small>24h High: $${crypto.high_24h.toLocaleString()}</small>
                            <small>24h Low: $${crypto.low_24h.toLocaleString()}</small>
                        </div>
                    ` : ''}
                </div>
                <button class="btn btn-outline" onclick="addToPortfolio('${crypto.id}', '${crypto.name}', '${crypto.symbol}', ${crypto.current_price})" style="margin-top: 1rem; width: 100%;">
                    Add to Portfolio
                </button>
            </div>
        `).join('');
    }

    // Portfolio management
    updatePortfolio() {
        const portfolioList = document.getElementById('portfolioList');
        const totalPortfolioValue = document.getElementById('totalPortfolioValue');
        const portfolioValue = document.getElementById('portfolioValue');
        
        if (!portfolioList) return;

        if (this.portfolio.length === 0) {
            portfolioList.innerHTML = `
                <div class="empty-portfolio">
                    <p>No cryptocurrencies in portfolio</p>
                    <button class="btn btn-outline" onclick="showSection('crypto')">Browse Crypto</button>
                </div>
            `;
            if (totalPortfolioValue) totalPortfolioValue.textContent = '$0.00';
            if (portfolioValue) portfolioValue.textContent = '$0';
            return;
        }

        let totalValue = 0;
        portfolioList.innerHTML = this.portfolio.map(item => {
            const value = item.amount * item.currentPrice;
            totalValue += value;
            
            return `
                <div class="crypto-card">
                    <div class="crypto-header">
                        <div class="crypto-icon">${item.symbol.toUpperCase().charAt(0)}</div>
                        <div class="crypto-names">
                            <h3>${item.name}</h3>
                            <span class="crypto-symbol">${item.symbol.toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="crypto-price">
                        <div class="price">${item.amount} ${item.symbol.toUpperCase()}</div>
                        <div class="price">$${value.toFixed(2)}</div>
                    </div>
                    <button class="btn btn-outline" onclick="removeFromPortfolio('${item.id}')" style="margin-top: 1rem; width: 100%;">
                        Remove
                    </button>
                </div>
            `;
        }).join('');

        if (totalPortfolioValue) {
            totalPortfolioValue.textContent = `$${totalValue.toFixed(2)}`;
        }
        if (portfolioValue) {
            portfolioValue.textContent = `$${totalValue.toFixed(0)}`;
        }
    }
}

// Global functions for HTML onclick events
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
}

function generateInvoice() {
    window.app.generateInvoice();
}

function downloadInvoice() {
    window.app.downloadInvoice();
}

function filterCrypto() {
    const searchTerm = document.getElementById('cryptoSearch').value.toLowerCase();
    const cryptoCards = document.querySelectorAll('.crypto-card');
    
    cryptoCards.forEach(card => {
        const cryptoName = card.querySelector('h3').textContent.toLowerCase();
        const cryptoSymbol = card.querySelector('.crypto-symbol').textContent.toLowerCase();
        
        if (cryptoName.includes(searchTerm) || cryptoSymbol.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function addToPortfolio(id, name, symbol, price) {
    const amount = prompt(`How much ${symbol.toUpperCase()} do you want to add?`);
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        const app = window.app;
        // Remove existing entry if any
        app.portfolio = app.portfolio.filter(item => item.id !== id);
        
        // Add new entry
        app.portfolio.push({
            id: id,
            name: name,
            symbol: symbol,
            amount: parseFloat(amount),
            currentPrice: price,
            purchasePrice: price,
            dateAdded: new Date().toISOString()
        });
        
        // Save to localStorage
        localStorage.setItem('portfolio', JSON.stringify(app.portfolio));
        
        // Update UI
        app.updatePortfolio();
        
        app.showToast(`Added ${amount} ${symbol.toUpperCase()} to portfolio`, 'success');
        app.trackEvent('crypto_added_to_portfolio', {
            symbol: symbol,
            amount: amount,
            price: price
        });
    }
}

function removeFromPortfolio(id) {
    const app = window.app;
    const item = app.portfolio.find(item => item.id === id);
    if (item && confirm(`Remove ${item.amount} ${item.symbol.toUpperCase()} from portfolio?`)) {
        app.portfolio = app.portfolio.filter(item => item.id !== id);
        localStorage.setItem('portfolio', JSON.stringify(app.portfolio));
        app.updatePortfolio();
        app.showToast(`Removed ${item.symbol.toUpperCase()} from portfolio`, 'success');
    }
}

function showPaymentForm() {
    window.app.showPaymentForm();
}

function hidePaymentForm() {
    window.app.hidePaymentForm();
}

function processPayment() {
    window.app.processPayment();
}

function showSubscriptionManagement() {
    window.app.showSubscriptionManagement();
}

function hideSubscriptionManagement() {
    window.app.hideSubscriptionManagement();
}

function cancelSubscription() {
    window.app.cancelSubscription();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new InvoiceCryptoApp();
});
