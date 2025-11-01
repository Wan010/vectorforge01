// Dashboard specific functionality
class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupRealTimeUpdates();
        this.updateDashboardStats();
        this.setupAutoRefresh();
    }

    setupRealTimeUpdates() {
        // Update crypto prices every 30 seconds
        setInterval(() => {
            this.updateCryptoPrices();
        }, 30000);

        // Update activity times every minute
        setInterval(() => {
            this.updateActivityTimes();
        }, 60000);
    }

    updateCryptoPrices() {
        // Simulate price updates for demo
        const priceElements = document.querySelectorAll('.price-change');
        priceElements.forEach(element => {
            if (Math.random() > 0.3) { // 70% chance of update
                const randomChange = (Math.random() - 0.5) * 4; // -2% to +2%
                const isPositive = randomChange >= 0;
                const changeText = `${isPositive ? '+' : ''}${randomChange.toFixed(2)}%`;
                
                element.textContent = changeText;
                element.className = `price-change ${isPositive ? 'positive' : 'negative'}`;
                
                // Add flash animation
                element.style.animation = 'none';
                setTimeout(() => {
                    element.style.animation = 'priceFlash 0.5s ease';
                }, 10);
            }
        });
    }

    updateActivityTimes() {
        const timeElements = document.querySelectorAll('.activity-time');
        const times = ['2 hours ago', '5 hours ago', '1 day ago', '2 days ago'];
        
        timeElements.forEach((element, index) => {
            if (index < times.length) {
                element.textContent = times[index];
            }
        });
    }

    updateDashboardStats() {
        // Update time display
        this.updateTime();
        setInterval(() => this.updateTime(), 60000);
    }

    updateTime() {
        // This would update any real-time data on the dashboard
        const now = new Date();
        const timeElement = document.querySelector('.current-time');
        
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString();
        }
    }

    setupAutoRefresh() {
        // Refresh crypto data every 5 minutes
        setInterval(() => {
            if (window.app && document.getElementById('crypto').classList.contains('active')) {
                window.app.loadCryptoData();
            }
        }, 300000);
    }
}

// CSS animation for price flashes
const style = document.createElement('style');
style.textContent = `
    @keyframes priceFlash {
        0% { background-color: transparent; }
        50% { background-color: rgba(16, 185, 129, 0.2); }
        100% { background-color: transparent; }
    }
    
    .price-change {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});
