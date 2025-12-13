// Define the shape of the item specifically for the receipt
export type ReceiptItem = {
  name: string;
  price: number;
  qty: number;
};

export const printReceipt = (
  orderId: string, 
  total: number, 
  items: ReceiptItem[], 
  storeName: string,
  cashierName: string
) => {
  const receiptWindow = window.open('', '_blank', 'width=400,height=600');
  if (!receiptWindow) return;

  const date = new Date().toLocaleString();
  
  // Calculate Tax
  // Default to 15% if not set in settings
  const taxRate = parseFloat(localStorage.getItem("pos_tax_rate") || "15");
  const taxAmount = total - (total / (1 + (taxRate / 100)));
  const subTotal = total - taxAmount;

  const html = `
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body { 
            font-family: 'Courier New', monospace; 
            font-size: 12px; 
            width: 80mm; /* Standard thermal width */
            margin: 0; 
            padding: 5px; 
            color: black;
          }
          .center { text-align: center; }
          .left { text-align: left; }
          .divider { border-top: 1px dashed black; margin: 10px 0; }
          .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .totals { margin-top: 10px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
          .total-row { font-weight: bold; font-size: 14px; margin-top: 5px; border-top: 1px solid black; padding-top: 5px;}
          .footer { font-size: 10px; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="center">
          <h3>${storeName}</h3>
          <p>${date}</p>
          <p>Order: #${orderId.slice(0,8)}</p>
          <p>Cashier: ${cashierName}</p>
        </div>
        
        <div class="divider"></div>
        
        ${items.map(item => `
          <div class="item">
            <span>${item.qty} x ${item.name}</span>
            <span>R ${(item.price * item.qty).toFixed(2)}</span>
          </div>
        `).join('')}
        
        <div class="divider"></div>
        
        <div class="totals">
          <div class="row">
            <span>Subtotal</span>
            <span>R ${subTotal.toFixed(2)}</span>
          </div>
          <div class="row">
            <span>VAT (${taxRate}%)</span>
            <span>R ${taxAmount.toFixed(2)}</span>
          </div>
          <div class="row total-row">
            <span>TOTAL</span>
            <span>R ${total.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your support!</p>
          <p>Retain slip for returns.</p>
        </div>
      </body>
    </html>
  `;

  receiptWindow.document.write(html);
  receiptWindow.document.close();
  
  // Wait for content to load then print
  receiptWindow.focus();
  setTimeout(() => {
    receiptWindow.print();
    receiptWindow.close();
  }, 250);
};