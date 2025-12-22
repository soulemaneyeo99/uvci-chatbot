from cryptography.fernet import Fernet
import os
import base64
from app.config import settings

# Générer une clé stable basée sur le SECRET_KEY (ou une variable dédiée)
# Pour la prod, il faudrait une clé dédiée mais ici on dérive du SECRET_KEY pour simplifier
def get_cipher_suite():
    # Fernet a besoin d'une clé de 32 bytes base64-encoded
    # On utilise le SECRET_KEY, on le hash/pad pour avoir la bonne longueur
    key = os.getenv("ENCRYPTION_KEY")
    if not key:
        # Fallback pour dev: utilisation d'une clé fixe déterministe (MAUVAISE PRATIQUE PROD)
        # Mais nécessaire si on redémarre le serveur et qu'on veut déchiffrer
        # Dans un vrai cas, ENCRYPTION_KEY doit être dans le .env
        import hashlib
        secret = os.getenv("SECRET_KEY", "dev-secret-key").encode()
        key = base64.urlsafe_b64encode(hashlib.sha256(secret).digest())
    return Fernet(key)

def encrypt(text: str) -> str:
    """Chiffre un texte"""
    if not text:
        return None
    cipher_suite = get_cipher_suite()
    return cipher_suite.encrypt(text.encode()).decode()

def decrypt(encrypted_text: str) -> str:
    """Déchiffre un texte"""
    if not encrypted_text:
        return None
    cipher_suite = get_cipher_suite()
    return cipher_suite.decrypt(encrypted_text.encode()).decode()
