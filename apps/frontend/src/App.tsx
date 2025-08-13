import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './components/Dashboard';
import SignIn from './components/authPages/SignIn';
import SignUp from './components/authPages/SignUp';
import ForgotPassword from './components/authPages/ForgotPassword';
import ResetPassword from './components/authPages/ResetPassword';
import PostProduct from './components/Post/PostProduct';
import ProductsList from './components/Post/ProductList';
import { Link } from 'react-router-dom';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Dashboard Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductsList />} />
          <Route path="/create-product" element={<PostProduct />} />
          {/* Add other routes here */}

          {/* 404 */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-screen">
              <h1 className="text-4xl font-bold text-green-800">404</h1>
              <p className="text-lg text-gray-600 mt-4">Page not found</p>
              <Link to="/" className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Return Home
              </Link>
            </div>
          } />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}

export default App;
