import React, { useState } from 'react';
import LiquidChrome from '../LiquidChrome';
function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isSignup ? 'http://localhost:5000/signup' : 'http://localhost:5000/login';

    const bodyData = isSignup
      ? { username: name, email, password }
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(isSignup ? 'Signup successful! Please log in.' : 'Login successful!');

        if (!isSignup) {
          // Store user info in localStorage
          localStorage.setItem('user', JSON.stringify(data.user));

          // Notify parent
          onLogin(data.user);
        } else {
          setIsSignup(false);
        }
      } else {
        setMessage(data.error || 'Authentication failed.');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  return (
    
    <div style={styles.container}>
      <LiquidChrome></LiquidChrome> 
      <form onSubmit={handleAuth} style={styles.box}>
        <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>

        {isSignup && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={styles.input}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          {isSignup ? 'Sign Up' : 'Login'}
        </button>

        <p style={styles.message}>{message}</p>

        <p>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setMessage('');
            }}
            style={styles.linkButton}
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    

    padding: '20px',
  },
  box: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px',
     background: 'rgba(0, 123, 255, 0.3)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'black',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  message: {
    color: 'red',
    marginTop: '10px',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: 'black',
    textwidth:"200px",
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '14px',
  },
};

export default Login;
