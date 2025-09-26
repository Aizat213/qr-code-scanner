// REPLACE THIS WITH YOUR ACTUAL WEB APP URL FROM GOOGLE SCRIPTS
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxZ2_4nicugjHdXM79gLj5vsjW6cnzYZRekoHz0EwVLeFpDJKu8OjHwp7k4wiJIVHEqwQ/exec';

class QRScanner {
    constructor() {
        this.html5QrCode = null;
        this.isScanning = false;
        this.startButton = document.getElementById('startButton');
        this.stopButton = document.getElementById('stopButton');
        this.resultDiv = document.getElementById('result');
        this.readerDiv = document.getElementById('reader');
        
        this.init();
    }
    
    init() {
        this.startButton.addEventListener('click', () => this.startScanner());
        this.stopButton.addEventListener('click', () => this.stopScanner());
    }
    
    async startScanner() {
        try {
            this.html5QrCode = new Html5Qrcode("reader");
            
            await this.html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    this.handleScan(decodedText);
                },
                (errorMessage) => {
                    // Ignore parsing errors
                }
            );
            
            this.isScanning = true;
            this.startButton.classList.add('hidden');
            this.stopButton.classList.remove('hidden');
            this.resultDiv.innerHTML = '<p class="loading">Scanning... Point camera at QR code</p>';
            
        } catch (error) {
            this.showError('Error starting scanner: ' + error.message);
        }
    }
    
    async stopScanner() {
        if (this.html5QrCode && this.isScanning) {
            try {
                await this.html5QrCode.stop();
                this.html5QrCode.clear();
            } catch (error) {
                console.error('Error stopping scanner:', error);
            }
        }
        
        this.isScanning = false;
        this.startButton.classList.remove('hidden');
        this.stopButton.classList.add('hidden');
        this.resultDiv.innerHTML = '<p style="text-align: center; color: #666;">Scanner stopped</p>';
    }
    
    async handleScan(itemId) {
        console.log('Scanned ID:', itemId);
        this.resultDiv.innerHTML = '<p class="loading">Loading item information...</p>';
        
        try {
            const itemData = await this.fetchItemData(itemId.trim());
            this.displayItem(itemData);
            
        } catch (error) {
            this.showError('Error: ' + error.message);
        }
    }
    
    async fetchItemData(itemId) {
        const response = await fetch(`${SCRIPT_URL}?id=${encodeURIComponent(itemId)}`);
        
        if (!response.ok) {
            throw new Error('Network error: ' + response.status);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data;
    }
    
    displayItem(item) {
        this.resultDiv.innerHTML = `
            <h2>${item.name || 'Unnamed Item'}</h2>
            ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" class="item-image" onerror="this.style.display='none'">` : ''}
            <p><strong>Description:</strong> ${item.description || 'No description available'}</p>
            <p><strong>Category:</strong> ${item.category || 'Uncategorized'}</p>
            <p><strong>ID:</strong> ${item.id}</p>
            <hr>
            <button onclick="scanner.startScanner()" class="button">Scan Another Code</button>
        `;
    }
    
    showError(message) {
        this.resultDiv.innerHTML = `
            <div class="error">
                <strong>Error:</strong> ${message}
            </div>
            <button onclick="scanner.startScanner()" class="button">Try Again</button>
        `;
    }
}

// Initialize scanner when page loads
let scanner;
document.addEventListener('DOMContentLoaded', () => {
    scanner = new QRScanner();
});
