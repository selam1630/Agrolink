import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import agriIcon from '@/assets/images/agriIcon.png'; // Assuming this is a valid path
import { useTranslation } from 'react-i18next';

interface FormData {
  name: string;
  phoneNumber: string;
  email: string;
  password: string;
  role: string;
}

const SignUp: React.FC = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    role: 'farmer'
  });
  const [otp, setOtp] = useState<string>('');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const payload = {
      name: formData.name,
      phone: formData.phoneNumber,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    try {
      const response = await fetch('http://localhost:5000/api/auth/register-with-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(t('signUp.sendOtpMessage') as string);
        setStep('otp');
      } else {
        setError(data.error || (t('signUp.unknownError') as string));
      }
    } catch (err) {
      console.error('Error during OTP request:', err);
      setError(t('signUp.networkError') as string);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const payload = {
      phone: formData.phoneNumber,
      otp,
    };

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-registration-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(t('signUp.registrationSuccess') as string);
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        if (data.role === 'farmer') {
          navigate('/create-product');
        } else if (data.role === 'buyer') {
          navigate('/products');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.error || (t('signUp.otpError') as string));
      }
    } catch (err) {
      console.error('Error during OTP verification:', err);
      setError(t('signUp.networkError') as string);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-100 p-4">
      <div className="relative bg-white p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-lg">
        <img
          src={agriIcon}
          alt="AgroTech Logo"
          className="absolute top-6 left-6 w-20 h-20 p-2"
        />

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-green-700">
            {t('signUp.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('signUp.description')}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        {step === 'form' ? (
          <form onSubmit={handleRequestOtp}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-2">
                {t('signUp.nameLabel')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                placeholder={t('signUp.namePlaceholder') as string}
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-800 mb-2">
                {t('signUp.phoneLabel')}
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                placeholder={t('signUp.phonePlaceholder') as string}
                required
              />
            </div>
            <div className="mb-8">
              <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-2">
                {t('signUp.emailLabel')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                placeholder={t('signUp.emailPlaceholder') as string}
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-2">
                {t('signUp.passwordLabel')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                placeholder={t('signUp.passwordPlaceholder') as string}
                required
              />
            </div>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 mb-6"
            >
              <option value="farmer">{t('signUp.roleFarmer')}</option>
              <option value="buyer">{t('signUp.roleBuyer')}</option>
            </select>
            <button
              type="submit"
              className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? '...' : t('signUp.createAccount')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <p className="text-center text-gray-600 mb-6">
              {t('signUp.sendOtpMessage')}
            </p>
            <div className="mb-6">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-800 mb-2">
                {t('signUp.enterOtpLabel')}
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-center tracking-widest text-xl"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? '...' : t('signUp.verifyButton')}
            </button>
          </form>
        )}

        <div className="text-center mt-6 text-sm text-gray-600">
          {t('signUp.alreadyAccount')}{' '}
          <Link to="/sign-in" className="font-medium text-green-600 hover:text-green-800 transition-colors duration-300 ml-1">
            {t('signUp.loginHere')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
