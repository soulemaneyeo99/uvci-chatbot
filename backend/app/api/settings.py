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

@router.post("/sync")
async def sync_moodle(
    current_user: User = Depends(auth_service.get_current_user)
):
    """Déclenche une synchronisation manuelle avec Moodle"""
    if not current_user.uvci_username or not current_user.uvci_password_encrypted:
        raise HTTPException(status_code=400, detail="Compte UVCI non configuré.")
    
    try:
        # Déchiffrer
        plain_password = decrypt(current_user.uvci_password_encrypted)
        
        # Scraper
        assignments = await moodle_service.get_assignments(
            current_user.uvci_username,
            plain_password
        )
        
        return {
            "status": "success",
            "count": len(assignments),
            "assignments": assignments
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la synchronisation : {str(e)}")
@router.get("/test-assignments-email")
async def test_assignments_email(
    current_user: User = Depends(auth_service.get_current_user)
):
    """Récupère les vrais devoirs et envoie la notification email immédiatement"""
    if not current_user.uvci_username or not current_user.uvci_password_encrypted:
        raise HTTPException(status_code=400, detail="Compte UVCI non configuré.")
    
    try:
        # 1. Déchiffrer
        plain_password = decrypt(current_user.uvci_password_encrypted)
        
        # 2. Scraper Moodle
        assignments = await moodle_service.get_assignments(
            current_user.uvci_username,
            plain_password
        )
        
        if not assignments:
            return {"message": "✅ Aucun devoir à venir détecté sur Moodle. Pas de mail envoyé.", "count": 0}
            
        # 3. Envoyer l'email réel
        from app.services.email_service import email_service
        success = await email_service.send_assignment_notification(current_user.email, assignments)
        
        if not success:
            raise HTTPException(status_code=500, detail="Échec de l'envoi de la notification réelle.")
            
        return {
            "message": f"🔥 Alerte réelle envoyée à {current_user.email} avec {len(assignments)} devoirs.",
            "count": len(assignments)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}")

@router.get("/test-email")
async def test_email(
    current_user: User = Depends(auth_service.get_current_user)
):
    """Envoie un email de test à l'utilisateur actuel"""
    from app.services.email_service import email_service
    success = await email_service.send_test_email(current_user.email)
    if not success:
        raise HTTPException(status_code=500, detail="Échec de l'envoi de l'email de test. Vérifiez vos variables d'environnement SMTP.")
    return {"message": f"Email de test envoyé avec succès à {current_user.email}"}
