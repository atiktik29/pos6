import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

const CheckoutForm = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const formRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    setIsProcessing(true);
    setPaymentError('');
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form on success
      reset();
      alert('Payment processed successfully!');
    } catch (error) {
      setPaymentError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-form">
      <h2>Checkout</h2>
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="cardNumber">Card Number</label>
          <input
            id="cardNumber"
            type="text"
            {...register('cardNumber', { required: 'Card number is required' })}
          />
          {errors.cardNumber && <span className="error">{errors.cardNumber.message}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              id="expiryDate"
              type="text"
              placeholder="MM/YY"
              {...register('expiryDate', { required: 'Expiry date is required' })}
            />
            {errors.expiryDate && <span className="error">{errors.expiryDate.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="cvv">CVV</label>
            <input
              id="cvv"
              type="text"
              {...register('cvv', { required: 'CVV is required' })}
            />
            {errors.cvv && <span className="error">{errors.cvv.message}</span>}
          </div>
        </div>

        {paymentError && <div className="error-message">{paymentError}</div>}

        <button 
          type="submit" 
          disabled={isProcessing}
          className="submit-button"
        >
          {isProcessing ? 'Processing...' : 'Complete Payment'}
        </button>
      </form>
    </div>
  );
};

export default CheckoutForm;