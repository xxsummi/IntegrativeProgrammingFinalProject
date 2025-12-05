import React, { useState } from 'react'
import { PiCoffeeFill } from "react-icons/pi";
import { MdLock, MdCheckCircle, MdError } from "react-icons/md";
import apiService from '../services/api';
import './Login.css'

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await apiService.login(email, password);
      setMessage(`Welcome back, ${response.user.name}! Login successful.`);
      setIsSuccess(true);
      
      // Clear form after successful login
      setEmail('');
      setPassword('');
      
      // Call the login success callback after a delay
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        console.log('User logged in:', response.user);
      }, 2000);
      
    } catch (error) {
      setMessage(error.message || 'Login failed. Please check your credentials.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='wrapper'>
        <form onSubmit={handleSubmit}>
            <h1>Login</h1>
            
            {/* Success/Error Message */}
            {message && (
              <div className={`message ${isSuccess ? 'success' : 'error'}`}>
                {isSuccess ? <MdCheckCircle /> : <MdError />}
                <span>{message}</span>
              </div>
            )}
            
            <div className="input-box">
                <input 
                  type="email" 
                  placeholder='Email' 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <PiCoffeeFill className='icon'/>
            </div>
            <div className="input-box">
                <input 
                  type="password" 
                  placeholder='Password' 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <MdLock className='icon'/>
            </div>
            <div className="remeber-forgot">
                <label><input type="checkbox" /> Remember me</label>
                <a href="#">Forgot password?</a>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <div className="register-link">
                <p>Don't have an account? <a href="#">Register</a></p>
            </div>
        </form>
    </div>
  )
}

export default Login