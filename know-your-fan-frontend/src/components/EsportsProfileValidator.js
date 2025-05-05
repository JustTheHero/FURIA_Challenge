import React, { useState } from 'react';
import './EsportsProfileValidator.css';

function EsportsProfileValidator({ validatedProfiles, onProfileValidated, onContinue }) {
  const [profileUrl, setProfileUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);
  
  const supportedPlatforms = [
    { 
      id: 'faceit', 
      name: 'FACEIT', 
      domain: 'faceit.com', 
      example: 'https://faceit.com/en/players/seu-username'
    },
    { 
      id: 'steam', 
      name: 'Steam', 
      domain: 'steamcommunity.com', 
      example: 'https://steamcommunity.com/id/seu-username'
    },
    { 
      id: 'trackergg', 
      name: 'Tracker.gg', 
      domain: 'tracker.gg', 
      example: 'https://tracker.gg/valorant/profile/riot/seu-username/overview'
    }
  ];

  const isValidUrl = (url) => {
    try {
      const parsedUrl = new URL(url);
      return supportedPlatforms.some(platform => url.includes(platform.domain));
    } catch (e) {
      return false;
    }
  };

  // Função para lidar com mudança na URL
  const handleUrlChange = (e) => {
    setProfileUrl(e.target.value);
    setError(null);
    setValidationResult(null);
  };

  // Função para enviar URL para validação
  const handleValidateProfile = async () => {
    // Verificar se URL é válida
    if (!profileUrl.trim()) {
      setError("Por favor, insira uma URL de perfil");
      return;
    }
    
    if (!isValidUrl(profileUrl)) {
      setError("URL inválida ou plataforma não suportada");
      return;
    }
    
    setIsValidating(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const platform = supportedPlatforms.find(p => profileUrl.includes(p.domain));
      
      let result;
      
      if (platform.id === 'faceit') {
        result = {
          url: profileUrl,
          platform: "FACEIT",
          username: "furia_fan123",
          game: "CS:GO",
          level: 8,
          matches: 542,
          win_rate: 53.2,
          relevance_score: 0.92,
          ownership_probability: 0.85,
          validated: true,
          validation_date: new Date().toISOString()
        };
      } else if (platform.id === 'steam') {
        result = {
          url: profileUrl,
          platform: "Steam",
          username: "furiafan_br",
          games: ["Counter-Strike 2", "VALORANT", "Dota 2", "Apex Legends"],
          hours_played: {
            "Counter-Strike 2": 1240,
            "VALORANT": 560,
            "Dota 2": 120
          },
          relevance_score: 0.86,
          ownership_probability: 0.78,
          validated: true,
          validation_date: new Date().toISOString()
        };
      } else if (platform.id === 'trackergg') {
        result = {
          url: profileUrl,
          platform: "Tracker.gg",
          game: "VALORANT",
          rank: "Diamond 2",
          win_rate: 51.8,
          top_agents: ["Jett", "Reyna", "Omen"],
          matches: 234,
          relevance_score: 0.88,
          ownership_probability: 0.82,
          validated: true,
          validation_date: new Date().toISOString()
        };
      }
      
      setValidationResult(result);
      
      if (result.validated) {
        onProfileValidated(result);
      }
      
    } catch (error) {
      setError("Ocorreu um erro durante a validação do perfil. Por favor, tente novamente.");
      console.error("Erro na validação:", error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    setProfileUrl('');
    setValidationResult(null);
    setError(null);
  };

  // Função para renderizar estatísticas específicas da plataforma
  const renderPlatformStats = (result) => {
    switch (result.platform) {
      case 'FACEIT':
        return (
          <>
            <div className="stat-item">
              <span className="stat-label">Jogo:</span>
              <span className="stat-value">{result.game}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Nível:</span>
              <span className="stat-value">{result.level}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Partidas:</span>
              <span className="stat-value">{result.matches}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Taxa de vitória:</span>
              <span className="stat-value">{result.win_rate}%</span>
            </div>
          </>
        );
      case 'Steam':
        return (
          <>
            <div className="stat-item">
              <span className="stat-label">Jogos:</span>
              <span className="stat-value">{result.games.join(', ')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Horas jogadas (CS2):</span>
              <span className="stat-value">{result.hours_played['Counter-Strike 2']}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Horas jogadas (VALORANT):</span>
              <span className="stat-value">{result.hours_played['VALORANT']}</span>
            </div>
          </>
        );
      case 'Tracker.gg':
        return (
          <>
            <div className="stat-item">
              <span className="stat-label">Jogo:</span>
              <span className="stat-value">{result.game}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rank:</span>
              <span className="stat-value">{result.rank}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Agentes favoritos:</span>
              <span className="stat-value">{result.top_agents.join(', ')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Taxa de vitória:</span>
              <span className="stat-value">{result.win_rate}%</span>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="esports-profile-validator-container">
      <h2>Validação de Perfil de eSports</h2>
      
      <div className="section-description">
        <p>
          Adicione URLs dos seus perfis em plataformas de eSports para validação.
          Isso nos ajudará a entender melhor seu nível de engajamento e experiência.
        </p>
      </div>
      
      <div className="supported-platforms">
        <h3>Plataformas suportadas:</h3>
        <ul className="platform-list">
          {supportedPlatforms.map(platform => (
            <li key={platform.id} className="platform-item">
              <div className="platform-name">{platform.name}</div>
              <div className="platform-example">Exemplo: <code>{platform.example}</code></div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="validation-form">
        <div className="input-group">
          <label htmlFor="profile-url">URL do Perfil:</label>
          <input
            type="url"
            id="profile-url"
            value={profileUrl}
            onChange={handleUrlChange}
            placeholder="https://faceit.com/en/players/seu-username"
            className="url-input"
            disabled={isValidating}
          />
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="button-container">
          <button
            className="btn btn-primary"
            onClick={handleValidateProfile}
            disabled={!profileUrl.trim() || isValidating}
          >
            {isValidating ? "Validando..." : "Validar Perfil"}
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={handleClear}
            disabled={!profileUrl.trim() || isValidating}
          >
            Limpar
          </button>
        </div>
      </div>
      
      {validationResult && (
        <div className={`validation-result ${validationResult.validated ? 'success' : 'failure'}`}>
          <h3>Resultado da Validação</h3>
          
          <div className="result-summary">
            <div className={`validation-status ${validationResult.validated ? 'valid' : 'invalid'}`}>
              {validationResult.validated ? "✅ Perfil Validado" : "❌ Validação Falhou"}
            </div>
            
            <div className="profile-details">
              <div className="stat-item">
                <span className="stat-label">Plataforma:</span>
                <span className="stat-value">{validationResult.platform}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Usuário:</span>
                <span className="stat-value">{validationResult.username}</span>
              </div>
              
              {renderPlatformStats(validationResult)}
              
              <div className="stat-item">
                <span className="stat-label">Relevância para eSports:</span>
                <span className="stat-value">{Math.round(validationResult.relevance_score * 100)}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Probabilidade de propriedade:</span>
                <span className="stat-value">{Math.round(validationResult.ownership_probability * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="validated-profiles-section">
        <h3>Perfis Validados ({validatedProfiles.length})</h3>
        
        {validatedProfiles.length > 0 ? (
          <ul className="validated-profiles-list">
            {validatedProfiles.map((profile, index) => (
              <li key={index} className="validated-profile-item">
                <div className="profile-platform">{profile.platform}</div>
                <div className="profile-username">{profile.username || profile.game}</div>
                <div className="validation-date">
                  Validado em: {new Date(profile.validation_date).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-profiles-message">Nenhum perfil validado ainda.</p>
        )}
      </div>
      
      <div className="navigation-section">
        <button
          className="btn btn-primary"
          onClick={onContinue}
        >
          Continuar
        </button>
        <p className="note">
          <strong>Nota:</strong> Você pode continuar sem validar perfis, mas a validação enriquece seu perfil de fã.
        </p>
      </div>
    </div>
  );
}

export default EsportsProfileValidator;