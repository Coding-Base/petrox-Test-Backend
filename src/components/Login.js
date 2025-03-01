import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // Updated import for styles

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        'https://petroxtestbackend.onrender.com/api/token/',
        { username, password }
      );
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      // Save the username to localStorage so it can be used by other components
      localStorage.setItem('username', username);
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.access;
      navigate('/dashboard');
    } catch (error) {
      alert('Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              color: "#fff",
              fontSize: "2rem",
              fontWeight: "bold",
            }}
          >
            Loading...
          </div>
        </div>
      )}
      <div className="background-shapes">
        <div className="circle yellow"></div>
        <div className="circle blue"></div>
        <div className="triangle"></div>
        <div className="square"></div>
      </div>
      <div className="login-box">
        <h2 className="login-title">Sign In</h2>
        <p className="login-subtitle">
          By using our services, you are agreeing to our <br />
          <a href="#home">Terms and Privacy Statement</a>.
        </p>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="login-button" type="submit">
            Login
          </button>
        </form>
        <p className="login-footer">
          New here? <Link to="/">Create an account</Link> in!!!
        </p>
      </div>
    </div>
  );
};

export default Login;
