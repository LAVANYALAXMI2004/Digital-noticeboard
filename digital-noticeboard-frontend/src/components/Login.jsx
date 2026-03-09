import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const users = JSON.parse(process.env.REACT_APP_USERS);

const AdminLogin = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      setError("");
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("currentUser", JSON.stringify(user));
      navigate("/admin");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <>
      <style>{`
        /* Reset & base */
        * {
          box-sizing: border-box;
        }
        body, html, #root {
          height: 100%;
          margin: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #fff;
        }

        .login-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          padding: 40px 50px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
          animation: fadeInUp 0.8s ease forwards;
          text-align: center;
        }

        @media (max-width: 1400px), (max-height: 800px) {
          .login-container {
            padding: 24px 18px;
            border-radius: 14px;
            max-width: 320px;
          }
          .login-title {
            font-size: 2rem;
            margin-bottom: 18px;
          }
        }

        @media (max-width: 1280px), (max-height: 720px) {
          .login-container {
            padding: 10px 6px;
            border-radius: 8px;
            max-width: 220px;
          }
          .login-title {
            font-size: 1.2rem;
            margin-bottom: 10px;
          }
          .login-form input, .login-form button {
            font-size: 0.85rem;
            padding: 6px 8px;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-title {
          font-size: 2.5rem;
          margin-bottom: 30px;
          font-weight: 900;
          letter-spacing: 2px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }

        form {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        label {
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 1rem;
          color: #080808ff;
          user-select: none;
        }

        input[type="email"],
        input[type="password"] {
          padding: 14px 18px;
          margin-bottom: 25px;
          border-radius: 12px;
          border: none;
          font-size: 1rem;
          transition: box-shadow 0.3s ease, background-color 0.3s ease;
          background: rgba(2, 2, 2, 0.05);
          color: #242424ff;
          box-shadow: inset 0 0 5px rgba(255,255,255,0.2);
        }

        input::placeholder {
          color: #999494ff;
          font-style: italic;
        }

        input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.3);
          box-shadow: 0 0 8px 3px #7c7c7cff;
          color: #5c5c5cff;
        }

        .error-message {
          background: #ff4d6d;
          padding: 12px 15px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-weight: 700;
          text-align: center;
          box-shadow: 0 4px 15px rgba(255, 77, 109, 0.6);
          user-select: none;
        }

        .btn-login {
          background: linear-gradient(45deg, #262627ff, #0f0f0fff);
          border: none;
          border-radius: 15px;
          padding: 16px 0;
          font-size: 1.2rem;
          font-weight: 900;
          color: white;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(65, 62, 62, 0.6);
          transition: background 0.4s ease, box-shadow 0.4s ease;
          user-select: none;
        }

        .btn-login:hover,
        .btn-login:focus {
          background: linear-gradient(45deg, #585858ff, #222222ff);
          box-shadow: 0 12px 30px rgba(97, 97, 97, 0.8);
          outline: none;
        }

        .footer-text {
          margin-top: 30px;
          font-size: 0.9rem;
          color: #3f3f3fff;
          user-select: none;
          text-align: center;
          font-style: italic;
          letter-spacing: 0.05em;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .login-container {
            padding: 30px 25px;
            width: 90%;
          }
          .login-title {
            font-size: 2rem;
          }
          input[type="email"],
          input[type="password"] {
            font-size: 0.9rem;
          }
          .btn-login {
            font-size: 1rem;
            padding: 14px 0;
          }
        }
      `}</style>

      <div className="login-container" role="main" aria-label="Admin login form">
        <h1 className="login-title">
          <img src="http://ngpdnb.infaverse.com/uploads/admin_logo_black.png"
            alt="Admin Logo" style={{ width: 'auto', height: '50px' }}
          />
        </h1>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-required="true"
            autoComplete="username"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-required="true"
            autoComplete="current-password"
          />

          {error && <div className="error-message" role="alert">{error}</div>}

          <button type="submit" className="btn-login" aria-label="Log in as admin">
            Log In
          </button>
        </form>
        <div className="footer-text" aria-live="polite">
          &copy; Dr. NGP iTECH DEPT. OF CSE x INFANJI E-Cell 2026 NGPDNB Admin Dashboard
        </div>
      </div>
    </>
  );
};

export default AdminLogin;