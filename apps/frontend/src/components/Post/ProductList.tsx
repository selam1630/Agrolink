import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../cart/CartContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Check } from 'lucide-react'; 
import { motion } from 'framer-motion';
interface Product {
  id: string;
  name: string;
  price?: number; 
  imageUrl: string; 
}

const ProductList: React.FC = () => {
  const { t } = useTranslation();
  const { cartItems, addToCart } = useCart(); 
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found. Please log in.');
        }
        const response = await fetch('http://localhost:5000/api/products', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch products.');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    if (product.price !== undefined) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      });
    } else {
      console.error(`Cannot add product "${product.name}" to cart: price is undefined.`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, 
      },
    },
  };
  const itemVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.9 }, 
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1, 
      transition: {
        type: 'spring',
        stiffness: 100, 
      }
    },
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-gray-500">
        <p>{t('product.list.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-red-500">
        <p>{t('product.list.error')}: {error}</p>
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
        <div className="container mx-auto px-4 py-12 text-center text-gray-500">
            <p>{t('product.list.noProducts')}</p>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-green-800 mb-2">{t('product.list.title')}</h1>
      <p className="text-xl text-gray-600 mb-8">{t('product.list.subtitle')}</p>

      {/* Grid of Product Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {products.map((product) => {
          const isProductInCart = cartItems.some(item => item.id === product.id);

          return (
            <motion.div 
              key={product.id} 
              variants={itemVariants}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
              transition={{ duration: 0.2 }}
            >
              <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full">
                {/* Wrapped the image in a Link component */}
                <Link to={`/products/${product.id}`} className="relative pb-[75%] block">
                  <img
                    src={product.imageUrl || 'https://placehold.co/400x300'}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </Link>
                <CardHeader className="flex-grow p-4">
                  <CardTitle className="text-xl font-bold">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {/* Conditional rendering for price */}
                  <p className="text-2xl font-bold text-green-700">
                    {/* Use optional chaining to safely call toFixed() */}
                    {product.price ? `ETB ${product.price.toFixed(2)}` : 'Price not available'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{t('unit')}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  {isProductInCart ? (
                    <Button
                      className="w-full bg-gray-400 text-white rounded-xl cursor-not-allowed"
                      disabled
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {t('cart.addedToCart')}
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                      onClick={() => handleAddToCart(product)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('add.to.cart')}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default ProductList;
