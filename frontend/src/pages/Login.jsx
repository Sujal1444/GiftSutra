import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.svg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState(null);
  const [forgotError, setForgotError] = useState(null);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [error, setError] = useState(null);

  const { login, forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const openForgotPassword = () => {
    setIsForgotOpen(true);
    setForgotEmail(email);
    setForgotError(null);
    setForgotMessage(null);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError(null);
    setForgotMessage(null);
    setIsSendingReset(true);

    try {
      const response = await forgotPassword(forgotEmail);
      setForgotMessage(response.message);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Unable to send reset email');
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-purple-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-purple-100">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="GiftSutra" className="h-20 w-auto" />
        </div>
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-8">Welcome Back</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="********"
            />
            <button
              type="button"
              onClick={openForgotPassword}
              className="mt-2 text-sm font-medium text-purple-600 hover:text-purple-500"
            >
              Forgot password?
            </button>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium text-purple-600 hover:text-purple-500">
            Sign up now
          </Link>
        </p>
      </div>

      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-purple-800">Reset your password</h3>
              <p className="mt-2 text-sm text-gray-600">
                Enter your email address and we&apos;ll send you a reset link.
              </p>
            </div>

            {forgotMessage && <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{forgotMessage}</p>}
            {forgotError && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{forgotError}</p>}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="you@example.com"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="flex-1 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSendingReset ? 'Sending...' : 'Send reset link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
