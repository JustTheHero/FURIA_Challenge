// components/FanProfile.js
import React, { useState } from 'react';
import './FanProfile.css';

/**
 * Componente que exibe o perfil completo do fã com base em todos os dados coletados
 * 
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.userData - Dados completos do usuário
 * @param {Function} props.onNavigateToRewards - Função para navegação para tela de recompensas
 */
const FanProfile = ({ userData, onNavigateToRewards }) => {
  const [activeSection, setActiveSection] = useState('summary');

  // Função para calcular métricas de envolvimento com base na análise de perfil
  const calculateEngagementMetrics = () => {
    // Metrics são calculadas com base nos dados sociais e preferências
    return {
      overall: Math.min(10, (userData.validatedProfiles?.length || 0) * 2 + 
        Object.keys(userData.socialProfiles || {}).length * 1.5),
      teamAffinity: userData.preferences?.times_favoritos?.length || 0,
      activityLevel: Object.keys(userData.socialProfiles || {}).length * 2.5,
      contentConsumption: userData.validatedProfiles?.length || 0,
      communityParticipation: Object.keys(userData.socialProfiles || {}).length * 2
    };
  };

  const metrics = calculateEngagementMetrics();

  // Helper para exibir o status de verificação
  const getVerificationStatus = () => {
    const status = userData.documentVerification?.status;
    if (status === 'verified') return { label: 'Verificado', class: 'verified' };
    if (status === 'rejected') return { label: 'Rejeitado', class: 'rejected' };
    return { label: 'Pendente', class: 'pending' };
  };

  // Calcula o nível de fã baseado nas métricas
  const getFanLevel = (overall) => {
    if (overall >= 8) return { level: "Super Fã", class: "super-fan" };
    if (overall >= 6) return { level: "Fã Dedicado", class: "dedicated-fan" };
    if (overall >= 4) return { level: "Fã Regular", class: "regular-fan" };
    return { level: "Fã Casual", class: "casual-fan" };
  };

  const fanLevel = getFanLevel(metrics.overall);
  const verificationStatus = getVerificationStatus();

  // Renderização de diferentes seções do perfil
  const renderSummary = () => (
    <div className="profile-summary">
      <div className="fan-level-badge">
        <span className={`level-indicator ${fanLevel.class}`}>{fanLevel.level}</span>
      </div>

      <div className="metrics-overview">
        <div className="metric-item">
          <div className="metric-value">{metrics.overall.toFixed(1)}</div>
          <div className="metric-label">Pontuação Geral</div>
        </div>
        <div className="metric-item">
          <div className="metric-value">{metrics.teamAffinity}</div>
          <div className="metric-label">Afinidade com Times</div>
        </div>
        <div className="metric-item">
          <div className="metric-value">{metrics.activityLevel.toFixed(1)}</div>
          <div className="metric-label">Nível de Atividade</div>
        </div>
      </div>

      <div className="profile-completion">
        <h4>Perfil Completo em {calculateCompletionPercentage()}%</h4>
        <div className="completion-bar-container">
          <div 
            className="completion-bar" 
            style={{ width: `${calculateCompletionPercentage()}%` }}
          ></div>
        </div>
        <div className="verification-status">
          Status de Verificação: 
          <span className={`status-badge ${verificationStatus.class}`}>
            {verificationStatus.label}
          </span>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="preferences-section">
      <div className="preferences-group">
        <h4>Jogos Favoritos</h4>
        <div className="preferences-tags">
          {userData.preferences?.jogos_favoritos?.map((game, index) => (
            <span key={index} className="preference-tag game-tag">{game}</span>
          )) || <span className="no-data">Nenhum jogo selecionado</span>}
        </div>
      </div>

      <div className="preferences-group">
        <h4>Times Favoritos</h4>
        <div className="preferences-tags">
          {userData.preferences?.times_favoritos?.map((team, index) => (
            <span key={index} className="preference-tag team-tag">{team}</span>
          )) || <span className="no-data">Nenhum time selecionado</span>}
        </div>
      </div>

      <div className="preferences-group">
        <h4>Competições Acompanhadas</h4>
        <div className="preferences-tags">
          {userData.preferences?.competicoes_acompanhadas?.map((comp, index) => (
            <span key={index} className="preference-tag competition-tag">{comp}</span>
          )) || <span className="no-data">Nenhuma competição selecionada</span>}
        </div>
      </div>

      <div className="preferences-group">
        <h4>Plataformas Utilizadas</h4>
        <div className="preferences-tags">
          {userData.preferences?.plataformas_utilizadas?.map((platform, index) => (
            <span key={index} className="preference-tag platform-tag">{platform}</span>
          )) || <span className="no-data">Nenhuma plataforma selecionada</span>}
        </div>
      </div>
    </div>
  );

  const renderSocialProfiles = () => (
    <div className="social-profiles-section">
      <h4>Perfis Conectados</h4>
      
      {Object.keys(userData.socialProfiles || {}).length > 0 ? (
        <div className="connected-profiles-list">
          {Object.entries(userData.socialProfiles || {}).map(([platform, profile], index) => (
            <div key={index} className="social-profile-card">
              <div className="social-platform-icon">
                {getPlatformIcon(platform)}
              </div>
              <div className="social-profile-info">
                <h5>{platform}</h5>
                <p className="profile-username">{profile.username || profile.name}</p>
                {renderPlatformSpecificInfo(platform, profile)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-profiles-message">
          Nenhum perfil social conectado
        </div>
      )}
    </div>
  );

  const renderEsportsProfiles = () => (
    <div className="esports-profiles-section">
      <h4>Perfis eSports Validados</h4>
      
      {userData.validatedProfiles?.length > 0 ? (
        <div className="validated-profiles-list">
          {userData.validatedProfiles.map((profile, index) => (
            <div key={index} className="esports-profile-card">
              <div className="esports-platform-header">
                <h5>{profile.platform || "Plataforma eSports"}</h5>
                <span className="validation-badge">Validado</span>
              </div>
              
              <div className="esports-profile-stats">
                {profile.game && (
                  <div className="stat-item">
                    <span className="stat-label">Jogo:</span>
                    <span className="stat-value">{profile.game}</span>
                  </div>
                )}
                
                {profile.rank && (
                  <div className="stat-item">
                    <span className="stat-label">Rank:</span>
                    <span className="stat-value">{profile.rank}</span>
                  </div>
                )}
                
                {profile.level && (
                  <div className="stat-item">
                    <span className="stat-label">Nível:</span>
                    <span className="stat-value">{profile.level}</span>
                  </div>
                )}
                
                {profile.matches && (
                  <div className="stat-item">
                    <span className="stat-label">Partidas:</span>
                    <span className="stat-value">{profile.matches}</span>
                  </div>
                )}
                
                {profile.win_rate && (
                  <div className="stat-item">
                    <span className="stat-label">Taxa de Vitória:</span>
                    <span className="stat-value">{profile.win_rate}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-profiles-message">
          Nenhum perfil eSports validado
        </div>
      )}
    </div>
  );

  // Helpers para renderizar ícones e informações específicas por plataforma
  const getPlatformIcon = (platform) => {
    const platformIcons = {
      twitter: <i className="fab fa-twitter"></i>,
      facebook: <i className="fab fa-facebook"></i>,
      instagram: <i className="fab fa-instagram"></i>,
      twitch: <i className="fab fa-twitch"></i>,
      default: <i className="fas fa-user"></i>
    };
    
    return platformIcons[platform.toLowerCase()] || platformIcons.default;
  };

  const renderPlatformSpecificInfo = (platform, profile) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return (
          <>
            <p><strong>Seguidores:</strong> {profile.follower_count}</p>
            <p><strong>Engajamento:</strong> {(profile.engagement_score * 100).toFixed(0)}%</p>
          </>
        );
      case 'twitch':
        return (
          <>
            <p><strong>Inscrições:</strong> {profile.subscriptions?.length || 0}</p>
            <p><strong>Atividade no Chat:</strong> {profile.chat_activity || "Baixa"}</p>
          </>
        );
      case 'facebook':
        return (
          <>
            <p><strong>Páginas:</strong> {profile.liked_pages?.length || 0}</p>
            <p><strong>Grupos:</strong> {profile.groups?.length || 0}</p>
          </>
        );
      case 'instagram':
        return (
          <>
            <p><strong>Seguindo:</strong> {profile.following?.length || 0}</p>
            <p><strong>Posts de Engajamento:</strong> {profile.engagement_posts || 0}</p>
          </>
        );
      default:
        return null;
    }
  };

  // Cálculo de porcentagem de conclusão do perfil
  const calculateCompletionPercentage = () => {
    const sections = [
      !!userData.basicInfo,
      !!userData.preferences,
      userData.documentVerification?.status === 'verified',
      Object.keys(userData.socialProfiles || {}).length > 0,
      (userData.validatedProfiles || []).length > 0
    ];
    
    const completedSections = sections.filter(Boolean).length;
    return Math.round((completedSections / sections.length) * 100);
  };

  // Menu de navegação entre seções
  const renderSectionTabs = () => (
    <div className="section-tabs">
      <button 
        className={`section-tab ${activeSection === 'summary' ? 'active' : ''}`}
        onClick={() => setActiveSection('summary')}
      >
        Resumo
      </button>
      <button 
        className={`section-tab ${activeSection === 'preferences' ? 'active' : ''}`}
        onClick={() => setActiveSection('preferences')}
      >
        Preferências
      </button>
      <button 
        className={`section-tab ${activeSection === 'social' ? 'active' : ''}`}
        onClick={() => setActiveSection('social')}
      >
        Perfis Sociais
      </button>
      <button 
        className={`section-tab ${activeSection === 'esports' ? 'active' : ''}`}
        onClick={() => setActiveSection('esports')}
      >
        Perfis eSports
      </button>
    </div>
  );

  // Renderização condicional da seção ativa
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'summary':
        return renderSummary();
      case 'preferences':
        return renderPreferences();
      case 'social':
        return renderSocialProfiles();
      case 'esports':
        return renderEsportsProfiles();
      default:
        return renderSummary();
    }
  };

  // Manipulador para navegar para a tela de recompensas
  const handleViewRewards = () => {
    if (onNavigateToRewards && typeof onNavigateToRewards === 'function') {
      onNavigateToRewards();
    } else {
      console.warn('onNavigateToRewards function not provided to FanProfile component');
    }
  };

  return (
    <div className="fan-profile-container">
      <div className="profile-header">
        <h2>Perfil do Fã</h2>
        <div className="basic-user-info">
          <div className="user-avatar">
            {userData.basicInfo?.nome_completo ? userData.basicInfo.nome_completo.charAt(0).toUpperCase() : "F"}
          </div>
          <div className="user-info">
            <h3>{userData.basicInfo?.nome_completo || "Fã de eSports"}</h3>
            <p>{userData.basicInfo?.email || ""}</p>
          </div>
        </div>
      </div>

      {renderSectionTabs()}
      
      <div className="profile-content">
        {renderActiveSection()}
      </div>

      <div className="profile-actions">
        <button className="btn btn-primary" onClick={handleViewRewards}>Ver Recompensas</button>
        <button className="btn btn-secondary">Compartilhar</button>
      </div>
    </div>
  );
};

export default FanProfile;