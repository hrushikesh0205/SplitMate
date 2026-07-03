import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import useAuth from '../hooks/useAuth.js';
import { loginApi } from '../api/authApi.js';
import '../styles/auth-new.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginApi(formData);
      login(data);
      toast.success(`Welcome back, ${data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='auth-page'>
      <div className='auth-container'>
        {/* Sidebar */}
        <div className='auth-sidebar'>
          <div className='auth-brand-section'>
            <div className='auth-logo-box'>
              <span>💸</span>
            </div>
            <h1 className='text-brand'>SplitMate</h1>
            <p>Smart expense management</p>
          </div>

          <div className='auth-benefits'>
            <div className='benefit-item'>
              <div className='benefit-icon'>⚡</div>
              <div>
                <h4>Track Instantly</h4>
                <p>See who owes what in real-time</p>
              </div>
            </div>
            <div className='benefit-item'>
              <div className='benefit-icon'>💡</div>
              <div>
                <h4>Settle Smart</h4>
                <p>One-click debt settlement</p>
              </div>
            </div>
            <div className='benefit-item'>
              <div className='benefit-icon'>📢</div>
              <div>
                <h4>Stay Updated</h4>
                <p>Real-time notifications</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className='auth-form-section'>
          <div className='auth-form-header'>
            <h2>Welcome Back 👋</h2>
            <p>Sign in to manage your expenses</p>
          </div>

          <form onSubmit={handleSubmit} className='auth-form'>
            {/* Email Field */}
            <div className='form-field'>
              <label>Email Address</label>
              <div className='input-wrapper'>
                <Mail size={18} className='input-icon' />
                <input
                  type='email'
                  name='email'
                  placeholder='you@example.com'
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className='form-field'>
              <label>Password</label>
              <div className='input-wrapper'>
                <Lock size={18} className='input-icon' />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  placeholder='Enter your password'
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type='button'
                  className='input-toggle'
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div style={{ textAlign: 'right', marginBottom: 'var(--space-4)' }}>
              <Link
                to='/forgot-password'
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              className='auth-submit-btn'
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className='btn-loader'></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className='auth-divider'>Don't have an account?</div>

          {/* Link to Register */}
          <p className='auth-terms'>
            <Link to='/register'>Create one here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;