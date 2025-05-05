import React, { useState } from 'react';
import './SocialConnector.css';

function SocialConnector({ connectedProfiles, onProfileConnected, onContinue }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  
  // Plataformas suportadas
  const platforms = [
    { 
      id: 'twitter', 
      name: 'Twitter', 
      icon: '🐦', 
      description: 'Conecte sua conta do Twitter para analisarmos suas interações com times e eventos de eSports.'
    },
    { 
      id: 'facebook', 
      name: 'Facebook', 
      icon: '👤', 
      description: 'Conecte sua conta do Facebook para identificarmos páginas e grupos de eSports que você segue.'
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: '📸', 
      description: 'Conecte sua conta do Instagram para analisarmos seu engajamento com conteúdo de eSports.'
    },
    { 
      id: 'twitch', 
      name: 'Twitch', 
      icon: '🎮', 
      description: 'Conecte sua conta da Twitch para analisarmos suas preferências de streams e tempo de visualização.'
    }
  ];

  const connectPlatform = async (platform) => {
    setIsConnecting(true);
    setConnectionError(null);
    setSelectedPlatform(platform);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let profileData;
      
      switch (platform.id) {
        case 'twitter':
          profileData = {
            username: "fan_esports123",
            follower_count: 342,
            following_count: 567,
            following_teams: ["FURIA", "LOUD", "paiN Gaming"],
            engagement_score: 0.75,
            last_posts: [
              {"text": "Que jogo incrível da FURIA ontem! #GoFURIA", "date": "2025-04-20"},
              {"text": "Quem vai assistir a final da CBLOL hoje?", "date": "2025-04-15"}
            ]
          };
          break;
        case 'facebook':
          profileData = {
            name: "João Silva",
            liked_pages: ["FURIA Esports", "CBLOL", "League of Legends"],
            groups: ["Fãs de CS:GO Brasil", "VALORANT BR"],
            events_attended: ["CBLOL Finals 2024", "Game XP 2024"]
          };
          break;
        case 'instagram':
          profileData = {
            username: "esports_fan_br",
            following: ["furiagg", "loudgg", "cblol", "riotgamesbrasil"],
            engagement_posts: 12,
            tagged_locations: ["Allianz Parque", "Arena CBLOL"]
          };
          break;
        case 'twitch':
          profileData = {
            username: "furia_fan123",
            subscriptions: ["furiatv", "gaules", "loud_coringa"],
            watch_time: {
              "furiatv": 240,  // horas
              "gaules": 120,
              "cblol": 80
            },
            chat_activity: "high"
          };
          break;
        default:
          profileData = {};
      }
      
      // Notificar o componente pai sobre o perfil conectado
      onProfileConnected(platform.id, profileData);
      
    } catch (error) {
      setConnectionError(`Erro ao conectar com ${platform.name}. Por favor, tente novamente.`);
      console.error("Erro na conexão:", error);
    } finally {
      setIsConnecting(false);
      setSelectedPlatform(null);
    }
  };

  // Renderiza card para cada plataforma
  const renderPlatformCard = (platform) => {
    const isConnected = connectedProfiles && platform.id in connectedProfiles;
    
    return (
      <div 
        key={platform.id} 
        className={`platform-card ${isConnected ? 'connected' : ''}`}
      >
        <div className="platform-icon">{platform.icon}</div>
        <div className="platform-info">
          <h3>{platform.name}</h3>
          <p>{platform.description}</p>
        </div>
        <div className="platform-action">
          {isConnected ? (
            <div className="connected-badge">
              <span className="checkmark">✓</span>
              Conectado
            </div>
          ) : (
            <button 
              className="btn btn-connect"
              onClick={() => connectPlatform(platform)}
              disabled={isConnecting}
            >
              {isConnecting && selectedPlatform?.id === platform.id ? "Conectando..." : "Conectar"}
            </button>
          )}
        </div>
      </div>
    );
  };

  // Calcula quantas plataformas foram conectadas
  const connectedCount = connectedProfiles ? Object.keys(connectedProfiles).length : 0;

  return (
    <div className="social-connector-container">
      <h2>Conecte suas Redes Sociais</h2>
      <p className="section-description">
        Conecte suas redes sociais para enriquecer seu perfil de fã de eSports. 
        Analisaremos seu histórico de interações para personalizar sua experiência.
      </p>
      
      <div className="platform-cards">
        {platforms.map(renderPlatformCard)}
      </div>
      
      {connectionError && <p className="error-message">{connectionError}</p>}
      
      <div className="connection-summary">
        <p>{connectedCount} de {platforms.length} plataformas conectadas</p>
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${(connectedCount / platforms.length) * 100}%` }}
          ></div>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={onContinue}
          disabled={connectedCount === 0}
        >
          {connectedCount === 0 ? "Conecte pelo menos uma rede social" : "Continuar"}
        </button>
      </div>
    </div>
  );
}

export default SocialConnector;