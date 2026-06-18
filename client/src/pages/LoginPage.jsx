import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth.js';
import { loginApi } from '../api/authApi.js';
import '../styles/auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

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
    <div className='auth-wrapper'>
      <div className='auth-left'>
        <div className='auth-brand'>
          <span className='auth-logo'>💸</span>
          <h1>SplitMate</h1>
        </div>
        <h2>Split expenses effortlessly with friends & groups</h2>
        <ul className='auth-features'>
          <li>✅ Track shared expenses instantly</li>
          <li>✅ Settle debts with one click</li>
          <li>✅ Real-time notifications</li>
          <li>✅ Smart debt simplification</li>
        </ul>
      </div>

      <div className='auth-right'>
        <div className='auth-card'>
          <h2>Welcome Back! 👋</h2>
          <p className='auth-subtitle'>Login to your account</p>

          <form onSubmit={handleSubmit}>
            <div className='form-group'>
              <label>Email</label>
              <input
                type='email'
                name='email'
                placeholder='user@gmail.com'
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className='form-group'>
              <label>Password</label>
              <input
                type='password'
                name='password'
                placeholder='Enter your password'
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className='auth-forgot'>
              <Link to='/forgot-password'>Forgot password?</Link>
            </div>

            <button
              type='submit'
              className='btn btn-primary btn-full'
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className='auth-switch'>
            Don't have an account?{' '}
            <Link to='/register'>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;