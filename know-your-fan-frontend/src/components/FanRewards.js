import React, { useState } from 'react';
import './FanRewards.css';

/**
 * Componente que exibe recompensas, eventos e oportunidades para fãs com base na pontuação
 * 
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.userData - Dados completos do usuário
 * @param {Function} props.onBack - Função para voltar à tela anterior
 */
const FanRewards = ({ userData, onBack }) => {
  const [activeTab, setActiveTab] = useState('all');
  
  // Calculando a pontuação geral com base nos dados do usuário
  const calculateOverallScore = () => {
    return Math.min(10, (userData.validatedProfiles?.length || 0) * 2 + 
      Object.keys(userData.socialProfiles || {}).length * 1.5);
  };
  
  const overallScore = calculateOverallScore();
  
  // Função para determinar o nível do fã baseado na pontuação
  const getFanLevel = (score) => {
    if (score >= 8) return { level: "Super Fã", class: "super-fan", tier: 4 };
    if (score >= 6) return { level: "Fã Dedicado", class: "dedicated-fan", tier: 3 };
    if (score >= 4) return { level: "Fã Regular", class: "regular-fan", tier: 2 };
    return { level: "Fã Casual", class: "casual-fan", tier: 1 };
  };
  
  const fanLevel = getFanLevel(overallScore);
  
  const rewardsData = [
    {
      id: 1,
      title: "Acesso VIP - Liga Alpha 2025",
      description: "Ingressos exclusivos para os playoffs da Liga Alpha",
      requiredTier: 4,
      category: "event",
      date: "20/06/2025",
      location: "Arena Esportiva Central",
      image: "tournament.jpg",
      isUnlocked: fanLevel.tier >= 4
    },
    {
      id: 2,
      title: "Sorteio Mensal de Periféricos",
      description: "Concorra a headsets, teclados e mouses de última geração",
      requiredTier: 2,
      category: "raffle",
      endDate: "15/05/2025",
      prizes: ["Teclado Mecânico Pro X", "Headset 7.1 Ultimate"],
      image: "peripherals.jpg",
      isUnlocked: fanLevel.tier >= 2
    },
    {
      id: 3,
      title: "Meet & Greet com Team FURIA",
      description: "Encontro exclusivo com os jogadores do Team FURIA",
      requiredTier: 3,
      category: "event",
      date: "12/05/2025",
      location: "Centro de Treinamento FURIA",
      image: "team_meeting.jpg",
      isUnlocked: fanLevel.tier >= 3
    },
    {
      id: 4,
      title: "Beta Test - Próximo Lançamento AAA",
      description: "Teste em primeira mão o próximo grande lançamento",
      requiredTier: 3,
      category: "opportunity",
      deadline: "25/05/2025",
      publisher: "NextGen Games",
      image: "beta_game.jpg",
      isUnlocked: fanLevel.tier >= 3
    },
    {
      id: 5,
      title: "Sorteio de Camisetas Oficiais",
      description: "Concorra a camisetas autografadas dos times da Liga",
      requiredTier: 1,
      category: "raffle",
      endDate: "10/05/2025",
      prizes: ["Camiseta Team FURIA", "Camiseta Team Furia LoL"],
      image: "jerseys.jpg",
      isUnlocked: fanLevel.tier >= 1
    },
    {
      id: 6,
      title: "Desconto na Loja Oficial",
      description: "15% de desconto em toda a loja oficial de merchandise",
      requiredTier: 1,
      category: "benefit",
      validUntil: "31/12/2025",
      image: "store.jpg",
      isUnlocked: fanLevel.tier >= 1
    },
    {
      id: 7,
      title: "Programa de Embaixadores",
      description: "Seja um embaixador oficial e receba produtos para análise",
      requiredTier: 4,
      category: "opportunity",
      deadline: "Contínuo",
      benefits: ["Produtos gratuitos", "Convites para eventos exclusivos"],
      image: "ambassador.jpg",
      isUnlocked: fanLevel.tier >= 4
    },
    {
      id: 8,
      title: "Workshop de Streaming",
      description: "Aprenda técnicas avançadas com streamers profissionais",
      requiredTier: 2,
      category: "event",
      date: "05/06/2025",
      location: "Online",
      image: "streaming.jpg",
      isUnlocked: fanLevel.tier >= 2
    }
  ];
  
  // Filtrar recompensas por categoria selecionada
  const filteredRewards = rewardsData.filter(reward => {
    if (activeTab === 'all') return true;
    return reward.category === activeTab;
  });
  
  const renderRewardCard = (reward) => {
    return (
      <div key={reward.id} className={`reward-card ${reward.isUnlocked ? 'unlocked' : 'locked'}`}>
        <div className="reward-card-image">
          <div className="image-placeholder"></div>
          {!reward.isUnlocked && (
            <div className="locked-overlay">
              <i className="fas fa-lock"></i>
            </div>
          )}
          <div className={`reward-category ${reward.category}`}>
            {getCategoryLabel(reward.category)}
          </div>
        </div>
        
        <div className="reward-card-content">
          <h3>{reward.title}</h3>
          <p className="reward-description">{reward.description}</p>
          
          <div className="reward-details">
            {reward.date && (
              <div className="detail-item">
                <i className="far fa-calendar"></i>
                <span>{reward.date}</span>
              </div>
            )}
            
            {reward.endDate && (
              <div className="detail-item">
                <i className="far fa-clock"></i>
                <span>Encerra em: {reward.endDate}</span>
              </div>
            )}
            
            {reward.location && (
              <div className="detail-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>{reward.location}</span>
              </div>
            )}
          </div>
          
          {renderActionButton(reward)}
        </div>
        
        {!reward.isUnlocked && (
          <div className="tier-required">
            <span>Nível requerido: {getTierLabel(reward.requiredTier)}</span>
          </div>
        )}
      </div>
    );
  };
  
  // Função para renderizar botão de ação baseado no tipo de recompensa
  const renderActionButton = (reward) => {
    if (!reward.isUnlocked) {
      return (
        <button className="btn btn-disabled">
          Bloqueado
        </button>
      );
    }
    
    switch (reward.category) {
      case 'raffle':
        return (
          <button className="btn btn-primary">
            Participar do Sorteio
          </button>
        );
      case 'event':
        return (
          <button className="btn btn-primary">
            Garantir Presença
          </button>
        );
      case 'opportunity':
        return (
          <button className="btn btn-primary">
            Candidatar-se
          </button>
        );
      case 'benefit':
        return (
          <button className="btn btn-primary">
            Resgatar Benefício
          </button>
        );
      default:
        return (
          <button className="btn btn-primary">
            Ver Detalhes
          </button>
        );
    }
  };
  
  // Funções auxiliares para labels
  const getCategoryLabel = (category) => {
    const labels = {
      'event': 'Evento',
      'raffle': 'Sorteio',
      'opportunity': 'Oportunidade',
      'benefit': 'Benefício'
    };
    
    return labels[category] || 'Recompensa';
  };
  
  const getTierLabel = (tier) => {
    const labels = {
      1: 'Fã Casual',
      2: 'Fã Regular',
      3: 'Fã Dedicado',
      4: 'Super Fã'
    };
    
    return labels[tier] || 'Desconhecido';
  };
  
  return (
    <div className="fan-rewards-container">
      <div className="rewards-header">
        <div className="header-back-button">
          <button className="btn-back" onClick={onBack}>
            <i className="fas fa-arrow-left"></i> Voltar ao Perfil
          </button>
        </div>
        
        <h2>Recompensas e Oportunidades</h2>
        
        <div className="fan-status-summary">
          <div className={`fan-level-badge ${fanLevel.class}`}>
            <span>{fanLevel.level}</span>
          </div>
          
          <div className="score-display">
            <div className="score-value">{overallScore.toFixed(1)}</div>
            <div className="score-max">/10</div>
          </div>
        </div>
        
        <div className="progress-to-next">
          {fanLevel.tier < 4 ? (
            <>
              <div className="next-level-progress">
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${(overallScore % 2) * 50}%` }}
                  ></div>
                </div>
                <div className="progress-label">
                  Próximo nível: {getTierLabel(fanLevel.tier + 1)}
                </div>
              </div>
              <div className="upgrade-tip">
                <i className="fas fa-lightbulb"></i>
                <span>Conecte mais perfis sociais e valide suas contas de jogos para aumentar sua pontuação</span>
              </div>
            </>
          ) : (
            <div className="max-level-reached">
              <i className="fas fa-trophy"></i>
              <span>Você atingiu o nível máximo de fã!</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="rewards-filter-tabs">
        <button 
          className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Todos
        </button>
        <button 
          className={`filter-tab ${activeTab === 'event' ? 'active' : ''}`}
          onClick={() => setActiveTab('event')}
        >
          Eventos
        </button>
        <button 
          className={`filter-tab ${activeTab === 'raffle' ? 'active' : ''}`}
          onClick={() => setActiveTab('raffle')}
        >
          Sorteios
        </button>
        <button 
          className={`filter-tab ${activeTab === 'opportunity' ? 'active' : ''}`}
          onClick={() => setActiveTab('opportunity')}
        >
          Oportunidades
        </button>
        <button 
          className={`filter-tab ${activeTab === 'benefit' ? 'active' : ''}`}
          onClick={() => setActiveTab('benefit')}
        >
          Benefícios
        </button>
      </div>
      
      <div className="rewards-grid">
        {filteredRewards.length > 0 ? (
          filteredRewards.map(reward => renderRewardCard(reward))
        ) : (
          <div className="no-rewards-message">
            Nenhuma recompensa encontrada nesta categoria
          </div>
        )}
      </div>
      
      <div className="tier-explanation">
        <h3>Níveis de Fã e Benefícios</h3>
        <div className="tier-cards">
          <div className="tier-card casual-fan">
            <h4>Fã Casual</h4>
            <p>Score: 0-3.9</p>
            <ul>
              <li>Acesso a sorteios básicos</li>
              <li>Descontos na loja oficial</li>
            </ul>
          </div>
          
          <div className="tier-card regular-fan">
            <h4>Fã Regular</h4>
            <p>Score: 4-5.9</p>
            <ul>
              <li>Todos os benefícios anteriores</li>
              <li>Acesso a eventos online</li>
              <li>Sorteios mensais</li>
            </ul>
          </div>
          
          <div className="tier-card dedicated-fan">
            <h4>Fã Dedicado</h4>
            <p>Score: 6-7.9</p>
            <ul>
              <li>Todos os benefícios anteriores</li>
              <li>Acesso a beta tests</li>
              <li>Meet & greets com equipes</li>
            </ul>
          </div>
          
          <div className="tier-card super-fan">
            <h4>Super Fã</h4>
            <p>Score: 8-10</p>
            <ul>
              <li>Todos os benefícios anteriores</li>
              <li>Acesso VIP a eventos</li>
              <li>Programa de embaixadores</li>
              <li>Oportunidades exclusivas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FanRewards;