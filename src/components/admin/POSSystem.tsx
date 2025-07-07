@@ .. @@
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false); 
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);
  const receiptRef = useRef<HTMLDivElement | null>(null);

  // Get transactions for the selected date
  const { transactions, loading: transactionsLoading, error: transactionsError } = usePOSTransactions(selectedDate);

  // Handle manual refresh of transactions
  const handleRefreshTransactions = () => {
    setIsRefreshing(true);
    // Store current date
    const currentDate = selectedDate;
    // Use a valid date format for temporary value
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setTimeout(() => {
      setSelectedDate(currentDate);
      setIsRefreshing(false);
    }, 500);
  };

  // Get unique categories from products
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

                      <Input
                        type="date"
                        max={new Date().toISOString().split('T')[0]} // Prevent selecting future dates
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-40"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRefreshTransactions}
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>

                {transactionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mr-3"></div>
                    <span>Memuat data transaksi...</span>
                  </div>
                ) : transactionsError ? (
                )
                }

      <div className="font-mono" style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}>
        <div className="text-center mb-4 receipt-header">
         <div className="w-16 h-16 mx-auto mb-2">
           <img 
             src="/logo.jpg"
             alt="Injapan Food Logo" 
             className="w-full h-full object-contain rounded-full"
           />
         </div>
          <h3 className="font-bold text-lg">INJAPAN FOOD</h3>
          <p className="text-sm">POS KASIR (JULI 2025)</p>

       try {
         // Process the transaction
         const transactionId = await processPOSTransaction(transactionData);
        
        // Show success toast after transaction is processed
        toast({
          title: "Transaksi Berhasil",
          description: "Transaksi telah berhasil diproses dan disimpan",
        });
         
         // Reset the cart
         setCart([]);
         setPaymentMethod('cash');
         setShowReceipt(true);
         setCurrentTransaction(transactionData);
       } catch (error) {
         console.error('Error processing transaction:', error instanceof Error ? error.message : error);
        
        // Show error toast with specific message
         toast({
           title: "Transaksi Gagal",
           description: error instanceof Error 
            ? `Error: ${error.message}` 
            : "Terjadi kesalahan saat memproses transaksi",
           variant: "destructive"
         });
       } finally {
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
       <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
         <h3 className="text-lg font-bold mb-4">Struk Pembayaran</h3>
        
        {/* Receipt content with proper structure for printing */}
        <div id="receipt-content" className="bg-gray-100 p-4 rounded-lg mb-4 font-mono text-sm" ref={receiptRef}>
          <div className="receipt-header">
            <div className="w-16 h-16 mx-auto mb-2">
              <img 
                src="/logo.jpg"
                alt="Injapan Food Logo" 
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <h3 className="font-bold text-lg">INJAPAN FOOD</h3>
            <p className="text-sm">POS KASIR (JULI 2025)</p>
            <p className="text-xs mt-2">
              {new Date().toLocaleDateString('id-ID', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p className="text-xs">Kasir: {selectedCashier?.name || 'Admin'}</p>
          </div>
          
          <div className="receipt-divider">
            <div className="receipt-header-row">
              <span>Produk</span>
              <div className="flex">
                <span className="receipt-item-qty">Qty</span>
                <span className="receipt-item-total">Harga</span>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            {currentTransaction?.items.map((item, index) => (
              <div key={index} className="receipt-item">
                <span className="receipt-item-name">{item.product.name}</span>
                <div className="receipt-item-details">
                  <span className="receipt-item-qty">{item.quantity}</span>
                  <span className="receipt-item-total">¥{item.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="receipt-summary">
            <div className="receipt-total">
              <span className="receipt-total-label">Total</span>
              <span className="receipt-total-value">¥{currentTransaction?.totalAmount.toLocaleString()}</span>
            </div>
            
            {paymentMethod === 'cash' && currentTransaction?.cashReceived && (
              <>
                <div className="receipt-payment">
                  <span className="receipt-payment-label">Tunai</span>
                  <span className="receipt-payment-value">¥{currentTransaction.cashReceived.toLocaleString()}</span>
                </div>
                <div className="receipt-change">
                  <span className="receipt-change-label">Kembali</span>
                  <span className="receipt-change-value">¥{currentTransaction.change?.toLocaleString()}</span>
                </div>
              </>
            )}
            
            <div className="receipt-method">
              <span className="receipt-method-label">Metode:</span>
              <span className="receipt-method-value">{paymentMethod === 'cash' ? 'Tunai' : 'Non-Tunai'}</span>
            </div>
          </div>
          
          <div className="receipt-footer">
            <p>Terima kasih!</p>
            <p className="text-xs mt-1">ID: {transactionId.slice(0, 8)}</p>
          </div>
         </div>
         
           <Button 
             onClick={() => {
               try {
                 // Use the browser's print functionality
                window.print();
               } catch (error) {
                 console.error('Error printing receipt:', error);
                 toast({
           <Button 
             onClick={() => {
               try {
                 // Use the improved PDF generation function
                import('../../utils/pdfUtils').then(module => {
                  module.generateReceiptPDF(receiptRef.current, transactionId.slice(0, 8));
                }).catch(error => {
                  console.error('Error importing PDF utils:', error);
                  toast({
                    title: "Error",
                    description: "Gagal mengimpor modul PDF. Coba lagi nanti.",
                    variant: "destructive"
                  });
                });
               } catch (error) {
                 console.error('Error generating PDF:', error);
                 toast({