import httpx
from bs4 import BeautifulSoup
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

class MoodleService:
    """Service d'interaction avec la plateforme Moodle UVCI (Real Scraper)"""
    
    BASE_URL = "https://licences5.uvci.online"
    LOGIN_URL = f"{BASE_URL}/login/index.php"
    CALENDAR_URL = f"{BASE_URL}/calendar/view.php?view=upcoming"
    
    async def verify_credentials(self, username: str, password: str) -> bool:
        """
        Vérifie les identifiants en tentant une connexion réelle
        """
        async with httpx.AsyncClient() as client:
            try:
                # 1. Récupérer le token de login (nécessaire pour Moodle)
                login_page = await client.get(self.LOGIN_URL)
                soup = BeautifulSoup(login_page.text, 'html.parser')
                login_token = soup.find('input', {'name': 'logintoken'})
                
                if not login_token:
                    logger.error("❌ Impossible de trouver le logintoken Moodle")
                    return False
                    
                token_value = login_token['value']
                
                # 2. Tenter la connexion
                payload = {
                    'username': username,
                    'password': password,
                    'logintoken': token_value
                }
                
                response = await client.post(self.LOGIN_URL, data=payload, follow_redirects=True)
                
                # 3. Vérifier succès (Si on est redirigé vers le dashboard ou si on ne voit plus le form de login)
                if "login/index.php" not in str(response.url) and "Déconnexion" in response.text:
                    logger.info(f"✅ Connexion Moodle réussie pour {username}")
                    return True
                else:
                    logger.warning(f"❌ Échec connexion Moodle pour {username}")
                    return False
                    
            except Exception as e:
                logger.error(f"❌ Erreur connexion Moodle: {str(e)}")
                return False

    async def get_assignments(self, username: str, password_encrypted: str) -> List[Dict]:
        """
        Récupère les devoirs à venir via scraping du calendrier
        """
        # Note: password_encrypted doit être déchiffré avant appel (ici on suppose qu'on reçoit le mdp clair ou qu'on le déchiffre)
        # Pour simplifier l'intégration avec le Scheduler qui déchiffre déjà, on va assumer que l'appelant a passé le MDP CLAIR.
        # FIX: Le scheduler passe le MDP crypté, il faut le déchiffrer ICI ou l'appelant le fait.
        # Convention: Le scheduler déchiffre. Donc ici 'password_encrypted' est en fait le password clair.
        password = password_encrypted 

        async with httpx.AsyncClient() as client:
            try:
                # --- ÉTAPE 1: LOGIN ---
                login_page = await client.get(self.LOGIN_URL)
                soup = BeautifulSoup(login_page.text, 'html.parser')
                token_input = soup.find('input', {'name': 'logintoken'})
                if not token_input: return []
                
                payload = {
                    'username': username,
                    'password': password,
                    'logintoken': token_input['value']
                }
                await client.post(self.LOGIN_URL, data=payload, follow_redirects=True)
                
                # --- ÉTAPE 2: SCRAPING CALENDRIER ---
                response = await client.get(self.CALENDAR_URL)
                soup = BeautifulSoup(response.text, 'html.parser')
                
                assignments = []
                
                # Sélecteurs basés sur le screenshot (Standard Moodle Boost Theme)
                # Les événements sont souvent dans des div class="event"
                events = soup.find_all('div', class_='event')
                
                for event in events:
                    title_elem = event.find('h3', class_='name')
                    
                    # Tentative 1: Selecteur standard .date
                    date_elem = event.find('div', class_='date')
                    
                    # Tentative 2: Si échec, chercher dans les colonnes Bootstrap (souvent col-11 contient le texte)
                    if not date_elem:
                        # Chercher tous les divs qui pourraient contenir le texte
                        rows = event.find_all('div', class_='row')
                        for row in rows:
                            # Souvent la date est juste du texte dans une row
                            text = row.get_text(strip=True)
                            # Heuristique simple : contient un chiffre et ":" (heure)
                            if any(c.isdigit() for c in text) and ":" in text:
                                date_text = text
                                break
                        else:
                            date_text = "Date inconnue (Format non reconnu)"
                            # DEBUG: Afficher le HTML pour comprendre la structure
                            logger.warning(f"⚠️ Date introuvable pour '{title_elem.get_text(strip=True)}'. HTML: {event.prettify()[:200]}...")
                    else:
                        date_text = date_elem.get_text(strip=True)

                    if title_elem:
                        title = title_elem.get_text(strip=True)
                        
                        assignments.append({
                            "title": title,
                            "course": "Moodle Event",
                            "due_date": date_text,
                            "link": title_elem.find('a')['href'] if title_elem.find('a') else "#"
                        })
                
                # Fallback: Si pas de classe 'event', chercher les cartes standard 'card' (Moodle 4.0+)
                if not assignments:
                    cards = soup.find_all('div', class_='card')
                    for card in cards:
                        # Chercher une date dans la carte
                        date_possible = card.find('div', class_='text-muted') # Souvent la date est en gris
                        if date_possible:
                            date_text = date_possible.get_text(strip=True)
                        else:
                            date_text = "Date non trouvée"

                        if "se termine" in card.get_text() or "s'ouvre" in card.get_text():
                             assignments.append({
                                "title": card.find('h3').get_text(strip=True) if card.find('h3') else "Activité",
                                "course": "UVCI",
                                "due_date": date_text,
                                "link": "#"
                            })

                return assignments

            except Exception as e:
                logger.error(f"❌ Erreur Scraping Moodle: {str(e)}")
                return []

moodle_service = MoodleService()
