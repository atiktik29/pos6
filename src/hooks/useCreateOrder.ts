export const useCreateOrder = () => {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: async ({
      items,
      totalPrice,
      customerInfo,
      userId,
      shipping_fee,
      affiliate_id
    }: {
      items: CartItem[];
      totalPrice: number;
      customerInfo: CustomerInfo;
      userId: string;
      shipping_fee: number;
      affiliate_id?: string;
    }) => {
      const orderData = await createOrder({
        items,
        totalPrice,
        customerInfo,
        userId,
        shipping_fee,
        affiliate_id
      });

      return await createOrderAnalytics({
        order_id: orderData.order_id,
        visitor_id: orderData.visitor_id
      });
    },
    onError: (error) => {
      console.error('Order creation error details:', error);
      
      // Log additional details for debugging
      if (error.name === 'FirebaseError') {
        console.error('Firebase error code:', error.code);
        console.error('Firebase error message:', error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
    }
  });
}