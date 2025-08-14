import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const { cartItems } = useCart();
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  const handleChapaPayment = async () => {
    try {
      const payload = {
        amount: totalPrice.toFixed(2), 
        currency: 'ETB',
        tx_ref: `chapa-payment-${Date.now()}`, 
        return_url: 'http://localhost:5173/payment-success', 
      };

      console.log('Initiating Chapa payment with payload:', payload);
      const response = await fetch('http://localhost:5000/api/chapa/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate Chapa payment.');
      }

      const data = await response.json();
      console.log('Chapa response:', data);
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL received from the server.');
      }
    } catch (error) {
      console.error('Chapa payment error:', error);
      let errorMessage = 'Payment failed: An unknown error occurred.';
      if (error instanceof Error) {
        errorMessage = `Payment failed: ${error.message}`;
      }
      alert(errorMessage);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-green-800 mb-2">{t("checkout.title")}</h1>
      <p className="text-xl text-gray-600 mb-8">{t("checkout.subtitle")}</p>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl shadow-inner text-center">
          <CreditCard size={64} className="text-gray-400 mb-4" />
          <h3 className="text-2xl font-semibold text-gray-700">{t("checkout.noItems")}</h3>
          <p className="text-gray-500 mt-2 mb-6">{t("checkout.noItemsMessage")}</p>
          <Link to="/products">
            <Button className="bg-green-600 text-white hover:bg-green-700 transition-colors duration-300">
              <ArrowLeft size={16} className="mr-2" />
              {t("checkout.startShopping")}
            </Button>
          </Link>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-xl mx-auto rounded-xl shadow-lg">
            <CardHeader className="border-b">
              <CardTitle>{t("checkout.summary")}</CardTitle>
              <CardDescription>{t("checkout.summaryDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-between items-center text-lg mb-4">
                <span>{t("checkout.itemsInCart")}:</span>
                <span className="font-semibold text-gray-700">{cartItems.length}</span>
              </div>
              <div className="flex justify-between items-center text-3xl font-bold border-t pt-4 mt-4">
                <span>{t("checkout.totalAmount")}:</span>
                <span className="text-green-700">ETB {totalPrice.toFixed(2)}</span>
              </div>
              <Button
                className="w-full mt-6 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-300 flex items-center gap-2"
                onClick={handleChapaPayment}
              >
                <CreditCard size={20} />
                {t("checkout.payWithChapa")}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default CheckoutPage;
