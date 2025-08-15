import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ForgotPassword from './components/authPages/ForgotPassword';
import ResetPassword from './components/authPages/ResetPassword';
import SignUp from './components/authPages/SignUp';
import SignIn from './components/authPages/SignIn';
import PostProduct from './components/Product/PostProduct';
import DashboardLayout from './components/DashboardLayout';
import ProductsList from './components/Product/ProductList';
import './index.css';
import Dashboard from './pages/Dashboard';
import ProductDetail from './components/Product/ProductDetail';
import { CartProvider } from './components/cart/CartContext';
import CartPage from './components/cart/CartPage';
import MainLayout from './components/MainLayout';
import About from './pages/About';
import Services from './pages/Services';
import Calendar from './pages/Calendar';
import PaymentSuccessPage from './components/cart/PaymentSuccessPage';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Pages with only the Header */}
          <Route element={<MainLayout />}>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
          </Route>

          {/* Dashboard Pages with the Header and Sidebar */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductsList />} />
            <Route path="/cart" element={<CartPage />} />
            {/* Added the CheckoutPage route */}
            {/* Added the PaymentSuccessPage route to handle Chapa redirects */}
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/create-product" element={<PostProduct />} />
            <Route path="/products/:id" element={<ProductDetail />} />

            {/* The new route for the Calendar page */}
            <Route path="/calendar" element={<Calendar />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
 export default App