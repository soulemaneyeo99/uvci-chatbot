from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import auth_service
from app.models.user import User
from app.schemas.settings import UVCICredentialsUpdate, UVCIStatusResponse
from app.services.moodle_service import moodle_service
from app.utils.crypto import encrypt, decrypt

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("/uvci", response_model=UVCIStatusResponse)
async def get_uvci_status(
    current_user: User = Depends(auth_service.get_current_user)
):
    """Vérifie si l'utilisateur a connecté son compte UVCI"""
    return {
        "is_connected": bool(current_user.uvci_username),
        "username": current_user.uvci_username,
        "message": "Connecté" if current_user.uvci_username else "Non connecté"
    }

@router.post("/uvci", response_model=UVCIStatusResponse)
async def update_uvci_credentials(
    creds: UVCICredentialsUpdate,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Enregistre les identifiants UVCI après vérification.
    Le mot de passe est chiffré avant d'être stocké.
    """
    # 1. Vérifier les identifiants auprès de Moodle (Simulation)
    is_valid = await moodle_service.verify_credentials(creds.username, creds.password)
    
    if not is_valid:
        raise HTTPException(400, "Identifiants UVCI incorrects ou erreur de connexion Moodle.")
    
    # 2. Chiffrer et sauvegarder
    encrypted_password = encrypt(creds.password)
    
    current_user.uvci_username = creds.username
    current_user.uvci_password_encrypted = encrypted_password
    db.commit()
    
    return {
        "is_connected": True,
        "username": creds.username,
        "message": "Connexion UVCI réussie ! Le robot veille maintenant sur vos devoirs."
    }

@router.delete("/uvci")
async def delete_uvci_credentials(
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Supprime la connexion UVCI"""
    current_user.uvci_username = None
    current_user.uvci_password_encrypted = None
    db.commit()
    
    return {"message": "Déconnexion UVCI effectuée"}
