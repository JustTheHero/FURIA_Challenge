
import os
import json
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Optional, Union

import cv2
import pytesseract
from PIL import Image
import tensorflow as tf
import requests
from transformers import pipeline

import tweepy
import google_auth_oauthlib
import google.oauth2.credentials

class KnowYourFanApp:
    def __init__(self):
        self.user_data = {}
        self.social_profiles = {}
        self.esports_preferences = {}
        self.document_verification_status = "pending"
        
    def _initialize_document_verifier(self):
        """Inicializa o modelo de verificação de documentos"""

        #return pipeline("image-classification")
    
    def _initialize_content_analyzer(self):
        """Inicializa o analisador de conteúdo de redes sociais"""

        #return pipeline("text-classification")
        
    def collect_basic_info(self, user_info: Dict) -> bool:

        required_fields = ["nome_completo", "cpf", "data_nascimento", "endereco", "email"]
        
        for field in required_fields:
            if field not in user_info or not user_info[field]:
                print(f"Campo obrigatório ausente: {field}")
                return False
                
  
        if not self._validate_cpf(user_info["cpf"]):
            print("CPF inválido")
            return False
            

        self.user_data.update(user_info)
        print(f"Informações básicas coletadas para {user_info['nome_completo']}")
        return True
        
    def _validate_cpf(self, cpf: str) -> bool:

        cpf = ''.join(filter(str.isdigit, cpf))
 
        if len(cpf) != 11:
            return False
 
        return True
        
    def collect_esports_preferences(self, preferences: Dict) -> bool:

        categories = ["jogos_favoritos", "times_favoritos", "competicoes_acompanhadas", 
                     "plataformas_utilizadas", "streamers_favoritos"]
        
        # Garantir que todas as categorias existam
        for category in categories:
            if category not in preferences:
                preferences[category] = []

        self.esports_preferences.update(preferences)

        self.esports_preferences["ultima_atualizacao"] = datetime.now().strftime("%Y-%m-%d")
        
        print("Preferências de eSports registradas com sucesso")
        return True
        
    def verify_document(self, document_image_path: str) -> Dict:

        try:
            image = Image.open(document_image_path)
            image = image.convert('RGB')
            
            image_np = np.array(image)
            text = pytesseract.image_to_string(image_np)
            
            # Verificar se há informações pessoais no documento
            # Comparar com as informações fornecidas pelo usuário
            verification_result = self._match_document_with_user_info(text)
            
            document_validity = self._check_document_validity(image)
            
            # Atualizar status de verificação
            if verification_result["match_score"] > 0.7 and document_validity["valid"]:
                self.document_verification_status = "verified"
            else:
                self.document_verification_status = "rejected"
                
            return {
                "status": self.document_verification_status,
                "match_score": verification_result["match_score"],
                "validity_score": document_validity["confidence"],
                "verification_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
        except Exception as e:
            print(f"Erro na verificação do documento: {str(e)}")
            return {
                "status": "error",
                "error_message": str(e)
            }
            
    def _match_document_with_user_info(self, document_text: str) -> Dict:

        if not self.user_data:
            return {"match_score": 0, "message": "Nenhuma informação de usuário para comparar"}
            
        # Verificar se o nome do usuário está no documento
        if self.user_data.get("nome_completo", "").lower() in document_text.lower():
            name_match = True
        else:
            name_match = False
            
        # Verificar se o CPF está no documento
        if self.user_data.get("cpf", "") in document_text:
            cpf_match = True
        else:
            cpf_match = False
            
        # Calcular pontuação de correspondência
        if name_match and cpf_match:
            score = 1.0
        elif name_match or cpf_match:
            score = 0.5
        else:
            score = 0.0
            
        return {
            "match_score": score,
            "name_match": name_match,
            "cpf_match": cpf_match
        }
        
    def _check_document_validity(self, image) -> Dict:

        return {
            "valid": True,
            "confidence": 0.85
        }
        
    def connect_social_profile(self, platform: str, auth_token: str) -> Dict:

        try:
            # Implementação para diferentes plataformas
            if platform.lower() == "twitter":
                profile_data = self._connect_twitter(auth_token)
            elif platform.lower() == "facebook":
                profile_data = self._connect_facebook(auth_token)
            elif platform.lower() == "instagram":
                profile_data = self._connect_instagram(auth_token)
            elif platform.lower() == "twitch":
                profile_data = self._connect_twitch(auth_token)
            else:
                return {"status": "error", "message": f"Plataforma não suportada: {platform}"}
                
            if profile_data:
                self.social_profiles[platform.lower()] = profile_data
                return {"status": "success", "platform": platform}
            else:
                return {"status": "error", "message": "Falha ao obter dados do perfil"}
                
        except Exception as e:
            print(f"Erro ao conectar perfil social: {str(e)}")
            return {"status": "error", "message": str(e)}
            
    def _connect_twitter(self, auth_token: str) -> Dict:

        return {
            "username": "fan_esports123",
            "follower_count": 342,
            "following_count": 567,
            "following_teams": ["FURIA", "LOUD", "paiN Gaming"],
            "engagement_score": 0.75,
            "last_posts": [
                {"text": "Que jogo incrível da FURIA ontem! #GoFURIA", "date": "2025-04-20"},
                {"text": "Quem vai assistir a final da CBLOL hoje?", "date": "2025-04-15"}
            ]
        }
        
    def _connect_facebook(self, auth_token: str) -> Dict:
        """Conecta conta do Facebook e extrai dados relevantes"""
        return {
            "name": "João Silva",
            "liked_pages": ["FURIA Esports", "CBLOL", "League of Legends"],
            "groups": ["Fãs de CS:GO Brasil", "VALORANT BR"],
            "events_attended": ["CBLOL Finals 2024", "Game XP 2024"]
        }
        
    def _connect_instagram(self, auth_token: str) -> Dict:
        """Conecta conta do Instagram e extrai dados relevantes"""
        return {
            "username": "esports_fan_br",
            "following": ["furiagg", "loudgg", "cblol", "riotgamesbrasil"],
            "engagement_posts": 12,
            "tagged_locations": ["Allianz Parque", "Arena CBLOL"]
        }
        
    def _connect_twitch(self, auth_token: str) -> Dict:
        """Conecta conta da Twitch e extrai dados relevantes"""
        return {
            "username": "furia_fan123",
            "subscriptions": ["furiatv", "gaules", "loud_coringa"],
            "watch_time": {
                "furiatv": 240,  # horas
                "gaules": 120,
                "cblol": 80
            },
            "chat_activity": "high"
        }
        
    def analyze_social_activity(self) -> Dict:

        if not self.social_profiles:
            return {"status": "error", "message": "Nenhum perfil social conectado"}
            
        # Extrair times mencionados/seguidos
        followed_teams = set()
        for platform, data in self.social_profiles.items():
            if platform == "twitter":
                followed_teams.update(data.get("following_teams", []))
            elif platform == "facebook":
                liked_pages = data.get("liked_pages", [])
                teams = [page for page in liked_pages if any(team in page for team in ["esports", "gaming", "gg"])]
                followed_teams.update(teams)
            elif platform == "twitch":
                team_channels = [sub for sub in data.get("subscriptions", []) 
                               if any(team in sub for team in ["furia", "loud", "pain", "intz"])]
                followed_teams.update(team_channels)
        
        # Extrair jogos de interesse
        games_of_interest = set()
        for platform, data in self.social_profiles.items():
            if platform == "facebook":
                pages = data.get("liked_pages", [])
                groups = data.get("groups", [])
                # Identificar jogos comuns
                game_keywords = ["CS:GO", "VALORANT", "League", "LoL", "Dota", "FIFA"]
                for content in pages + groups:
                    for game in game_keywords:
                        if game in content:
                            games_of_interest.add(game)
                            
        # Análise de engajamento
        engagement_levels = {}
        for platform, data in self.social_profiles.items():
            if platform == "twitter":
                engagement_levels["twitter"] = data.get("engagement_score", 0)
            elif platform == "twitch":
                watch_times = data.get("watch_time", {})
                if watch_times:
                    total_time = sum(watch_times.values())
                    engagement_levels["twitch"] = min(total_time / 500, 1.0)  # Normalizar para 0-1
                
        # Retornar insights compilados
        return {
            "favorite_teams": list(followed_teams),
            "games_of_interest": list(games_of_interest),
            "engagement_levels": engagement_levels,
            "overall_engagement": sum(engagement_levels.values()) / len(engagement_levels) if engagement_levels else 0,
            "analysis_date": datetime.now().strftime("%Y-%m-%d")
        }
        
    def validate_esports_profile(self, profile_url: str) -> Dict:
        try:
            content = self._fetch_profile_content(profile_url)
            
            # Verificar se o conteúdo é relevante para eSports
            relevance_score = self._analyze_content_relevance(content, "esports")
            
            # Verificar se o perfil parece pertencer ao usuário
            ownership_probability = self._verify_profile_ownership(content)
            
            # Extrair estatísticas relevantes
            statistics = self._extract_profile_statistics(content)
            
            return {
                "url": profile_url,
                "relevance_score": relevance_score,
                "ownership_probability": ownership_probability,
                "statistics": statistics,
                "validated": relevance_score > 0.7 and ownership_probability > 0.6,
                "validation_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
        except Exception as e:
            print(f"Erro ao validar perfil: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }
            
    def _fetch_profile_content(self, url: str) -> Dict:
        
        if "faceit.com" in url:
            return {
                "platform": "FACEIT",
                "username": "furia_fan123",
                "game": "CS:GO",
                "level": 8,
                "matches": 542,
                "win_rate": 53.2,
                "text_content": "Jogador de CS:GO, fã da FURIA. Jogo competitivo desde 2018."
            }
        elif "steamcommunity.com" in url:
            return {
                "platform": "Steam",
                "username": "furiafan_br",
                "games": ["Counter-Strike 2", "VALORANT", "Dota 2", "Apex Legends"],
                "hours_played": {
                    "Counter-Strike 2": 1240,
                    "VALORANT": 560,
                    "Dota 2": 120
                },
                "text_content": "Perfil Steam de um fã de eSports brasileiro. Jogo principalmente CS2 e VALORANT."
            }
        elif "tracker.gg" in url:
            return {
                "platform": "Tracker.gg",
                "game": "VALORANT",
                "rank": "Diamond 2",
                "win_rate": 51.8,
                "top_agents": ["Jett", "Reyna", "Omen"],
                "matches": 234,
                "text_content": "Estatísticas VALORANT. Main Jett/Reyna. Torço pela LOUD."
            }
        else:
            return {
                "platform": "Unknown",
                "text_content": "Conteúdo genérico de perfil online sem relevância clara para eSports."
            }
            
    def _analyze_content_relevance(self, content: Dict, topic: str) -> float:

        relevance_score = 0.0
        
        # Verificar plataforma
        esports_platforms = ["FACEIT", "Tracker.gg", "HLTV", "op.gg", "Liquipedia"]
        if content.get("platform") in esports_platforms:
            relevance_score += 0.4
            
        # Verificar presença de jogos populares de eSports
        esports_games = ["CS:GO", "Counter-Strike", "VALORANT", "League of Legends", 
                        "Dota", "Overwatch", "Rainbow Six"]
        
        user_games = []
        if "game" in content:
            user_games.append(content["game"])
        if "games" in content:
            user_games.extend(content["games"])
            
        game_matches = sum(1 for game in user_games if any(esport in game for esport in esports_games))
        if game_matches > 0:
            relevance_score += min(0.3, game_matches * 0.1)
            
        # Verificar estatísticas competitivas
        if any(key in content for key in ["rank", "level", "matches", "win_rate"]):
            relevance_score += 0.2
            
        # Verificar menções a times de eSports no texto
        esports_teams = ["FURIA", "LOUD", "paiN", "MIBR", "Team Liquid", "Navi", "Astralis", "fnatic"]
        text_content = content.get("text_content", "").lower()
        
        team_mentions = sum(1 for team in esports_teams if team.lower() in text_content)
        if team_mentions > 0:
            relevance_score += min(0.1, team_mentions * 0.05)
            
        return min(1.0, relevance_score)
        
    def _verify_profile_ownership(self, content: Dict) -> float:

        ownership_score = 0.0
        
        # Verificar correspondência de nome de usuário
        username = content.get("username", "").lower()
        if self.user_data.get("nome_completo"):
            nome_parts = self.user_data["nome_completo"].lower().split()
            for part in nome_parts:
                if part in username and len(part) > 3:  # Evitar partes muito curtas
                    ownership_score += 0.3
                    break
                    
        # Verificar correspondência de interesses
        if self.esports_preferences.get("jogos_favoritos"):
            user_games = []
            if "game" in content:
                user_games.append(content["game"])
            if "games" in content:
                user_games.extend(content["games"])
                
            matches = sum(1 for game in user_games if any(fav_game in game 
                                                         for fav_game in self.esports_preferences["jogos_favoritos"]))
            if matches > 0:
                ownership_score += min(0.3, matches * 0.1)
                
        # Verificar menções a times favoritos
        if self.esports_preferences.get("times_favoritos"):
            text_content = content.get("text_content", "").lower()
            
            team_mentions = sum(1 for team in self.esports_preferences["times_favoritos"] 
                               if team.lower() in text_content)
            if team_mentions > 0:
                ownership_score += min(0.2, team_mentions * 0.1)
  
        ownership_score += 0.2  
        
        return min(1.0, ownership_score)
        
    def _extract_profile_statistics(self, content: Dict) -> Dict:

        statistics = {}
        
        for key in ["game", "games", "level", "rank", "matches", "win_rate", "hours_played", "top_agents"]:
            if key in content:
                statistics[key] = content[key]
                
        return statistics
        
    def generate_fan_profile(self) -> Dict:
 
        if not self.user_data:
            return {"status": "error", "message": "Dados básicos não coletados"}
            
        profile = {
            "user_info": {
                "nome": self.user_data.get("nome_completo"),
                "email": self.user_data.get("email"),
                "data_nascimento": self.user_data.get("data_nascimento"),
                "localizacao": self.user_data.get("endereco", {}).get("cidade", "") + 
                             ", " + self.user_data.get("endereco", {}).get("estado", "")
            },
            "document_verification": {
                "status": self.document_verification_status,
                "verified_at": datetime.now().strftime("%Y-%m-%d") if self.document_verification_status == "verified" else None
            },
            "esports_profile": {
                "favorite_teams": self.esports_preferences.get("times_favoritos", []),
                "favorite_games": self.esports_preferences.get("jogos_favoritos", []),
                "competitions_followed": self.esports_preferences.get("competicoes_acompanhadas", []),
                "platforms_used": self.esports_preferences.get("plataformas_utilizadas", [])
            },
            "social_presence": {
                "platforms_connected": list(self.social_profiles.keys()),
                "total_platforms": len(self.social_profiles)
            },
            "engagement_metrics": self._calculate_engagement_metrics(),
            "profile_completeness": self._calculate_profile_completeness(),
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        if self.social_profiles:
            social_analysis = self.analyze_social_activity()
            if "status" not in social_analysis or social_analysis["status"] != "error":
                profile["social_analysis"] = social_analysis
        
        return profile
        
    def _calculate_engagement_metrics(self) -> Dict:

        metrics = {
            "overall_score": 0,
            "team_affinity": 0,
            "platform_activity": 0,
            "content_consumption": 0,
            "community_participation": 0
        }
        
        # Calcular afinidade com times
        if self.esports_preferences.get("times_favoritos"):
            team_count = len(self.esports_preferences["times_favoritos"])
            metrics["team_affinity"] = min(10, team_count * 2)
            
        # Calcular atividade em plataformas
        platform_count = len(self.social_profiles)
        metrics["platform_activity"] = min(10, platform_count * 2.5)
        
        if "twitch" in self.social_profiles:
            watch_times = self.social_profiles["twitch"].get("watch_time", {})
            if watch_times:
                total_hours = sum(watch_times.values())
                metrics["content_consumption"] = min(10, total_hours / 50)
                
        community_score = 0
        if "twitter" in self.social_profiles:
            engagement = self.social_profiles["twitter"].get("engagement_score", 0)
            community_score += engagement * 5
        if "twitch" in self.social_profiles:
            if self.social_profiles["twitch"].get("chat_activity") == "high":
                community_score += 5
            elif self.social_profiles["twitch"].get("chat_activity") == "medium":
                community_score += 3
        metrics["community_participation"] = min(10, community_score)
        
        metrics["overall_score"] = sum([
            metrics["team_affinity"],
            metrics["platform_activity"],
            metrics["content_consumption"],
            metrics["community_participation"]
        ]) / 4
        
        return metrics
        
    def _calculate_profile_completeness(self) -> Dict:

        completeness = {
            "overall_percentage": 0,
            "sections": {
                "basic_info": 0,
                "esports_preferences": 0,
                "document_verification": 0,
                "social_connections": 0
            }
        }
        
        if self.user_data:
            basic_fields = ["nome_completo", "cpf", "data_nascimento", "endereco", "email"]
            filled_count = sum(1 for field in basic_fields if field in self.user_data and self.user_data[field])
            completeness["sections"]["basic_info"] = (filled_count / len(basic_fields)) * 100
            
        if self.esports_preferences:
            preference_categories = ["jogos_favoritos", "times_favoritos", "competicoes_acompanhadas", 
                                    "plataformas_utilizadas"]
            filled_count = sum(1 for cat in preference_categories 
                              if cat in self.esports_preferences and self.esports_preferences[cat])
            completeness["sections"]["esports_preferences"] = (filled_count / len(preference_categories)) * 100
            
        completeness["sections"]["document_verification"] = 100 if self.document_verification_status == "verified" else 0
            
        # Conexões sociais
        if self.social_profiles:
            platform_count = len(self.social_profiles)
            max_platforms = 4  # Consideramos 4 plataformas como "completo"
            completeness["sections"]["social_connections"] = min(100, (platform_count / max_platforms) * 100)
            
        # Calcular porcentagem geral
        completeness["overall_percentage"] = sum(completeness["sections"].values()) / len(completeness["sections"])
        
        return completeness
        
    def export_data(self, format: str = "json") -> Union[str, Dict]:

        # Gerar perfil completo
        profile = self.generate_fan_profile()
        
        if format.lower() == "json":
            return json.dumps(profile, indent=4)
        elif format.lower() == "csv":
            # Simplificar para formato tabular
            flat_data = self._flatten_dict(profile)
            df = pd.DataFrame([flat_data])
            return df.to_csv(index=False)
        elif format.lower() == "dict":
            return profile
        else:
            raise ValueError(f"Formato não suportado: {format}")
            
    def _flatten_dict(self, d, parent_key='', sep='_'):
        items = []
        for k, v in d.items():
            new_key = parent_key + sep + k if parent_key else k
            if isinstance(v, dict):
                items.extend(self._flatten_dict(v, new_key, sep=sep).items())
            elif isinstance(v, list):
                items.append((new_key, ', '.join(map(str, v))))
            else:
                items.append((new_key, v))
        return dict(items)

def main():
    # Inicializar app
    app = KnowYourFanApp()
    
    user_info = {
        "nome_completo": "Lucas Silva",
        "cpf": "123.456.789-00",
        "data_nascimento": "1998-05-12",
        "endereco": {
            "rua": "Av. Paulista",
            "numero": "1000",
            "complemento": "Apto 123",
            "bairro": "Bela Vista",
            "cidade": "São Paulo",
            "estado": "SP",
            "cep": "01310-100"
        },
        "email": "lucas.silva@email.com",
        "telefone": "(11) 98765-4321"
    }
    app.collect_basic_info(user_info)
    
    preferences = {
        "jogos_favoritos": ["Counter-Strike 2", "VALORANT", "League of Legends"],
        "times_favoritos": ["FURIA", "LOUD", "paiN Gaming"],
        "competicoes_acompanhadas": ["CBLOL", "IEM", "VCT", "Major CS"],
        "plataformas_utilizadas": ["Twitch", "YouTube", "Steam", "Riot Games"],
        "streamers_favoritos": ["Gaules", "Alexandre Gaules", "jukes", "yeTz"]
    }
    app.collect_esports_preferences(preferences)
  
    document_result = app.verify_document("sample_document.jpg")
    print(f"Resultado da verificação de documento: {document_result['status']}")
    
    twitter_result = app.connect_social_profile("twitter", "sample_token")
    twitch_result = app.connect_social_profile("twitch", "sample_token")
    
    profile_validation = app.validate_esports_profile("https://faceit.com/en/players/furia_fan123")
    print(f"Perfil validado: {profile_validation['validated']}")
    
    fan_profile = app.generate_fan_profile()
    print("\nPerfil completo do fã:")
    print(json.dumps(fan_profile, indent=2))
    
    exported_data = app.export_data(format="json")
    print(f"\nDados exportados com sucesso! ({len(exported_data)} bytes)")

if __name__ == "__main__":
    main()