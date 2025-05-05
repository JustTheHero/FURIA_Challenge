import React, { useState, useEffect } from 'react';
import './BasicInfoForm.css';

function BasicInfoForm({ initialData, onSave }) {
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    data_nascimento: '',
    endereco: {
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    },
    email: '',
    telefone: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validateCPF = (cpf) => {
    const cpfNumbers = cpf.replace(/\D/g, '');
    
    if (cpfNumbers.length !== 11) {
      return false;
    }
    

    return true;
  };
  
  const formatCPF = (cpf) => {
    const cpfNumbers = cpf.replace(/\D/g, '');
    if (cpfNumbers.length <= 3) {
      return cpfNumbers;
    } else if (cpfNumbers.length <= 6) {
      return `${cpfNumbers.slice(0, 3)}.${cpfNumbers.slice(3)}`;
    } else if (cpfNumbers.length <= 9) {
      return `${cpfNumbers.slice(0, 3)}.${cpfNumbers.slice(3, 6)}.${cpfNumbers.slice(6)}`;
    } else {
      return `${cpfNumbers.slice(0, 3)}.${cpfNumbers.slice(3, 6)}.${cpfNumbers.slice(6, 9)}-${cpfNumbers.slice(9, 11)}`;
    }
  };
  
  const formatCEP = (cep) => {
    const cepNumbers = cep.replace(/\D/g, '');
    if (cepNumbers.length <= 5) {
      return cepNumbers;
    } else {
      return `${cepNumbers.slice(0, 5)}-${cepNumbers.slice(5, 9)}`;
    }
  };
  
  const formatTelefone = (telefone) => {
    const telNumbers = telefone.replace(/\D/g, '');
    if (telNumbers.length <= 2) {
      return `(${telNumbers}`;
    } else if (telNumbers.length <= 6) {
      return `(${telNumbers.slice(0, 2)}) ${telNumbers.slice(2)}`;
    } else {
      return `(${telNumbers.slice(0, 2)}) ${telNumbers.slice(2, 7)}-${telNumbers.slice(7, 11)}`;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Formatação especial para CPF, CEP e telefone
    if (name === 'cpf') {
      setFormData({
        ...formData,
        [name]: formatCPF(value)
      });
    } else if (name === 'endereco.cep') {
      const formattedCep = formatCEP(value);
      setFormData({
        ...formData,
        endereco: {
          ...formData.endereco,
          cep: formattedCep
        }
      });
      
      if (value.replace(/\D/g, '').length === 8) {
        fetchAddressByCEP(value);
      }
    } else if (name === 'telefone') {
      setFormData({
        ...formData,
        [name]: formatTelefone(value)
      });
    } else if (name.startsWith('endereco.')) {
      const enderecoField = name.split('.')[1];
      setFormData({
        ...formData,
        endereco: {
          ...formData.endereco,
          [enderecoField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const fetchAddressByCEP = async (cep) => {
    const cepNumbers = cep.replace(/\D/g, '');
    const cepNumbers2 = cep.slice(0, 5) + '' + cep.slice(5);
    
    if (cepNumbers.length !== 8) {
      return;
    }
    
    setLoading(true);
    
    try {

      
      // Usando a API pública do ViaCEP 
      const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar CEP');
      }
      
      const data = await response.json();
      
      // Verificar se houve erro na consulta do CEP
      if (data.erro) {
        setErrors({
          ...errors,
          'endereco.cep': 'CEP não encontrado'
        });
        return;
      }
      
      // Atualizar o formulário com os dados recebidos
      setFormData({
        ...formData,
        endereco: {
          ...formData.endereco,
          rua: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || '',
          cep: cepNumbers2 
        }
      });
      
      if (errors['endereco.cep']) {
        const newErrors = {...errors};
        delete newErrors['endereco.cep'];
        setErrors(newErrors);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setErrors({
        ...errors,
        'endereco.cep': 'Erro ao buscar CEP. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar campos obrigatórios
    if (!formData.nome_completo) {
      newErrors.nome_completo = 'Nome completo é obrigatório';
    }
    
    if (!formData.cpf) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    
    if (!formData.data_nascimento) {
      newErrors.data_nascimento = 'Data de nascimento é obrigatória';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Validar campos de endereço
    if (!formData.endereco.rua) {
      newErrors['endereco.rua'] = 'Rua é obrigatória';
    }
    
    if (!formData.endereco.cidade) {
      newErrors['endereco.cidade'] = 'Cidade é obrigatória';
    }
    
    if (!formData.endereco.estado) {
      newErrors['endereco.estado'] = 'Estado é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="basic-info-form">
      <h2>Informações Básicas</h2>
      <p>Por favor, forneça seus dados para iniciar o cadastro.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nome_completo">Nome Completo *</label>
          <input
            type="text"
            id="nome_completo"
            name="nome_completo"
            value={formData.nome_completo}
            onChange={handleChange}
            className={errors.nome_completo ? 'error' : ''}
          />
          {errors.nome_completo && <span className="error-message">{errors.nome_completo}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="cpf">CPF *</label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            className={errors.cpf ? 'error' : ''}
            maxLength={14}
          />
          {errors.cpf && <span className="error-message">{errors.cpf}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="data_nascimento">Data de Nascimento *</label>
          <input
            type="date"
            id="data_nascimento"
            name="data_nascimento"
            value={formData.data_nascimento}
            onChange={handleChange}
            className={errors.data_nascimento ? 'error' : ''}
          />
          {errors.data_nascimento && <span className="error-message">{errors.data_nascimento}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="telefone">Telefone</label>
          <input
            type="text"
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            maxLength={15}
          />
        </div>
        
        <h3>Endereço</h3>
        
        <div className="address-container">
          <div className="form-group">
            <label htmlFor="endereco.cep">CEP</label>
            <div className="input-with-status">
              <input
                type="text"
                id="endereco.cep"
                name="endereco.cep"
                value={formData.endereco.cep}
                onChange={handleChange}
                className={errors['endereco.cep'] ? 'error' : ''}
                maxLength={9}
                placeholder="00000-000"
              />
              {loading && <span className="loading-indicator">Buscando...</span>}
            </div>
            {errors['endereco.cep'] && <span className="error-message">{errors['endereco.cep']}</span>}
            <small className="help-text">Digite o CEP para buscar o endereço</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="endereco.rua">Rua *</label>
            <input
              type="text"
              id="endereco.rua"
              name="endereco.rua"
              value={formData.endereco.rua}
              onChange={handleChange}
              className={errors['endereco.rua'] ? 'error' : ''}
            />
            {errors['endereco.rua'] && <span className="error-message">{errors['endereco.rua']}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="endereco.numero">Número</label>
              <input
                type="text"
                id="endereco.numero"
                name="endereco.numero"
                value={formData.endereco.numero}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endereco.complemento">Complemento</label>
              <input
                type="text"
                id="endereco.complemento"
                name="endereco.complemento"
                value={formData.endereco.complemento}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="endereco.bairro">Bairro</label>
            <input
              type="text"
              id="endereco.bairro"
              name="endereco.bairro"
              value={formData.endereco.bairro}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="endereco.cidade">Cidade *</label>
              <input
                type="text"
                id="endereco.cidade"
                name="endereco.cidade"
                value={formData.endereco.cidade}
                onChange={handleChange}
                className={errors['endereco.cidade'] ? 'error' : ''}
              />
              {errors['endereco.cidade'] && <span className="error-message">{errors['endereco.cidade']}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="endereco.estado">Estado *</label>
              <select
                id="endereco.estado"
                name="endereco.estado"
                value={formData.endereco.estado}
                onChange={handleChange}
                className={errors['endereco.estado'] ? 'error' : ''}
              >
                <option value="">Selecione...</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
              {errors['endereco.estado'] && <span className="error-message">{errors['endereco.estado']}</span>}
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Salvar e Continuar</button>
        </div>
      </form>
    </div>
  );
}

export default BasicInfoForm;