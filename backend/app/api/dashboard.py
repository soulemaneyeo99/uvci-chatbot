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
    
    # 1. Ajouter des devoirs Moodle si connectés
    if current_user.uvci_username and current_user.uvci_password_encrypted:
        try:
            plain_pass = decrypt(current_user.uvci_password_encrypted)
            moodle_events = await moodle_service.get_assignments(
                current_user.uvci_username, plain_pass
            )
            for i, me in enumerate(moodle_events):
                # Tentative de conversion de date sommaire pour le calendrier
                # Dans MoodleService, due_date est au format "Vendredi, 25 Décembre"
                # Pour la démo, on simule des dates proches si non parsable
                events.append({
                    "id": f"moodle-{i}",
                    "title": me["title"],
                    "start": (datetime.now().replace(day=datetime.now().day + (i % 5))).isoformat(),
                    "type": "assignment",
                    "source": "Moodle"
                })
        except Exception as e:
            print(f"Erreur Moodle Calendar: {e}")
            pass
            
    # 2. Événements Fixes Académiques (Waouh)
    academic_events = [
        {"id": "fixed-1", "title": "Fin du Semestre 1", "start": "2025-01-20T00:00:00", "type": "academic", "source": "UVCI"},
        {"id": "fixed-2", "title": "Début des Examens", "start": "2025-01-15T08:30:00", "type": "exam", "source": "UVCI"},
        {"id": "fixed-3", "title": "Congés de Noël", "start": "2024-12-23T00:00:00", "type": "holiday", "source": "UVCI"},
        {"id": "fixed-4", "title": "Session de Rattrapage", "start": "2025-02-10T09:00:00", "type": "exam", "source": "UVCI"},
    ]
    
    events.extend(academic_events)
    
    # Trier par date
    events.sort(key=lambda x: x['start'])
    
    return events
