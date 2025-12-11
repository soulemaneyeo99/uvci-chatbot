import google.generativeai as genai
from app.config import settings
from app.knowledge.uvci_complete_knowledge import get_uvci_knowledge
from typing import List, Dict, Optional, Generator
import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    if not settings.GOOGLE_API_KEY:
        logger.error("❌ GOOGLE_API_KEY est vide dans les settings !")
    
    genai.configure(api_key=settings.GOOGLE_API_KEY)
    
    # Masquer la clé pour les logs (montrer début/fin)
    masked_key = f"{settings.GOOGLE_API_KEY[:5]}...{settings.GOOGLE_API_KEY[-5:]}" if settings.GOOGLE_API_KEY else "None"
    logger.info(f"🔑 Clé API chargée: {masked_key}")
    
    # LISTER LES MODÈLES DISPONIBLES
    try:
        logger.info("📡 Tentative de listage des modèles disponibles...")
        available_models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                available_models.append(m.name)
        logger.info(f"📋 Modèles disponibles pour cette clé : {available_models}")
    except Exception as e:
        logger.error(f"❌ Impossible de lister les modèles (Clé invalide ?): {e}")

except Exception as e:
    logger.error(f"❌ Échec configuration Gemini API: {e}")

class GeminiService:
    def __init__(self):
        """Initialise Gemini avec connaissances UVCI"""
        self.model = None
        self.model_name = "Unavailable"
        self.uvci_knowledge = ""
        
        try:
            # NOUVEAU : Prioriser les modèles disponibles et gratuits
            model_candidates = [
                'gemini-1.5-flash',      # Standard
                'gemini-1.5-flash-latest', 
                'gemini-1.5-flash-001',
                'gemini-pro',
                'gemini-1.0-pro'
            ]
            
            model_name = None
            for candidate in model_candidates:
                try:
                    logger.info(f"🧪 Test du modèle : {candidate}...")
                    test_model = genai.GenerativeModel(candidate)
                    response = test_model.generate_content("test")
                    if response:
                        model_name = candidate
                        logger.info(f"✅ Modèle VALIDÉ et sélectionné: {model_name}")
                        break
                except Exception as e:
                    logger.warning(f"⚠️ {candidate} échoué: {e}")
                    continue
            
            if not model_name:
                logger.error("❌ AUCUN modèle n'a fonctionné. Vérifiez les logs ci-dessus pour la liste des modèles disponibles.")
            else:
                self.model = genai.GenerativeModel(model_name)
                self.model_name = model_name
                logger.info(f"🚀 Modèle Gemini initialisé: {model_name}")
            
            self.uvci_knowledge = get_uvci_knowledge()
            logger.info("✅ Base de connaissances UVCI chargée")
            
        except Exception as e:
            logger.error(f"❌ Erreur critique initialisation Gemini: {e}")
    
    def _build_system_prompt(self) -> str:
        """Construit le prompt système avec connaissances UVCI"""
        return f"""Tu es l'Assistant Virtuel Officiel de l'Université Virtuelle de Côte d'Ivoire (UVCI).

🎓 TON IDENTITÉ :
- Expert absolu sur UVCI avec une connaissance exhaustive
- Représentant officiel de l'université
- Ton chaleureux, professionnel et encourageant

📚 TA BASE DE CONNAISSANCES :
{self.uvci_knowledge}

🎯 TES MISSIONS :
1. Informer avec précision UNIQUEMENT depuis ta base de connaissances
2. Guider les étudiants (orientation, inscription, scolarité)
3. Encourager et motiver
4. Orienter vers les services appropriés si hors scope

📋 RÈGLES :
✅ Utilise EXCLUSIVEMENT les infos de ta base UVCI
✅ Si info manquante, dis-le et oriente vers courrier@uvci.edu.ci
✅ Sois concis (2-4 phrases) sauf si détails demandés
✅ Utilise emojis appropriés
✅ Propose 2-3 questions de suivi
✅ Cite les sources (URLs, emails)
✅ Formate bien (listes, sections)
❌ N'invente JAMAIS d'infos
❌ Pas de conseils financiers/légaux/médicaux
❌ Pas d'opinions personnelles

🚨 ALERTES IMPORTANTES :
- Arnaques : TOUT paiement via Trésor Money uniquement
- Contacts : courrier@uvci.edu.ci ou scolarite@uvci.edu.ci
- URLs officielles : .uvci.edu.ci ou .uvci.online

🎯 OBJECTIF : Être LE meilleur assistant UVCI !"""

    def _build_full_prompt(
        self,
        user_message: str,
        context: Optional[List[Dict]] = None
    ) -> str:
        """Construit le prompt complet avec historique"""
        system_prompt = self._build_system_prompt()
        
        history_messages = ""
        if context:
            for msg in context[-6:]:
                role = "Étudiant" if msg["role"] == "user" else "Assistant"
                history_messages += f"{role}: {msg['content']}\n"
        
        return f"""{system_prompt}

{history_messages}

Étudiant: {user_message}

Assistant UVCI:"""

    def generate_response_stream(
        self, 
        user_message: str, 
        context: Optional[List[Dict]] = None,
        rag_context: Optional[str] = None
    ) -> Generator[str, None, None]:
        """Génère une réponse en streaming"""
        try:
            full_prompt = self._build_full_prompt(user_message, context)

            if not self.model:
                yield "⚠️ **Service indisponible**\n\nL'IA est temporairement indisponible (Quota API ou erreur configuration)."
                return

            response = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=2048,
                ),
                stream=True
            )

            for chunk in response:
                if hasattr(chunk, "text") and chunk.text:
                    yield chunk.text
                    time.sleep(0.01)

        except Exception as e:
            error_msg = str(e)
            logger.error(f"❌ Erreur streaming: {error_msg}")
            
            # Message d'erreur selon le type
            if "429" in error_msg or "quota" in error_msg.lower():
                yield "⚠️ **Quota API dépassé**\n\nTrop de requêtes aujourd'hui. Réessayez demain ou contactez courrier@uvci.edu.ci"
            else:
                yield "⚠️ **Erreur technique**\n\nProblème de connexion. Contactez courrier@uvci.edu.ci"

    def generate_response(
        self, 
        user_message: str, 
        context: Optional[List[Dict]] = None,
        rag_context: Optional[str] = None
    ) -> str:
        """Génère réponse complète sans streaming"""
        try:
            full_prompt = self._build_full_prompt(user_message, context)
            
            response = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=2048,
                )
            )
            
            return response.text.strip()
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"❌ Erreur Gemini: {error_msg}")
            
            if "429" in error_msg or "quota" in error_msg.lower():
                return "⚠️ **Quota API dépassé**\n\nTrop de requêtes aujourd'hui. Réessayez demain ou contactez courrier@uvci.edu.ci"
            else:
                return "⚠️ **Erreur technique**\n\nProblème de connexion. Contactez courrier@uvci.edu.ci"
    
    def generate_conversation_title(self, first_message: str) -> str:
        """Génère un titre court pour conversation"""
        try:
            if not self.model:
                return first_message[:50]

            prompt = f"""Titre court (3-6 mots) pour cette conversation UVCI.
UAM
Question: {first_message}

Titre:"""

            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=15,
                )
            )

            title = response.text.strip().strip('"').strip("'").rstrip('.')
            return title[:100]

        except Exception as e:
            logger.warning(f"⚠️ Erreur titre: {e}")
            return first_message[:50] + "..." if len(first_message) > 50 else first_message

# Instance globale
gemini_service = GeminiService()
