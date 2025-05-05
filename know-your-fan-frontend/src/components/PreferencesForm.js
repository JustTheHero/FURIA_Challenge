import React, { useState, useEffect } from 'react';
import './PreferencesForm.css';

const esportsGames = [
  { id: 'cs2', name: 'Counter-Strike 2' },
  { id: 'valorant', name: 'VALORANT' },
  { id: 'lol', name: 'League of Legends' },
  { id: 'dota2', name: 'Dota 2' },
  { id: 'r6', name: 'Rainbow Six Siege' },
  { id: 'rl', name: 'Rocket League' },
  { id: 'ow2', name: 'Overwatch 2' },
  { id: 'apex', name: 'Apex Legends' },
  { id: 'fifa', name: 'EA FC 25' },
  { id: 'fortnite', name: 'Fortnite' }
];

const brazilianTeams = [
  { id: 'furia', name: 'FURIA' },
  { id: 'loud', name: 'LOUD' },
  { id: 'pain', name: 'paiN Gaming' },
  { id: 'mibr', name: 'MIBR' },
  { id: 'intz', name: 'INTZ' },
  { id: 'fluxo', name: 'Fluxo' },
  { id: 'red', name: 'RED Canids' },
  { id: 'kabum', name: 'KaBuM! e-Sports' }
];

const internationalTeams = [
  { id: 'liquid', name: 'Team Liquid' },
  { id: 'navi', name: "Natus Vincere" },
  { id: 'g2', name: 'G2 Esports' },
  { id: 'fnatic', name: 'Fnatic' },
  { id: 'c9', name: 'Cloud9' },
  { id: 't1', name: 'T1' },
  { id: 'eg', name: 'Evil Geniuses' },
  { id: 'vitality', name: 'Team Vitality' },
  { id: 'fpx', name: 'FunPlus Phoenix' },
  { id: '100t', name: '100 Thieves' }
];

const competitions = [
  { id: 'cblol', name: 'CBLOL' },
  { id: 'iem', name: 'IEM (Intel Extreme Masters)' },
  { id: 'major_cs', name: 'CS Major Championships' },
  { id: 'vct', name: 'VCT (VALORANT Champions Tour)' },
  { id: 'worlds', name: 'League of Legends World Championship' },
  { id: 'msi', name: 'Mid-Season Invitational' },
  { id: 'ti', name: 'The International (Dota 2)' },
  { id: 'dreamhack', name: 'DreamHack' },
  { id: 'esl', name: 'ESL Pro League' },
  { id: 'blast', name: 'BLAST Premier' }
];

const platforms = [
  { id: 'twitch', name: 'Twitch' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'facebook', name: 'Facebook Gaming' },
  { id: 'steam', name: 'Steam' },
  { id: 'riot', name: 'Riot Games' },
  { id: 'battlenet', name: 'Battle.net' },
  { id: 'epic', name: 'Epic Games Store' },
  { id: 'xbox', name: 'Xbox Live' },
  { id: 'psn', name: 'PlayStation Network' },
  { id: 'discord', name: 'Discord' }
];

function PreferencesForm({ initialData, onSave }) {
  const [formData, setFormData] = useState({
    jogos_favoritos: [],
    times_favoritos: [],
    competicoes_acompanhadas: [],
    plataformas_utilizadas: [],
    streamers_favoritos: ''
  });
  
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleGameChange = (gameId) => {
    setFormData(prevData => {
      const newGames = prevData.jogos_favoritos.includes(gameId)
        ? prevData.jogos_favoritos.filter(id => id !== gameId)
        : [...prevData.jogos_favoritos, gameId];
      
      return {
        ...prevData,
        jogos_favoritos: newGames
      };
    });
  };
  
  const handleTeamChange = (teamId) => {
    setFormData(prevData => {
      const newTeams = prevData.times_favoritos.includes(teamId)
        ? prevData.times_favoritos.filter(id => id !== teamId)
        : [...prevData.times_favoritos, teamId];
      
      return {
        ...prevData,
        times_favoritos: newTeams
      };
    });
  };
  
  const handleCompetitionChange = (compId) => {
    setFormData(prevData => {
      const newComps = prevData.competicoes_acompanhadas.includes(compId)
        ? prevData.competicoes_acompanhadas.filter(id => id !== compId)
        : [...prevData.competicoes_acompanhadas, compId];
      
      return {
        ...prevData,
        competicoes_acompanhadas: newComps
      };
    });
  };
  
  const handlePlatformChange = (platformId) => {
    setFormData(prevData => {
      const newPlatforms = prevData.plataformas_utilizadas.includes(platformId)
        ? prevData.plataformas_utilizadas.filter(id => id !== platformId)
        : [...prevData.plataformas_utilizadas, platformId];
      
      return {
        ...prevData,
        plataformas_utilizadas: newPlatforms
      };
    });
  };
  
  const handleStreamersChange = (e) => {
    setFormData({
      ...formData,
      streamers_favoritos: e.target.value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.jogos_favoritos.length === 0) {
      newErrors.jogos_favoritos = 'Selecione pelo menos um jogo';
    }
    
    if (formData.times_favoritos.length === 0) {
      newErrors.times_favoritos = 'Selecione pelo menos um time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Converter IDs para nomes completos antes de salvar
      const formattedData = {
        ...formData,
        jogos_favoritos: formData.jogos_favoritos.map(id => 
          esportsGames.find(game => game.id === id)?.name
        ),
        times_favoritos: formData.times_favoritos.map(id => {
          const brazilTeam = brazilianTeams.find(team => team.id === id);
          const intlTeam = internationalTeams.find(team => team.id === id);
          return (brazilTeam || intlTeam)?.name;
        }),
        competicoes_acompanhadas: formData.competicoes_acompanhadas.map(id =>
          competitions.find(comp => comp.id === id)?.name
        ),
        plataformas_utilizadas: formData.plataformas_utilizadas.map(id =>
          platforms.find(platform => platform.id === id)?.name
        ),
        streamers_favoritos: formData.streamers_favoritos.split(',')
          .map(streamer => streamer.trim())
          .filter(streamer => streamer !== '')
      };
      
      onSave(formattedData);
    }
  };

  return (
    <div className="preferences-form">
      <h2>Preferências de eSports</h2>
      <p>Compartilhe suas preferências no mundo dos eSports para personalizar sua experiência.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Jogos Favoritos *</h3>
          <p className="section-description">Selecione os jogos de eSports que você mais gosta.</p>
          
          {errors.jogos_favoritos && (
            <div className="error-message">{errors.jogos_favoritos}</div>
          )}
          
          <div className="checkboxes-grid">
            {esportsGames.map(game => (
              <div key={game.id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`game-${game.id}`}
                  checked={formData.jogos_favoritos.includes(game.id)}
                  onChange={() => handleGameChange(game.id)}
                />
                <label htmlFor={`game-${game.id}`}>{game.name}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-section">
          <h3>Times Favoritos *</h3>
          <p className="section-description">Selecione os times que você torce.</p>
          
          {errors.times_favoritos && (
            <div className="error-message">{errors.times_favoritos}</div>
          )}
          
          <h4>Times Brasileiros</h4>
          <div className="checkboxes-grid">
            {brazilianTeams.map(team => (
              <div key={team.id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`team-${team.id}`}
                  checked={formData.times_favoritos.includes(team.id)}
                  onChange={() => handleTeamChange(team.id)}
                />
                <label htmlFor={`team-${team.id}`}>{team.name}</label>
              </div>
            ))}
          </div>
          
          <h4>Times Internacionais</h4>
          <div className="checkboxes-grid">
            {internationalTeams.map(team => (
              <div key={team.id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`team-${team.id}`}
                  checked={formData.times_favoritos.includes(team.id)}
                  onChange={() => handleTeamChange(team.id)}
                />
                <label htmlFor={`team-${team.id}`}>{team.name}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-section">
          <h3>Competições Acompanhadas</h3>
          <p className="section-description">Quais torneios e ligas você acompanha?</p>
          
          <div className="checkboxes-grid">
            {competitions.map(comp => (
              <div key={comp.id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`comp-${comp.id}`}
                  checked={formData.competicoes_acompanhadas.includes(comp.id)}
                  onChange={() => handleCompetitionChange(comp.id)}
                />
                <label htmlFor={`comp-${comp.id}`}>{comp.name}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-section">
          <h3>Plataformas Utilizadas</h3>
          <p className="section-description">Quais plataformas você utiliza para jogar e assistir eSports?</p>
          
          <div className="checkboxes-grid">
            {platforms.map(platform => (
              <div key={platform.id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`platform-${platform.id}`}
                  checked={formData.plataformas_utilizadas.includes(platform.id)}
                  onChange={() => handlePlatformChange(platform.id)}
                />
                <label htmlFor={`platform-${platform.id}`}>{platform.name}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-section">
          <h3>Streamers Favoritos</h3>
          <p className="section-description">Quais são seus streamers favoritos? (Separe por vírgulas)</p>
          
          <div className="form-group">
            <textarea
              name="streamers_favoritos"
              value={formData.streamers_favoritos}
              onChange={handleStreamersChange}
              placeholder="Ex: Gaules, Alanzoka, Jukes"
              rows={3}
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Salvar e Continuar</button>
        </div>
      </form>
    </div>
  );
}

export default PreferencesForm;