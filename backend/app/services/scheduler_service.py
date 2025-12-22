import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.services.moodle_service import moodle_service

logger = logging.getLogger(__name__)

class SchedulerService:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        
    def start(self):
        """Démarrer le planificateur"""
        # Ajouter le job périodique (toutes les 1 heure)
        self.scheduler.add_job(self.check_all_homeworks, 'interval', minutes=60)
        self.scheduler.start()
        logger.info("⏰ Scheduler démarré (Vérification devoirs active)")

    async def check_all_homeworks(self):
        """Vérifie les devoirs pour tous les utilisateurs connectés"""
        logger.info("⏰ Début du scan des devoirs UVCI...")
        
        db = SessionLocal()
        try:
            users = db.query(User).filter(User.uvci_username != None).all()
            logger.info(f"👥 Scan pour {len(users)} utilisateurs connectés.")
            
            for user in users:
                if not user.uvci_password_encrypted:
                    continue
                    
                from app.utils.crypto import decrypt
                
                # Déchiffrer le mot de passe pour le scraper
                try:
                    plain_password = decrypt(user.uvci_password_encrypted)
                except Exception:
                    logger.error(f"❌ Échec déchiffrement MDP pour {user.email}")
                    continue

                assignments = await moodle_service.get_assignments(
                    user.uvci_username, 
                    plain_password
                )
                
                if assignments:
                    logger.info(f"🚨 NOUVEAU DEVOIR pour {user.full_name or user.email} !")
                    for assign in assignments:
                        logger.info(f"   📝 {assign['title']} (Pour le {assign['due_date']})")
                        
                    # Envoyer Notification Email
                    from app.services.email_service import email_service
                    await email_service.send_assignment_notification(user.email, assignments)
                    logger.info(f"📧 Notification envoyée à {user.email}")
                else:
                    logger.info(f"✅ Rien à signaler pour {user.email}")
                    
        except Exception as e:
            logger.error(f"❌ Erreur Scheduler: {e}")
        finally:
            db.close()

scheduler_service = SchedulerService()
