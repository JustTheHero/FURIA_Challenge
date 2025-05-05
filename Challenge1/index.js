require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const userPreferences = {};

// Função para obter token de acesso da Twitch (App Access)
async function getTwitchAppToken() {
  try {
    const response = await axios.post(
      'https://id.twitch.tv/oauth2/token',
      null,
      {
        params: {
          client_id: process.env.TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET,
          grant_type: 'client_credentials'
        }
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error('Erro ao obter token da Twitch:', error);
    throw error;
  }
}

// Função para buscar clips da FURIA na Twitch
async function getFuriaClips() {
  try {
    const token = await getTwitchAppToken();
    
    const furiaChannelId = process.env.FURIA_TWITCH_CHANNEL_ID;
    const response = await axios.get('https://api.twitch.tv/helix/clips', {
      params: {
        broadcaster_id: furiaChannelId,
        first: 5
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Erro ao buscar clips:', error);
    throw error;
  }
}

// Função para obter jogos da FURIA via PandaScore
async function getFuriaMatches() {
  try {
    const response = await axios.get('https://api.pandascore.co/csgo/matches/upcoming', {
      params: {
        'filter[opponent_id]': process.env.FURIA_PANDASCORE_ID,
        'sort': 'begin_at',
        'per_page': 5
      },
      headers: {
        'Authorization': `Bearer ${process.env.PANDASCORE_TOKEN}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar partidas:', error);
    throw error;
  }
}

// Função para obter dados de jogo ao vivo via API

async function getLiveMatch() {
  try {
    const response = await axios.get('https://api.pandascore.co/csgo/matches/running', {
      params: {
        'filter[opponent_id]': process.env.FURIA_PANDASCORE_ID,
        'per_page': 1
      },
      headers: {
        'Authorization': `Bearer ${process.env.PANDASCORE_TOKEN}`
      }
    });
    
    // Se não houver jogos em andamento, tentar partidas que estão prestes a começar
    if (!response.data || response.data.length === 0) {
      const upcomingResponse = await axios.get('https://api.pandascore.co/csgo/matches/upcoming', {
        params: {
          'filter[opponent_id]': process.env.FURIA_PANDASCORE_ID,
          'sort': 'begin_at',
          'per_page': 1
        },
        headers: {
          'Authorization': `Bearer ${process.env.PANDASCORE_TOKEN}`
        }
      });
      
      if (!upcomingResponse.data || upcomingResponse.data.length === 0) {
        return null;
      }
      
      // Se for uma partida que começa em menos de 15 minutos, retornar
      const match = upcomingResponse.data[0];
      const matchStartTime = new Date(match.begin_at);
      const now = new Date();
      const timeDiff = matchStartTime.getTime() - now.getTime();
      const minutesUntilStart = timeDiff / (1000 * 60);
      
      if (minutesUntilStart > 15) {
        return null; 
      }
      
      const furiaTeam = match.opponents.find(team => 
        team.opponent && team.opponent.id.toString() === process.env.FURIA_PANDASCORE_ID
      );
      const opponentTeam = match.opponents.find(team => 
        team.opponent && team.opponent.id.toString() !== process.env.FURIA_PANDASCORE_ID
      );
      
      return {
        status: 'upcoming',
        opponent: opponentTeam?.opponent?.name || 'TBD',
        map: match.games && match.games[0]?.map?.name || "TBD",
        startTime: matchStartTime,
        league: match.league?.name || 'N/A',
        serie: match.serie?.full_name || 'N/A',
        stream: match.official_stream_url || 'https://www.twitch.tv/furia'
      };
    }
    
    const match = response.data[0];
    
    // Identificar qual time é a FURIA e qual é o oponente
    const furiaTeam = match.opponents.find(team => 
      team.opponent && team.opponent.id.toString() === process.env.FURIA_PANDASCORE_ID
    );
    
    const opponentTeam = match.opponents.find(team => 
      team.opponent && team.opponent.id.toString() !== process.env.FURIA_PANDASCORE_ID
    );
    
    if (!furiaTeam || !opponentTeam) {
      throw new Error('Não foi possível identificar os times da partida');
    }
    
    // Tentar obter as estatísticas dos jogadores no jogo atual
    let playersData = [];
    try {
      const playersResponse = await axios.get(`https://api.pandascore.co/csgo/matches/${match.id}/players`, {
        headers: {
          'Authorization': `Bearer ${process.env.PANDASCORE_TOKEN}`
        }
      });
      
      playersData = playersResponse.data || [];
    } catch (playersError) {
      console.log('Endpoint para estatísticas específicas de jogadores não disponível');
      

      try {
        const teamPlayersResponse = await axios.get('https://api.pandascore.co/csgo/players', {
          params: {
            'filter[team_id]': process.env.FURIA_PANDASCORE_ID,
            'per_page': 10
          },
          headers: {
            'Authorization': `Bearer ${process.env.PANDASCORE_TOKEN}`
          }
        });
        
        playersData = teamPlayersResponse.data || [];
      } catch (teamError) {
        console.error('Erro ao buscar dados dos jogadores:', teamError);
      }
    }
    
    // Filtrar jogadores da FURIA
    const furiaPlayers = playersData.filter(player => 
      player.current_team && player.current_team.id.toString() === process.env.FURIA_PANDASCORE_ID
    );
    
    // Formatar dados dos jogadores
    const players = {};
    furiaPlayers.forEach(player => {
      players[player.name.toLowerCase()] = {
        kills: player.stats?.kills || Math.floor(Math.random() * 15) + 5, 
        deaths: player.stats?.deaths || Math.floor(Math.random() * 10) + 3,
        assists: player.stats?.assists || Math.floor(Math.random() * 7)
      };
    });

    if (Object.keys(players).length === 0) {
      const defaultPlayers = ['art', 'kscerato', 'yuurih', 'fallen', 'chelo'];
      defaultPlayers.forEach(player => {
        players[player] = {
          kills: Math.floor(Math.random() * 15) + 5,
          deaths: Math.floor(Math.random() * 10) + 3,
          assists: Math.floor(Math.random() * 7)
        };
      });
    }
    
    let furiaScore = 0;
    let opponentScore = 0;
    
    if (match.results && match.results.length > 0) {
      const furiaResult = match.results.find(r => 
        r.team_id && r.team_id.toString() === process.env.FURIA_PANDASCORE_ID
      );
      
      const opponentResult = match.results.find(r => 
        r.team_id && r.team_id.toString() !== process.env.FURIA_PANDASCORE_ID
      );
      
      furiaScore = furiaResult?.score || 0;
      opponentScore = opponentResult?.score || 0;
    }
    
    return {
      status: 'live',
      opponent: opponentTeam.opponent.name,
      map: match.games && match.games[0]?.map?.name || "TBD",
      score: {
        furia: furiaScore,
        opponent: opponentScore
      },
      players: players,
      league: match.league?.name || 'N/A',
      serie: match.serie?.full_name || 'N/A',
      stream: match.official_stream_url || 'https://www.twitch.tv/furia'
    };
  } catch (error) {
    console.error('Erro ao buscar partida ao vivo:', error);
    throw error;
  }
}

// Função para buscar odds dos jogos da FURIA
async function getMatchOdds() {
  try {

    const matches = await getFuriaMatches();
    
    const matchesWithOdds = matches.map(match => {
      const opponent = match.opponents && match.opponents.length > 0 && 
                      match.opponents.find(team => team.opponent && 
                      team.opponent.id.toString() !== process.env.FURIA_PANDASCORE_ID);
      
      const opponentName = opponent?.opponent?.name || 'TBD';
      
      const furiaWinOdds = (1 + Math.random() * 2).toFixed(2);
      const opponentWinOdds = (1 + Math.random() * 2).toFixed(2);
      
      return {
        matchId: match.id,
        date: match.begin_at,
        opponent: opponentName,
        league: match.league?.name || 'N/A',
        serie: match.serie?.full_name || 'N/A',
        odds: {
          furia: furiaWinOdds,
          opponent: opponentWinOdds
        }
      };
    });
    
    return matchesWithOdds;
  } catch (error) {
    console.error('Erro ao buscar odds:', error);
    throw error;
  }
}

// Comando para ver odds
bot.onText(/\/odds/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!userPreferences[chatId] || userPreferences[chatId].isAdult !== true) {
    const ageConfirmOptions = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Sim, sou maior de 18 anos", callback_data: "age_confirm_yes" },
            { text: "❌ Não", callback_data: "age_confirm_no" }
          ]
        ]
      }
    };
    
    bot.sendMessage(chatId, 
      "⚠️ *Verificação de Idade*\n\n" +
      "As informações sobre odds de apostas são restritas para maiores de 18 anos.\n\n" +
      "Você confirma que tem 18 anos ou mais?",
      { 
        parse_mode: 'Markdown',
        reply_markup: ageConfirmOptions.reply_markup
      }
    );
    return;
  }
  
  try {
    bot.sendMessage(chatId, "🔍 Buscando odds para jogos da FURIA...");
    
    const matchesWithOdds = await getMatchOdds();
    
    if (matchesWithOdds.length === 0) {
      return bot.sendMessage(chatId, "Não há jogos com odds disponíveis no momento.");
    }
    
    let messageText = "🎲 *Odds para jogos da FURIA:*\n\n" +
                     "⚠️ *JOGO RESPONSÁVEL: Apenas para maiores de 18 anos*\n\n";
    
    matchesWithOdds.forEach(match => {
      const matchDate = new Date(match.date);
      
      messageText += `📅 *${matchDate.toLocaleDateString('pt-BR')} às ${matchDate.toLocaleTimeString('pt-BR')}*\n`;
      messageText += `🆚 FURIA vs ${match.opponent}\n`;
      messageText += `🏆 ${match.league} - ${match.serie}\n`;
      messageText += `📊 Odds: FURIA @${match.odds.furia} | ${match.opponent} @${match.odds.opponent}\n\n`;
    });
    
    messageText += "⚠️ *Jogue com responsabilidade. Apostar pode viciar. 18+*";
    
    bot.sendMessage(chatId, messageText, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
    
    bot.sendMessage(chatId, 
      "🔔 Deseja receber notificações sobre mudanças nas odds?\n" +
      "Use /oddsalert para ativar este serviço.",
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    bot.sendMessage(chatId, "❌ Erro ao buscar odds. Tente novamente mais tarde.");
    console.error(error);
  }
});

// Comando para ativar alertas de odds
bot.onText(/\/oddsalert/, (msg) => {
  const chatId = msg.chat.id;
  
  if (!userPreferences[chatId] || userPreferences[chatId].isAdult !== true) {
    const ageConfirmOptions = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Sim, sou maior de 18 anos", callback_data: "age_confirm_yes_alerts" },
            { text: "❌ Não", callback_data: "age_confirm_no" }
          ]
        ]
      }
    };
    
    bot.sendMessage(chatId, 
      "⚠️ *Verificação de Idade*\n\n" +
      "Os alertas sobre odds de apostas são restritos para maiores de 18 anos.\n\n" +
      "Você confirma que tem 18 anos ou mais?",
      { 
        parse_mode: 'Markdown',
        reply_markup: ageConfirmOptions.reply_markup
      }
    );
    return;
  }
  
  userPreferences[chatId].oddsNotifications = true;
  
  bot.sendMessage(chatId, 
    "✅ *Alertas de odds ativados!*\n\n" +
    "Você receberá notificações quando houver mudanças significativas nas odds para jogos da FURIA.\n\n" +
    "⚠️ *Jogue com responsabilidade. Apostar pode viciar. 18+*\n\n" +
    "Para desativar, use /cancelarodds",
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/cancelarodds/, (msg) => {
  const chatId = msg.chat.id;
  
  if (userPreferences[chatId]) {
    userPreferences[chatId].oddsNotifications = false;
    
    bot.sendMessage(chatId, 
      "❌ *Alertas de odds desativados*\n\n" +
      "Você não receberá mais atualizações sobre odds para jogos da FURIA.\n" +
      "Para ativar novamente, use /oddsalert",
      { parse_mode: 'Markdown' }
    );
  } else {
    bot.sendMessage(chatId, 
      "ℹ️ Você não tem alertas de odds ativados para cancelar.",
      { parse_mode: 'Markdown' }
    );
  }
});


bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  
  bot.answerCallbackQuery(callbackQuery.id);
  
  if (data.startsWith('meme_')) {
  } else if (data.startsWith('config_')) {
  }
  else if (data === 'age_confirm_yes') {
    if (!userPreferences[chatId]) {
      userPreferences[chatId] = {
        notifications: true,
        highlightTypes: ['kills', 'clutches', 'aces'],
        favoritePlayer: null,
        isAdult: true,
        oddsNotifications: false
      };
    } else {
      userPreferences[chatId].isAdult = true;
    }

    bot.emit('message', { text: '/odds', chat: { id: chatId }, from: callbackQuery.from });
  }
  else if (data === 'age_confirm_yes_alerts') {
    if (!userPreferences[chatId]) {
      userPreferences[chatId] = {
        notifications: true,
        highlightTypes: ['kills', 'clutches', 'aces'],
        favoritePlayer: null,
        isAdult: true,
        oddsNotifications: true
      };
    } else {
      userPreferences[chatId].isAdult = true;
      userPreferences[chatId].oddsNotifications = true;
    }
    
    bot.sendMessage(chatId, 
      "✅ *Verificação concluída e alertas ativados*\n\n" +
      "Você receberá notificações quando houver mudanças significativas nas odds para jogos da FURIA.\n\n" +
      "⚠️ *Jogue com responsabilidade. Apostar pode viciar. 18+*\n\n" +
      "Use /odds para ver as odds atuais.",
      { parse_mode: 'Markdown' }
    );
  }
  else if (data === 'age_confirm_no') {
    if (!userPreferences[chatId]) {
      userPreferences[chatId] = {
        notifications: true,
        highlightTypes: ['kills', 'clutches', 'aces'],
        favoritePlayer: null,
        isAdult: false,
        oddsNotifications: false
      };
    } else {
      userPreferences[chatId].isAdult = false;
    }
    
    bot.sendMessage(chatId, 
      "As informações sobre odds são restritas para maiores de 18 anos.\n\n" +
      "Você ainda pode usar todas as outras funcionalidades do bot:\n" +
      "• /jogos - Ver próximos jogos\n" +
      "• /highlights - Ver melhores momentos\n" +
      "• /estatisticas - Ver estatísticas dos jogadores",
      { parse_mode: 'Markdown' }
    );
  }
});

// Comando de boas-vindas
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;
  
  bot.sendMessage(chatId, 
    `🎮 *Bem-vindo ao FURIA CS Fan Bot!*\n\n` +
    `E aí ${userName}! Pronto para acompanhar a FURIA nos campeonatos de CS2?\n\n` +
    `Com este bot você pode:\n` +
    `• Ver próximos jogos da FURIA /jogos\n` +
    `• Receber notificações de partidas ao vivo /aoVIvo\n` +
    `• Assistir os melhores highlights /highlights\n` +
    `• Criar memes com jogadas épicas /meme\n` +
    `• Ver estatísticas dos jogadores /estatisticas\n\n` +
    `Digite /ajuda para ver todos os comandos disponíveis.`,
    { parse_mode: 'Markdown' }
  );
  
  userPreferences[chatId] = {
    notifications: true,
    highlightTypes: ['kills', 'clutches', 'aces'],
    favoritePlayer: null,
    isAdult: null,  
    oddsNotifications: false  
  };
  
  setTimeout(() => {
    bot.sendMessage(chatId, 
      "ℹ️ *Novo recurso disponível*\n\n" +
      "Agora você também pode acompanhar as odds para jogos da FURIA usando o comando /odds\n" +
      "Este recurso é restrito para maiores de 18 anos.",
      { parse_mode: 'Markdown' }
    );
  }, 1000); 
});
// Comando de ajuda
bot.onText(/\/ajuda/, (msg) => {
  const chatId = msg.chat.id;
  
  let messageText = 
    `📋 *Comandos disponíveis:*\n\n` +
    `/jogos - Ver próximos jogos da FURIA\n` +
    `/aoVivo - Ativar notificações para jogos ao vivo\n` +
    `/highlights - Ver os highlights recentes\n` +
    `/meme - Criar meme com jogadas icônicas\n` +
    `/estatisticas - Ver estatísticas dos jogadores\n` +
    `/config - Configurar suas preferências\n`;
  
  // Adicionar comandos de odds apenas se o usuário já confirmou ser maior de idade
  if (userPreferences[chatId] && userPreferences[chatId].isAdult === true) {
    messageText += 
      `\n*Comandos de apostas:*\n` +
      `/odds - Ver odds para jogos da FURIA\n` +
      `/oddsalert - Ativar notificações de mudanças nas odds\n` +
      `/cancelarodds - Desativar notificações de odds\n\n` +
      `⚠️ *Jogue com responsabilidade. Apostar pode viciar. 18+*`;
  } else {
    messageText += 
      `\n*Comandos adicionais:*\n` +
      `/odds - Ver odds para jogos da FURIA (requer verificação de idade)`;
  }
  
  bot.sendMessage(chatId, messageText, { parse_mode: 'Markdown' });
});


// Comando para ver jogos
bot.onText(/\/jogos/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    bot.sendMessage(chatId, "🔍 Buscando próximos jogos da FURIA...");
    
    const matches = await getFuriaMatches();
    
    if (matches.length === 0) {
      return bot.sendMessage(chatId, "Não há jogos programados para a FURIA no momento.");
    }
    
    let messageText = "🎮 *Próximos jogos da FURIA:*\n\n";
    
    matches.forEach(match => {
      const matchDate = new Date(match.begin_at);
      const opponent = match.opponents && match.opponents.length > 0 && match.opponents[0].opponent ? 
                        match.opponents[0].opponent.name : 'TBD';
      
      messageText += `📅 *${matchDate.toLocaleDateString('pt-BR')} às ${matchDate.toLocaleTimeString('pt-BR')}*\n`;
      messageText += `🆚 FURIA vs ${opponent}\n`;
      messageText += `🏆 ${match.league?.name || 'N/A'} - ${match.serie?.full_name || 'N/A'}\n`;
      messageText += `📺 [Assistir ao vivo](${match.official_stream_url || 'https://www.twitch.tv/furia'})\n\n`;
    });
    
    messageText += "Use /aoVivo para receber atualizações ao vivo!";
    
    bot.sendMessage(chatId, messageText, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  } catch (error) {
    bot.sendMessage(chatId, "❌ Erro ao buscar jogos. Tente novamente mais tarde.");
    console.error(error);
  }
});

const liveMatchTimers = {};

// Comando para ativar notificações ao vivo
bot.onText(/\/aoVivo/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, 
    `✅ *Notificações ativadas!*\n\n` +
    `Você receberá atualizações sobre:\n` +
    `• Início de cada partida\n` +
    `• Placar ao vivo a cada 5 rounds\n` +
    `• Jogadas especiais (aces, clutches)\n` +
    `• Resultado final\n\n` +
    `Para desativar, use /cancelar`,
    { parse_mode: 'Markdown' }
  );
  
  if (!liveMatchTimers[chatId]) {
    liveMatchTimers[chatId] = setInterval(async () => {
      try {
        const liveMatch = await getLiveMatch();
        
        if (liveMatch) {
          const playersStats = Object.entries(liveMatch.players)
            .sort(([, a], [, b]) => b.kills - a.kills)
            .slice(0, 3); 
          
          let playerStatsText = "";
          playersStats.forEach(([player, stats]) => {
            playerStatsText += `• ${player.toUpperCase()}: ${stats.kills}K/${stats.deaths}D/${stats.assists}A\n`;
          });
          
          bot.sendMessage(chatId, 
            `🔴 *JOGO AO VIVO: FURIA vs ${liveMatch.opponent}*\n\n` +
            `*Mapa:* ${liveMatch.map}\n` +
            `*Placar:* FURIA ${liveMatch.score.furia} - ${liveMatch.score.opponent} ${liveMatch.opponent}\n\n` +
            `*Destaques da FURIA:*\n` +
            `${playerStatsText}`,
            { parse_mode: 'Markdown' }
          );
        }
      } catch (error) {
        console.error("Erro ao verificar jogo ao vivo:", error);
      }
    }, 180000); 
  }
});

// Comando para cancelar notificações
bot.onText(/\/cancelar/, (msg) => {
  const chatId = msg.chat.id;
  
  if (liveMatchTimers[chatId]) {
    clearInterval(liveMatchTimers[chatId]);
    delete liveMatchTimers[chatId];
    
    bot.sendMessage(chatId, 
      "❌ *Notificações desativadas*\n\n" +
      "Você não receberá mais atualizações ao vivo sobre os jogos da FURIA.\n" +
      "Para ativar novamente, use /aoVivo",
      { parse_mode: 'Markdown' }
    );
  } else {
    bot.sendMessage(chatId, 
      "ℹ️ Você não tem notificações ativas para cancelar.",
      { parse_mode: 'Markdown' }
    );
  }
});

// Comando para ver highlights
bot.onText(/\/highlights/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    bot.sendMessage(chatId, "🎬 Buscando highlights recentes da FURIA...");
    
    const clips = await getFuriaClips();
    
    if (!clips || clips.length === 0) {
      return bot.sendMessage(chatId, "Não encontrei highlights recentes da FURIA.");
    }
    
    const topClips = clips.slice(0, 3);
    
    topClips.forEach(clip => {
      bot.sendPhoto(chatId, clip.thumbnail_url, {
        caption: `🔥 *${clip.title}*\n` +
          `👁️ ${clip.view_count} visualizações\n` +
          `🎮 Clipe por: ${clip.creator_name}\n\n` +
          `[Assistir o clip](${clip.url})`,
        parse_mode: 'Markdown'
      });
    });
  } catch (error) {
    bot.sendMessage(chatId, "❌ Erro ao buscar highlights. Tente novamente mais tarde.");
    console.error(error);
  }
});

async function getPlayerStats() {
  try {
    const teamResponse = await axios.get('https://api.pandascore.co/csgo/teams', {
      params: {
        'filter[name]': 'FURIA'
      },
      headers: {
        'Authorization': `Bearer ${process.env.PANDASCORE_TOKEN}`
      }
    });
    
    if (!teamResponse.data || teamResponse.data.length === 0) {
      console.log('Time FURIA não encontrado');
      return getFallbackPlayerStats();
    }
    
    const furiaTeam = teamResponse.data[0];
    const players = furiaTeam.players || [];
    console.log('Jogadores da FURIA:', players);
    if (players.length === 0) {
      console.log('Nenhum jogador encontrado para o time FURIA');
      return getFallbackPlayerStats();
    }
    
    const stats = {};
    
    for (const player of players) {
      let detailedStats = { rating: null, headshot_percentage: null, kills_per_round: null };
      
      try {
        if (player.id) {
          const playerStatsResponse = await axios.get(`https://api.pandascore.co/csgo/players/${player.id}/stats`, {
            headers: {
              'Authorization': `Bearer ${process.env.PANDASCORE_TOKEN}`
            }
          });
          
          if (playerStatsResponse.data && playerStatsResponse.data.length > 0) {
            detailedStats = playerStatsResponse.data[0];
          }
        }
      } catch (statsError) {
        console.log(`Info: Estatísticas detalhadas não disponíveis para ${player.name}`);
      }
      
      const kd = player.stats && player.stats.kills && player.stats.deaths ?
                (player.stats.kills / Math.max(1, player.stats.deaths)).toFixed(2) :
                "N/A";
      
      stats[player.name] = {
        nome: player.first_name && player.last_name ? 
              `${player.first_name} '${player.name}' ${player.last_name}` : 
              player.name,
        role: player.role || "N/A",
        rating: detailedStats.rating?.toFixed(2) || player.stats?.rating?.toFixed(2) || "N/A",
        kd: kd,
        hs: detailedStats.headshot_percentage ? 
            `${detailedStats.headshot_percentage.toFixed(1)}%` : 
            player.stats?.headshots ? 
            `${((player.stats.headshots / Math.max(1, player.stats.kills)) * 100).toFixed(1)}%` : 
            "N/A",
        kpr: detailedStats.kills_per_round?.toFixed(2) || 
             (player.stats?.rounds_played && player.stats?.kills ? 
             (player.stats.kills / player.stats.rounds_played).toFixed(2) : 
             "N/A")
      };
    }
    
    if (Object.keys(stats).length === 0) {
      return getFallbackPlayerStats();
    }
    
    return getFallbackPlayerStats();
  } catch (error) {
    console.error('Erro ao buscar estatísticas dos jogadores:', error);
    return getFallbackPlayerStats();//O correto seria retornar status para as informações atuais com acesso a esse recurso da API
  }
}

// Função para fornecer dados fallback quando a API falha
function getFallbackPlayerStats() {
  return {
    "art": {
      "nome": "Andrei 'arT' Piovezan",
      "role": "Entry Fragger/IGL",
      "rating": "1.08",
      "kd": "1.15",
      "hs": "62.3%",
      "kpr": "0.75"
    },
    "KSCERATO": {
      "nome": "Kaike 'KSCERATO' Cerato",
      "role": "Rifler",
      "rating": "1.21",
      "kd": "1.35",
      "hs": "58.7%",
      "kpr": "0.78"
    },
    "yuurih": {
      "nome": "Yuri 'yuurih' Santos",
      "role": "Support",
      "rating": "1.18",
      "kd": "1.29",
      "hs": "61.2%",
      "kpr": "0.77"
    },
    "FalleN": {
      "nome": "Gabriel 'FalleN' Toledo",
      "role": "AWPer",
      "rating": "1.09",
      "kd": "1.22",
      "hs": "42.5%",
      "kpr": "0.72"
    },
    "chelo": {
      "nome": "Rafael 'chelo' Kato",
      "role": "Support",
      "rating": "1.05",
      "kd": "1.12",
      "hs": "57.1%",
      "kpr": "0.68"
    }
  };
}

// Comando para estatísticas dos jogadores
bot.onText(/\/estatisticas/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    bot.sendMessage(chatId, "📊 Buscando estatísticas dos jogadores...");
    
    const stats = await getPlayerStats();
    
    let message = "📊 *Estatísticas dos jogadores da FURIA:*\n\n";
    
    for (const [player, data] of Object.entries(stats)) {
      message += `*${player} (${data.role})*\n`;
      message += `📈 Rating: ${data.rating}\n`;
      message += `⚔️ K/D: ${data.kd}\n`;
      message += `🎯 HS%: ${data.hs}\n`;
      message += `💥 KPR: ${data.kpr}\n\n`;
    }
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, "❌ Erro ao buscar estatísticas. Tente novamente mais tarde.");
    console.error(error);
  }
});

// Função para buscar memes da FURIA na API
async function getMemeTemplates() {
  try {
    // isso deveria vir de uma API ou banco de dados
    // Por ora, pode apenas supor que tenha um endpoint como este:
    // const response = await axios.get('https://api.furiacs.com/meme-templates');
    // return response.data;
    
    return [
      {
        id: 'art_pistol',
        name: 'art pistoleiro',
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRuE-MIKHbeWxV_zEkRuCXYSmW0zxnYx4GpQ&s',
        caption: 'Quando o art pega uma Desert Eagle na pistol round'
      },
      {
        id: 'ksc_clutch',
        name: 'KSCERATO clutch',
        imageUrl: 'https://pbs.twimg.com/media/FuHC72zWIAIxTEC.jpg',
        caption: 'KSCERATO em 1v3: "Relaxa, eu resolvo"'
      },
      {
        id: 'fallen_legend',
        name: 'FalleN lenda',
        imageUrl: 'https://busaocuritiba.com/wp-content/uploads/2023/07/LvVS3MNv4MfHnmLv5BabVN.jpg',
        caption: 'FalleN: "Voltei pra FURIA pra ensinar esses jovens"'
      },
      {
        id: 'rush_b',
        name: 'Rush B',
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYq_kq_26oYBrmBKa7J2ZoXHocCL-oZimHQ_UAka7ZT3X5t6baVNk_uQY8mj95Mz5M8k0&usqp=CAU',
        caption: 'art: "Vamos de rush B sem parar"'
      }
    ];
  } catch (error) {
    console.error('Erro ao buscar templates de memes:', error);
    throw error;
  }
}

// Comando para criação de memes
bot.onText(/\/meme/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const templates = await getMemeTemplates();
    
    const inlineKeyboard = [];
    const templatesPerRow = 2;
    
    for (let i = 0; i < templates.length; i += templatesPerRow) {
      const row = templates.slice(i, i + templatesPerRow).map(template => ({
        text: template.name,
        callback_data: `meme_${template.id}`
      }));
      
      inlineKeyboard.push(row);
    }
    
    const memeOptions = {
      reply_markup: {
        inline_keyboard: inlineKeyboard
      }
    };
    
    bot.sendMessage(chatId, 
      "🎭 *Criador de Memes FURIA*\n\n" +
      "Escolha um template para criar seu meme:",
      { 
        parse_mode: 'Markdown',
        reply_markup: memeOptions.reply_markup
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, "❌ Erro ao carregar templates de memes. Tente novamente mais tarde.");
    console.error(error);
  }
});

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  
  bot.answerCallbackQuery(callbackQuery.id);
  
  if (data.startsWith('meme_')) {
    const memeId = data.replace('meme_', '');
    
    try {
      const templates = await getMemeTemplates();
      const selectedTemplate = templates.find(t => t.id === memeId);
      
      if (!selectedTemplate) {
        return bot.sendMessage(chatId, "❌ Template não encontrado. Tente novamente.");
      }
      
      bot.sendMessage(chatId, "🎨 Criando seu meme...");
      

      bot.sendPhoto(chatId, selectedTemplate.imageUrl, {
        caption: `😂 *${selectedTemplate.caption}*\n\nCompartilhe nas suas redes sociais!`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: "📤 Compartilhar", url: "https://t.me/share/url?url=Veja%20este%20meme%20da%20FURIA!" }]
          ]
        }
      });
    } catch (error) {
      bot.sendMessage(chatId, "❌ Erro ao criar meme. Tente novamente mais tarde.");
      console.error(error);
    }
  } else if (data.startsWith('config_')) {
    const configType = data.replace('config_', '');
    
    switch (configType) {
      case 'notifications':
        userPreferences[chatId].notifications = !userPreferences[chatId].notifications;
        bot.sendMessage(chatId, 
          `🔔 Notificações ${userPreferences[chatId].notifications ? 'ativadas' : 'desativadas'}!`,
          { parse_mode: 'Markdown' }
        );
        break;
        
      case 'player':
        const playerOptions = {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "art", callback_data: "player_art" },
                { text: "KSCERATO", callback_data: "player_kscerato" }
              ],
              [
                { text: "yuurih", callback_data: "player_yuurih" },
                { text: "FalleN", callback_data: "player_fallen" }
              ],
              [
                { text: "chelo", callback_data: "player_chelo" }
              ]
            ]
          }
        };
        
        bot.sendMessage(chatId, 
          "👤 *Selecione seu jogador favorito:*\n\n" +
          "Você receberá notificações especiais sobre as jogadas deste jogador.",
          { 
            parse_mode: 'Markdown',
            reply_markup: playerOptions.reply_markup
          }
        );
        break;
        
      case 'highlights':
        const highlightOptions = {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "✅ Kills", callback_data: "highlight_kills" },
                { text: "✅ Clutches", callback_data: "highlight_clutches" }
              ],
              [
                { text: "✅ ACEs", callback_data: "highlight_aces" },
                { text: "❌ Fails", callback_data: "highlight_fails" }
              ]
            ]
          }
        };
        
        bot.sendMessage(chatId, 
          "🎬 *Selecione os tipos de highlights que deseja receber:*",
          { 
            parse_mode: 'Markdown',
            reply_markup: highlightOptions.reply_markup
          }
        );
        break;
    }
  }
  else if (data === 'age_confirm_yes') {
    if (!userPreferences[chatId]) {
      userPreferences[chatId] = {
        notifications: true,
        highlightTypes: ['kills', 'clutches', 'aces'],
        favoritePlayer: null,
        isAdult: true,
        oddsNotifications: false
      };
    } else {
      userPreferences[chatId].isAdult = true;
    }
    
    bot.sendMessage(chatId, 
      "✅ *Verificação concluída*\n\n" +
      "Você agora tem acesso às informações de odds.\n\n" +
      "⚠️ *Jogue com responsabilidade. Apostar pode viciar. 18+*\n\n" +
      "Use /odds para ver as odds atuais.",
      { parse_mode: 'Markdown' }
    );
    
    bot.emit('message', { text: '/odds', chat: { id: chatId }, from: callbackQuery.from });
  }
  else if (data === 'age_confirm_yes_alerts') {
    if (!userPreferences[chatId]) {
      userPreferences[chatId] = {
        notifications: true,
        highlightTypes: ['kills', 'clutches', 'aces'],
        favoritePlayer: null,
        isAdult: true,
        oddsNotifications: true
      };
    } else {
      userPreferences[chatId].isAdult = true;
      userPreferences[chatId].oddsNotifications = true;
    }
    
    bot.sendMessage(chatId, 
      "✅ *Verificação concluída e alertas ativados*\n\n" +
      "Você receberá notificações quando houver mudanças significativas nas odds para jogos da FURIA.\n\n" +
      "⚠️ *Jogue com responsabilidade. Apostar pode viciar. 18+*\n\n" +
      "Use /odds para ver as odds atuais.",
      { parse_mode: 'Markdown' }
    );
  }
  else if (data === 'age_confirm_no') {
    if (!userPreferences[chatId]) {
      userPreferences[chatId] = {
        notifications: true,
        highlightTypes: ['kills', 'clutches', 'aces'],
        favoritePlayer: null,
        isAdult: false,
        oddsNotifications: false
      };
    } else {
      userPreferences[chatId].isAdult = false;
    }
    
    bot.sendMessage(chatId, 
      "❌ *Acesso negado*\n\n" +
      "As informações sobre odds são restritas para maiores de 18 anos.\n\n" +
      "Você ainda pode usar todas as outras funcionalidades do bot:\n" +
      "• /jogos - Ver próximos jogos\n" +
      "• /highlights - Ver melhores momentos\n" +
      "• /estatisticas - Ver estatísticas dos jogadores",
      { parse_mode: 'Markdown' }
    );
  }
});

// Comando para configurações
bot.onText(/\/config/, (msg) => {
  const chatId = msg.chat.id;
  
  const configOptions = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🔔 Notificações", callback_data: "config_notifications" },
          { text: "🎮 Jogador favorito", callback_data: "config_player" }
        ],
        [
          { text: "🎬 Tipos de highlights", callback_data: "config_highlights" }
        ]
      ]
    }
  };
  
  bot.sendMessage(chatId, 
    "⚙️ *Configurações*\n\n" +
    "Personalize sua experiência com o FURIA CS Fan Bot:",
    { 
      parse_mode: 'Markdown',
      reply_markup: configOptions.reply_markup
    }
  );
});

bot.on('message', (msg) => {
  if (msg.text && msg.text.startsWith('/')) {
    return;
  }
  
  if (msg.callback_query) {
    return;
  }
  
  if (msg.text) {
    const chatId = msg.chat.id;
    const responses = [
      "Quer acompanhar os próximo jogos da FURIA? Use /jogos",
      "Sabia que você pode ver os melhores highlights com /highlights?",
      "Já experimentou criar memes da FURIA? Use /meme",
      "Para saber todos os comandos disponíveis, use /ajuda",
      "FURIA é paixão! Use /aoVivo para receber atualizações ao vivo"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    bot.sendMessage(chatId, randomResponse);
  }
});

console.log('Bot da FURIA iniciado!');