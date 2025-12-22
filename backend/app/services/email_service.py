import logging
import os
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    """Service d'envoi d'emails pour la réinitialisation de mot de passe"""
    
    def __init__(self):
        # Configuration SMTP (optionnelle, pour production)
        self.smtp_enabled = os.getenv("SMTP_ENABLED", "false").lower() == "true"
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@uvci.edu.ci")
        
    async def send_password_reset_email(
        self, 
        email: str, 
        reset_token: str,
        frontend_url: str = "http://localhost:3000"
    ) -> bool:
        """
        Envoie un email de réinitialisation de mot de passe
        
        Args:
            email: Adresse email du destinataire
            reset_token: Token de réinitialisation
            frontend_url: URL du frontend pour construire le lien
            
        Returns:
            True si l'email a été envoyé avec succès
        """
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"
        
        subject = "Réinitialisation de votre mot de passe - UVCI"
        body = f"""
Bonjour,

Vous avez demandé à réinitialiser votre mot de passe pour votre compte UVCI.

Cliquez sur le lien suivant pour réinitialiser votre mot de passe :
{reset_link}

Ce lien est valide pendant 30 minutes.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Cordialement,
L'équipe UVCI
        """.strip()
        
        if self.smtp_enabled:
            return await self._send_smtp_email(email, subject, body)
        else:
            # Mode développement : logger le token (utiliser les deux pour être sûr)
            separator = "=" * 70
            message = f"\n{separator}\n"
            message += f"📧 EMAIL DE RÉINITIALISATION (Mode Développement)\n"
            message += f"{separator}\n"
            message += f"À: {email}\n"
            message += f"Token: {reset_token}\n"
            message += f"Lien: {reset_link}\n"
            message += f"{separator}\n"
            
            # Logger (pour les logs structurés)
            logger.info(f"🔐 [DEV MODE] Password reset token for {email}: {reset_token}")
            logger.info(f"🔗 [DEV MODE] Reset link: {reset_link}")
            
            # Print (pour stdout qui est redirigé vers le fichier de log)
            print(message, flush=True)
            import sys
            sys.stdout.flush()
            
            return True
    
    async def _send_smtp_email(self, to_email: str, subject: str, body: str) -> bool:
        """Envoie un email via SMTP"""
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart
            
            msg = MIMEMultipart()
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain', 'utf-8'))
            
            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"✅ Email envoyé avec succès à {to_email}")
            return True
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'envoi de l'email: {e}")
            return False

    async def send_assignment_notification(self, email: str, assignments: list) -> bool:
        """Envoie une notification de nouveaux devoirs"""
        subject = f"📚 {len(assignments)} Nouveaux Devoirs détectés - UVCI"
        
        assignments_list = ""
        for assign in assignments:
            assignments_list += f"- {assign['course']} : {assign['title']} (Pour le {assign['due_date']})\n"
            assignments_list += f"  Lien : {assign.get('link', '#')}\n\n"
            
        body = f"""
Bonjour,

Votre assistant UVCI a détecté de nouveaux devoirs sur la plateforme :

{assignments_list}

Ne les oubliez pas !

Cordialement,
Votre Assistant Personnel
        """.strip()

        if self.smtp_enabled:
            return await self._send_smtp_email(email, subject, body)
        else:
            # Mode DEV : Logger
            separator = "=" * 70
            message = f"\n{separator}\n"
            message += f"📧 EMAIL NOTIFICATION DEVOIRS (Mode Développement)\n"
            message += f"{separator}\n"
            message += f"À: {email}\n"
            message += f"Sujet: {subject}\n"
            message += f"Contenu:\n{body}\n"
            message += f"{separator}\n"
            
            logger.info(f"📧 [DEV MODE] Email sent to {email}: {len(assignments)} assignments")
            print(message, flush=True)
            return True

email_service = EmailService()

