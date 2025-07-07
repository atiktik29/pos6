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

    // Create a clean clone of the element to avoid styling issues
    const clonedElement = element.cloneNode(true) as HTMLElement;
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '80mm'; // Standard thermal receipt width
    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);

    // Apply specific styles to ensure proper formatting
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      #receipt-content {
        width: 80mm !important;
        padding: 5mm !important;
        font-family: 'Courier New', monospace !important;
        font-size: 9px !important;
        background-color: white !important;
        color: black !important;
        box-sizing: border-box !important;
      }
      .receipt-header {
        text-align: center !important;
        margin-bottom: 8px !important;
      }
      .receipt-header h3 {
        font-size: 14px !important;
        margin: 0 0 2px 0 !important;
        padding: 0 !important;
        font-weight: bold !important;
      }
      .receipt-header p {
        font-size: 9px !important;
        margin: 0 0 2px 0 !important;
        padding: 0 !important;
      }
      .receipt-divider {
        border-top: 1px dashed #000 !important;
        border-bottom: 1px dashed #000 !important;
        margin: 4px 0 !important;
        padding: 2px 0 !important;
        width: 100% !important;
      }
      .receipt-header-row {
        display: flex !important;
        justify-content: space-between !important;
        font-weight: bold !important;
        width: 100% !important;
      }
      .receipt-item {
        display: flex !important;
        justify-content: space-between !important;
        margin-bottom: 2px !important;
        font-size: 8px !important;
        width: 100% !important;
      }
      .receipt-summary {
        border-top: 1px dashed #000 !important;
        padding-top: 3px !important;
        margin-bottom: 3px !important;
        width: 100% !important;
      }
      .receipt-total, 
      .receipt-payment, 
      .receipt-change, 
      .receipt-method {
        display: flex !important;
        justify-content: space-between !important;
        margin-bottom: 2px !important;
        width: 100% !important;
      }
      .receipt-footer {
        text-align: center !important;
        margin-top: 8px !important;
        font-size: 8px !important;
        border-top: 1px dashed #000 !important;
        padding-top: 3px !important;
        width: 100% !important;
      }
      .receipt-footer p {
        margin: 0 0 2px 0 !important;
        padding: 0 !important;
      }
    `;
    tempContainer.appendChild(styleElement);

    // Configure html2canvas options for better quality
    try {
      const canvas = await html2canvas(clonedElement, {
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