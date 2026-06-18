import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth.js';
import { registerApi } from '../api/authApi.js';
import '../styles/auth.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      const data = await registerApi({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      login(data);
      toast.success(`Welcome to SplitMate, ${data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
        <h2>Join thousands splitting expenses the smart way</h2>
        <ul className='auth-features'>
          <li>✅ Free forever for personal use</li>
          <li>✅ Create unlimited groups</li>
          <li>✅ Smart debt simplification</li>
          <li>✅ Real-time notifications</li>
        </ul>
      </div>

      <div className='auth-right'>
        <div className='auth-card'>
          <h2>Create Account </h2>
          <p className='auth-subtitle'>Start splitting expenses for free</p>

          <form onSubmit={handleSubmit}>
            <div className='form-group'>
              <label>Full Name</label>
              <input
                type='text'
                name='name'
                placeholder='User'
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

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
                placeholder='Min 6 characters'
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className='form-group'>
              <label>Confirm Password</label>
              <input
                type='password'
                name='confirmPassword'
                placeholder='Repeat your password'
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type='submit'
              className='btn btn-primary btn-full'
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className='auth-switch'>
            Already have an account?{' '}
            <Link to='/login'>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;