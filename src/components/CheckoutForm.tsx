import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface CheckoutFormProps {
  cart: any[];
  total: number;
  onOrderComplete: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ cart, total, onOrderComplete }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOrderComplete();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-lg font-semibold">
            Total: ${total.toFixed(2)}
          </div>
          <Button type="submit" className="w-full">
            Complete Order
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CheckoutForm;