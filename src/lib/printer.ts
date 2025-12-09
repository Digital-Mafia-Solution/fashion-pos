// Define the shape of the item specifically for the receipt
export interface ReceiptItem {
  name: string;
  price: number;
  qty: number;
}

export const printReceipt = (orderId: string, total: number, items: ReceiptItem[], storeName: string) => {
  const receiptWindow = window.open('', '_blank', 'width=400,height=600');
  if (!receiptWindow) return;

  const date = new Date().toLocaleString();

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
          }
          .center { text-align: center; }
          .divider { border-top: 1px dashed black; margin: 10px 0; }
          .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .total { font-weight: bold; font-size: 14px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="center">
          <h3>${storeName}</h3>
          <p>${date}</p>
          <p>Order #${orderId.slice(0,8)}</p>
        </div>
        
        <div class="divider"></div>
        
        ${items.map(item => `
          <div class="item">
            <span>${item.qty} x ${item.name}</span>
            <span>R ${(item.price * item.qty).toFixed(2)}</span>
          </div>
        `).join('')}
        
        <div class="divider"></div>
        
        <div class="item total">
          <span>TOTAL</span>
          <span>R ${total.toFixed(2)}</span>
        </div>
        
        <div class="center" style="margin-top: 20px;">
          <p>Thank you for your support!</p>
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