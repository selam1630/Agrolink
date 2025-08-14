import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "./CartContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Trash2, ShoppingCart } from "lucide-react";

type CartItem = {
  id: string;
  name: string;
  price?: number;
  imageUrl?: string;
  quantity: number;
};

const CartPage: React.FC = () => {
  const { t } = useTranslation();
  const { cartItems, removeFromCart } = useCart();
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    setTotalPrice(total);
  }, [cartItems]);

  const handleRemoveFromCart = (productId: string) => {
    removeFromCart(productId);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-green-800 mb-2">{t("cart.title")}</h1>
      <p className="text-xl text-gray-600 mb-8">{t("cart.subtitle")}</p>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl shadow-inner text-center">
          <ShoppingCart size={64} className="text-gray-400 mb-4" />
          <h3 className="text-2xl font-semibold text-gray-700">{t("cart.empty")}</h3>
          <p className="text-gray-500 mt-2 mb-6">{t("cart.emptyMessage")}</p>
          <Link to="/products">
            <Button className="bg-green-600 text-white hover:bg-green-700 transition-colors duration-300">
              <ArrowLeft size={16} className="mr-2" />
              {t("cart.startShopping")}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Table */}
          <div className="lg:col-span-2">
            <Card className="rounded-xl shadow-lg">
              <CardHeader className="border-b">
                <CardTitle>{t("cart.items")}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("cart.product")}</TableHead>
                      <TableHead>{t("cart.quantity")}</TableHead>
                      <TableHead className="text-right">{t("cart.price")}</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium flex items-center gap-4">
                          <img
                            src={item.imageUrl || 'https://placehold.co/60x60/E5E7EB/4B5563?text=N/A'}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                          <span>{item.name}</span>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {item.price ? `ETB ${item.price.toFixed(2)}` : 'Price not available'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={20} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-1">
            <Card className="rounded-xl shadow-lg">
              <CardHeader className="border-b">
                <CardTitle>{t("cart.orderSummary")}</CardTitle>
                <CardDescription>{t("cart.finalizeOrder")}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4 text-lg">
                  <span>{t("cart.items")}:</span>
                  <span className="font-semibold text-gray-700">{cartItems.length}</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-bold border-t pt-4 mt-4">
                  <span>{t("cart.total")}:</span>
                  <span className="text-green-700">ETB {totalPrice.toFixed(2)}</span>
                </div>
                {/* Updated the button to use Link to navigate to the checkout page */}
                <Link to="/checkout">
                  <Button className="w-full mt-6 bg-green-600 text-white hover:bg-green-700 transition-colors duration-300">
                    {t("cart.payWithChapa")}
                  </Button>
                </Link>
                <Link to="/products">
                  <Button
                    variant="outline"
                    className="w-full mt-4 text-green-600 border-green-600 hover:bg-green-50 transition-colors duration-300"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    {t("cart.continueShopping")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
