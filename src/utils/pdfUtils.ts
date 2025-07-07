/**
 * Generate a PDF receipt for POS transactions
 * @param element The HTML element containing the receipt
 * @param transactionId Transaction ID for the filename
 */
export const generateReceiptPDF = async (element: HTMLElement | null, transactionId: string) => {
  if (!element) {
    console.error('Receipt element not found for PDF generation');
    return;
  }

  try {
    // Import html2canvas and jsPDF dynamically with error handling
    let html2canvas, jsPDF;
    try {
      html2canvas = (await import('html2canvas')).default;
      jsPDF = (await import('jspdf')).default;
    } catch (importError) {
      console.error('Error importing PDF libraries:', importError);
      alert('Failed to load PDF generation libraries. Please try again later.');
      return;
    }

    // Create a clean container with proper receipt styling
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '80mm';
    tempContainer.style.padding = '5mm';
    tempContainer.style.backgroundColor = 'white';
    document.body.appendChild(tempContainer);
    
    // Extract data from the original receipt element
    const receiptData = extractReceiptData(element);
    
    // Create a clean receipt with consistent formatting
    tempContainer.innerHTML = createCleanReceiptHTML(receiptData);

    // Apply specific styles to ensure proper formatting
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .receipt-container {
        width: 80mm;
        font-family: 'Courier New', monospace;
        font-size: 9px;
        line-height: 1.2;
        color: black;
        background: white;
        padding: 5mm;
        box-sizing: border-box;
      }
      .receipt-title {
        font-size: 14px;
        font-weight: bold;
        text-align: center;
        margin: 0 0 2px 0;
      }
      .receipt-subtitle {
        font-size: 9px;
        text-align: center;
        margin: 0 0 2px 0;
      }
      .receipt-info {
        font-size: 9px;
        text-align: center;
        margin: 0 0 2px 0;
      }
      .receipt-divider {
        border-top: 1px dashed #000;
        margin: 4px 0;
        width: 100%;
      }
      .receipt-table-header {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        margin-bottom: 4px;
      }
      .receipt-product {
        flex: 1;
        text-align: left;
        padding-right: 5px;
      }
      .receipt-qty {
        width: 20px;
        text-align: center;
      }
      .receipt-price {
        width: 40px;
        text-align: right;
        padding-left: 5px;
      }
      .receipt-subtotal {
        width: 40px;
        text-align: right;
        padding-left: 5px;
      }
      .receipt-item-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2px;
      }
      .receipt-summary {
        margin-top: 4px;
      }
      .receipt-summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2px;
      }
      .receipt-footer {
        text-align: center;
        margin-top: 8px;
        font-size: 8px;
      }
    `;
    tempContainer.appendChild(styleElement);

    // Configure html2canvas options for better quality
    try {
      const canvas = await html2canvas(tempContainer.firstChild as HTMLElement, {
        scale: 3, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Clean up the temporary container
      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF with thermal receipt dimensions (80mm width, auto height)
      const pdfWidth = 80; // 80mm width (standard receipt)
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, Math.min(pdfHeight + 10, 297)] // Limit height to A4 max
      });
      
      // Add image with proper dimensions and centered
      pdf.addImage(imgData, 'PNG', 0, 5, pdfWidth, pdfHeight);
      pdf.save(`receipt-${transactionId}.pdf`);
    } catch (error) {
      console.error('Error generating receipt PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      
      // Clean up if error occurs
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
    }
  } catch (error) {
    console.error('Error in receipt PDF generation:', error);
    alert('An unexpected error occurred. Please try again later.');
  }
};

/**
 * Extract receipt data from the receipt element
 */
function extractReceiptData(element: HTMLElement): any {
  try {
    // Extract header information
    const headerElement = element.querySelector('.receipt-header');
    const title = headerElement?.querySelector('h3')?.textContent || 'INJAPAN FOOD';
    const subtitle = headerElement?.querySelector('p:nth-of-type(1)')?.textContent || 'POS KASIR';
    
    // Extract date and cashier info
    const dateInfo = headerElement?.querySelector('p:nth-of-type(2)')?.textContent || '';
    const cashierInfo = headerElement?.querySelector('p:nth-of-type(3)')?.textContent || '';
    
    // Extract items
    const items: Array<{name: string, qty: string, price: string}> = [];
    const itemElements = element.querySelectorAll('.receipt-item');
    itemElements.forEach(item => {
      const nameElement = item.querySelector('.receipt-item-name') || 
                          item.querySelector('.w-1/2.truncate');
      const qtyElement = item.querySelector('.receipt-item-qty') || 
                         item.querySelector('.w-10.text-center');
      const priceElement = item.querySelector('.receipt-item-total') || 
                           item.querySelector('.w-20.text-right');
      
      if (nameElement && qtyElement && priceElement) {
        items.push({
          name: nameElement.textContent || '',
          qty: qtyElement.textContent || '',
          price: priceElement.textContent || ''
        });
      }
    });
    
    // Extract summary information
    const totalElement = element.querySelector('.receipt-total');
    const total = totalElement?.querySelector('.receipt-total-value')?.textContent || 
                  totalElement?.querySelector('span:last-child')?.textContent || '';
    
    const paymentElement = element.querySelector('.receipt-payment');
    const payment = paymentElement?.querySelector('.receipt-payment-value')?.textContent || 
                    paymentElement?.querySelector('span:last-child')?.textContent || '';
    
    const changeElement = element.querySelector('.receipt-change');
    const change = changeElement?.querySelector('.receipt-change-value')?.textContent || 
                   changeElement?.querySelector('span:last-child')?.textContent || '';
    
    const methodElement = element.querySelector('.receipt-method');
    const method = methodElement?.querySelector('.receipt-method-value')?.textContent || 
                   methodElement?.querySelector('span:last-child')?.textContent || '';
    
    // Extract footer information
    const footerElement = element.querySelector('.receipt-footer');
    const thankYouMessage = footerElement?.querySelector('p:first-child')?.textContent || 'Terima kasih!';
    const transactionId = footerElement?.querySelector('p:last-child')?.textContent || '';
    
    return {
      title,
      subtitle,
      dateInfo,
      cashierInfo,
      items,
      total,
      payment,
      change,
      method,
      thankYouMessage,
      transactionId
    };
  } catch (error) {
    console.error('Error extracting receipt data:', error);
    return {
      title: 'INJAPAN FOOD',
      subtitle: 'POS KASIR',
      dateInfo: new Date().toLocaleDateString(),
      cashierInfo: 'Kasir: Admin',
      items: [],
      total: '¥0',
      payment: '',
      change: '',
      method: '',
      thankYouMessage: 'Terima kasih!',
      transactionId: ''
    };
  }
}

/**
 * Create clean receipt HTML with consistent formatting
 */
function createCleanReceiptHTML(data: any): string {
  return `
    <div class="receipt-container">
      <div class="receipt-title">${data.title}</div>
      <div class="receipt-subtitle">${data.subtitle}</div>
      <div class="receipt-info">${data.dateInfo}</div>
      <div class="receipt-info">${data.cashierInfo}</div>
      
      <div class="receipt-divider"></div>
      
      <div class="receipt-table-header">
        <div class="receipt-product">Produk</div>
        <div class="receipt-qty">Qty</div>
        <div class="receipt-price">Harga</div>
        <div class="receipt-subtotal">Subtotal</div>
      </div>
      
      <div class="receipt-divider"></div>
      
      ${data.items.map(item => `
        <div class="receipt-item-row">
          <div class="receipt-product">${item.name}</div>
          <div class="receipt-qty">${item.qty}</div>
          <div class="receipt-price">${item.price}</div>
          <div class="receipt-subtotal">${item.price}</div>
        </div>
      `).join('')}
      
      <div class="receipt-divider"></div>
      
      <div class="receipt-summary">
        <div class="receipt-summary-row">
          <div>Total</div>
          <div>${data.total}</div>
        </div>
        ${data.payment ? `
        <div class="receipt-summary-row">
          <div>Tunai</div>
          <div>${data.payment}</div>
        </div>
        ` : ''}
        ${data.change ? `
        <div class="receipt-summary-row">
          <div>Kembali</div>
          <div>${data.change}</div>
        </div>
        ` : ''}
        <div class="receipt-summary-row">
          <div>Metode:</div>
          <div>${data.method}</div>
        </div>
      </div>
      
      <div class="receipt-divider"></div>
      
      <div class="receipt-footer">
        <div>${data.thankYouMessage}</div>
        <div>${data.transactionId}</div>
      </div>
    </div>
  `;
}
export const generateInvoicePDF = async (element: HTMLElement | null, invoiceNumber: string) => {
  if (!element) {
    console.error('Element not found for PDF generation');
    return;
  }

  try {
    // Import html2canvas and jsPDF dynamically with error handling
    let html2canvas, jsPDF;
    try {
      html2canvas = (await import('html2canvas')).default;
      jsPDF = (await import('jspdf')).default;
    } catch (importError) {
      console.error('Error importing PDF libraries:', importError);
      alert('Failed to load PDF generation libraries. Please try again later.');
      return;
    }

    // Configure html2canvas options for better quality with error handling
    let canvas;
    try {
      canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });
    } catch (canvasError) {
      console.error('Error creating canvas:', canvasError);
      alert('Failed to generate PDF. Please try again.');
      return;
    }

    const imgData = canvas.toDataURL('image/png');
    
    // Calculate PDF dimensions - A4 size
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    
    // Calculate image dimensions to fit A4
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF and add content with error handling
    try {
      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Try to add logo to PDF
      try {
        // Add logo to PDF
        const logoUrl = "/logo.jpg";
        // Create a temporary image element to load the logo
        const logoImg = new Image();
        logoImg.crossOrigin = "Anonymous";  // Important for CORS
        logoImg.src = logoUrl;
        
        // Wait for the image to load with timeout
        await Promise.race([
          new Promise((resolve, reject) => {
            logoImg.onload = resolve;
            logoImg.onerror = reject;
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Logo load timeout')), 3000)
          )
        ]);
        
        // Create a canvas for the logo
        const logoCanvas = document.createElement('canvas');
        logoCanvas.width = logoImg.width;
        logoCanvas.height = logoImg.height;
        const logoCtx = logoCanvas.getContext('2d');
        logoCtx?.drawImage(logoImg, 0, 0);
        
        // Add logo to PDF
        const logoData = logoCanvas.toDataURL('image/png');
        const logoWidth = 30; // in mm
        const logoHeight = 30; // in mm
        const logoX = (pdfWidth - logoWidth) / 2; // Center horizontally
        pdf.addImage(logoData, 'PNG', logoX, 5, logoWidth, logoHeight);
      } catch (logoError) {
        console.warn('Could not add logo to PDF:', logoError);
        // Continue without logo if there's an error
      }
      
      // Add image to PDF, centered and scaled to fit
      pdf.addImage(imgData, 'PNG', 0, 40, imgWidth, Math.min(imgHeight, pdfHeight - 40));
      
      // Download the PDF
      pdf.save(`Invoice-${invoiceNumber}.pdf`);
    } catch (pdfError) {
      console.error('Error creating or saving PDF:', pdfError);
      alert('Failed to generate PDF. Please try again.');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Fallback: open print dialog
    try {
      window.print();
    } catch (printError) {
      console.error('Print fallback also failed:', printError);
      alert('Failed to generate PDF and print fallback also failed. Please try again later.');
    }
  }
};