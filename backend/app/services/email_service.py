import logging
import os
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    """Service d'envoi d'emails pour la réinitialisation de mot de passe"""
    
    def __init__(self):
        # Configuration SMTP (synchronisée avec app/config.py)
        self.smtp_enabled = settings.SMTP_ENABLED
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.FROM_EMAIL
        
    async def send_password_reset_email(
        self, 
        email: str, 
        reset_token: str,
        frontend_url: str = "http://localhost:3000"
    ) -> bool:
        """Envoie un email de réinitialisation de mot de passe professionnel"""
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"
        subject = "🔐 Réinitialisation de votre mot de passe - Vision 360"
        
        # Version Texte brut
        text_body = f"Bonjour,\n\nVous avez demandé à réinitialiser votre mot de passe pour votre compte UVCI Vision 360.\n\nCliquez sur ce lien : {reset_link}\n\nCe lien est valide 30 min.\n\nL'équipe UVCI"
        
        # Version HTML (Premium)
        html_body = f"""
        <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #4c1d95; padding: 40px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Vision 360 🎯</h1>
                    <p style="color: #ddd6fe; margin-top: 8px;">Sécurité de votre compte</p>
                </div>
                <div style="padding: 40px 30px; line-height: 1.6; color: #374151;">
                    <h2 style="color: #111827; margin-top: 0;">Réinitialisation demandée</h2>
                    <p>Bonjour,</p>
                    <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte <strong>Assistant UVCI Vision 360</strong>. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="{reset_link}" style="background-color: #4c1d95; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 10px 15px -3px rgba(76, 29, 149, 0.3);">Réinitialiser mon mot de passe</a>
                    </div>
                    <p style="font-size: 14px; color: #6b7280; text-align: center;">Ce lien expirera dans 30 minutes.</p>
                </div>
                <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
                    &copy; 2024 Assistant UVCI - Vision 360 • Système Éducatif Intelligent
                </div>
            </div>
        </body>
        </html>
        """
        
        if self.smtp_enabled:
            return await self._send_smtp_email(email, subject, text_body, html_body)
        else:
            logger.info(f"🔐 [DEV MODE] Reset link for {email}: {reset_link}")
            return True

    async def send_assignment_notification(self, email: str, assignments: list) -> bool:
        """Envoie une notification de devoirs ultra-pro (HTML)"""
        subject = f"📚 {len(assignments)} Nouveaux Devoirs détectés - Vision 360"
        
        # Construction des lignes de devoirs
        assignment_items_html = ""
        for assign in assignments:
            priority_color = "#ef4444" if "termine" in assign['title'].lower() else "#f59e0b"
            assignment_items_html += f"""
            <div style="padding: 16px; background-color: #f9fafb; border-radius: 12px; border-left: 4px solid {priority_color}; margin-bottom: 12px;">
                <h4 style="margin: 0; color: #111827; font-size: 16px;">{assign['title']}</h4>
                <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">
                    📅 <strong>Échéance :</strong> {assign['due_date']}
                </p>
                <div style="margin-top: 8px;">
                    <a href="{assign.get('link', 'https://licences5.uvci.online/my/')}" style="color: #4c1d95; font-size: 12px; font-weight: bold; text-decoration: none;">Voir sur Moodle &rarr;</a>
                </div>
            </div>
            """
            
        html_body = f"""
        <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
                <div style="background: linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%); padding: 30px 20px; text-align: center;">
                    <div style="display: inline-block; padding: 10px; background-color: rgba(255,255,255,0.1); border-radius: 50%; margin-bottom: 15px;">
                        <span style="font-size: 30px;">🚀</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px;">Nouveaux Devoirs Détectés</h1>
                    <p style="color: #a5b4fc; margin: 5px 0 0 0;">Votre Vision 360 est à jour</p>
                </div>
                <div style="padding: 30px;">
                    <p style="color: #374151; font-size: 15px; margin-bottom: 25px;">Bonjour, votre assistant intelligent a scanné la plateforme Moodle et a trouvé <strong>{len(assignments)} activités</strong> nécessitant votre attention :</p>
                    
                    {assignment_items_html}
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:3000/dashboard" style="background-color: #4c1d95; color: #ffffff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">Ouvrir Vision 360</a>
                    </div>
                </div>
                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">Notification automatique • Ne pas répondre</p>
                    <p style="margin: 5px 0 0 0; font-size: 11px; color: #d1d5db;">Assistant UVCI - Propulsé par Gemini AI</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_body = f"Bonjour, {len(assignments)} nouveaux devoirs ont été détectés sur Moodle. Connectez-vous à votre dashboard Vision 360 pour les voir."

        if self.smtp_enabled:
            return await self._send_smtp_email(email, subject, text_body, html_body)
        else:
            logger.info(f"📧 [DEV MODE] Notif envoyée à {email}")
            return True

    async def _send_smtp_email(self, to_email: str, subject: str, text_body: str, html_body: str = None) -> bool:
        """Envoie un email via SMTP (Supporte HTML + Texte)"""
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart
            
            msg = MIMEMultipart('alternative')
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Attacher les deux versions
            msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
            if html_body:
                msg.attach(MIMEText(html_body, 'html', 'utf-8'))
            
            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"✅ Email Premium envoyé avec succès à {to_email}")
            return True
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'envoi de l'email: {e}")
            return False

email_service = EmailService()

