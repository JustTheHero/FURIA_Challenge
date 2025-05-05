import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage({ onLogin, onBackToMain }) {
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    lembrar: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      setTimeout(() => {
        setLoading(false);
        if (onLogin) {
          onLogin(formData);
        }
      }, 1000);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Funcionalidade de recuperação de senha será implementada em breve.');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (onBackToMain) {
      onBackToMain();
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Know Your Fan</h2>
        <p>Acesse sua conta</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="seu@email.com"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="senha">Senha *</label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              className={errors.senha ? 'error' : ''}
              placeholder="Sua senha"
            />
            {errors.senha && <span className="error-message">{errors.senha}</span>}
          </div>
          
          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="lembrar"
                name="lembrar"
                checked={formData.lembrar}
                onChange={handleChange}
              />
              <label htmlFor="lembrar">Lembrar-me</label>
            </div>
            <a href="#" onClick={handleForgotPassword} className="forgot-password">
              Esqueceu a senha?
            </a>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
        
        <div className="register-link">
          <p>Não tem uma conta? <a href="#" onClick={handleRegister}>Cadastre-se</a></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;