from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import auth_service
from app.models.user import User
from app.services.moodle_service import moodle_service
from app.utils.crypto import decrypt
from datetime import datetime
import random

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
async def get_academic_stats(
    current_user: User = Depends(auth_service.get_current_user)
):
    """Retourne les statistiques académiques de l'étudiant"""
    # Dans une version réelle, on calculerait ça via les notes Moodle
    # Ici on simule pour le Dashboard "Waouh"
    return {
        "overall_progress": 65, # 65% du semestre
        "courses_completed": 4,
        "courses_ongoing": 6,
        "average_grade": 14.5,
        "credits_earned": 18,
        "credits_total": 30
    }

@router.get("/announcements")
async def get_announcements():
    """Retourne les dernières annonces de l'UVCI"""
    return [
        {
            "id": "1",
            "title": "Paiement des frais de scolarité 2025",
            "date": "22 Déc. 2024",
            "category": "Administration",
            "content": "Le Trésor Money est désormais le seul canal officiel...",
            "priority": "high"
        },
        {
            "id": "2",
            "title": "Maintenance plateforme Licences 5",
            "date": "24 Déc. 2024",
            "category": "Technique",
            "content": "Une maintenance est prévue entre 02h et 04h du matin.",
            "priority": "medium"
        },
        {
            "id": "3",
            "title": "Cérémonie de remise de diplômes",
            "date": "15 Jan. 2025",
            "category": "Événement",
            "content": "La cérémonie aura lieu au siège du CAMES...",
            "priority": "low"
        }
    ]

@router.get("/calendar")
async def get_calendar_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user)
):
    """Récupère les événements pour le calendrier (Moodle + Admin)"""
    events = []
    
    # 1. Ajouter les devoirs Moodle si connectés
    if current_user.uvci_username and current_user.uvci_password_encrypted:
        try:
            plain_pass = decrypt(current_user.uvci_password_encrypted)
            moodle_events = await moodle_service.get_assignments(
                current_user.uvci_username, plain_pass
            )
            for me in moodle_events:
                events.append({
                    "id": f"moodle-{random.randint(100,999)}",
                    "title": me["title"],
                    "start": datetime.now().isoformat(), # On simplifie la date pour la démo
                    "type": "assignment",
                    "source": "Moodle"
                })
        except:
            pass
            
    # 2. Ajouter des événements fixes pour remplir le calendrier
    events.append({
        "id": "fixed-1",
        "title": "Fin du Semestre 1",
        "start": "2025-01-20T00:00:00",
        "type": "academic",
        "source": "UVCI"
    })
    
    return events
