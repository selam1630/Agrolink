import React, { useState } from 'react';
import agriIcon from '@/assets/images/agriIcon.png';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface FormData {
  name: string;
  phoneNumber: string;
  email: string;
  password: string;
  role?: string;
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      phone: formData.phoneNumber,
      email: formData.email,
      password: formData.password,
      role: formData.role || 'farmer'
    };

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        alert(t('signUp.registrationSuccess'));
        console.log('Backend response:', data);
      } else {
        alert(`${t('signUp.registrationFailed')}: ${data.error || t('signUp.unknownError')}`);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert(t('signUp.networkError'));
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

        <form onSubmit={handleSubmit}>
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
              placeholder={t('signUp.namePlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
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
              placeholder={t('signUp.phonePlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
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
              placeholder={t('signUp.emailPlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
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
              placeholder={t('signUp.passwordPlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
          >
            <option value="">{t('signUp.roleSelect')}</option>
            <option value="farmer">{t('signUp.roleFarmer')}</option>
            <option value="buyer">{t('signUp.roleBuyer')}</option>
          </select>

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-bold py-3 px-4 mt-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300"
          >
            {t('signUp.createAccount')}
          </button>
        </form>

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
