from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from app.database import get_db
from app.schemas.auth import (
    UserCreate, UserResponse, Token, UserLogin,
    PasswordResetRequest, PasswordReset
)
from app.services.auth_service import auth_service, ACCESS_TOKEN_EXPIRE_MINUTES
from app.services.email_service import email_service
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    hashed_password = auth_service.get_password_hash(user.password)
    new_user = User(
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name,
        role=user.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
async def login(form_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.email).first()
    if not user or not auth_service.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(auth_service.get_current_user)):
    return current_user

@router.post("/forgot-password")
async def forgot_password(
    request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """
    Demande de réinitialisation de mot de passe.
    Envoie un email avec un lien de réinitialisation.
    Ne révèle pas si l'email existe ou non (sécurité).
    """
    user = db.query(User).filter(User.email == request.email).first()
    
    # Ne pas révéler si l'email existe (meilleure pratique de sécurité)
    # Toujours retourner un succès même si l'email n'existe pas
    if user:
        # Générer un token sécurisé
        reset_token = auth_service.generate_reset_token()
        hashed_token = auth_service.hash_reset_token(reset_token)
        
        # Stocker le token hashé et la date d'expiration (30 minutes)
        user.reset_token = hashed_token
        user.reset_token_expires = datetime.utcnow() + timedelta(minutes=30)
        db.commit()
        
        # Envoyer l'email (ou logger en mode dev)
        await email_service.send_password_reset_email(
            email=user.email,
            reset_token=reset_token  # Envoyer le token non hashé
        )
    
    # Toujours retourner un succès pour ne pas révéler si l'email existe
    return {
        "message": "Si cet email existe dans notre système, vous recevrez un lien de réinitialisation."
    }

@router.post("/reset-password")
async def reset_password(
    reset_data: PasswordReset,
    db: Session = Depends(get_db)
):
    """
    Réinitialise le mot de passe avec un token valide.
    """
    # Valider que les mots de passe correspondent
    if reset_data.new_password != reset_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Les mots de passe ne correspondent pas"
        )
    
    # Valider la force du mot de passe
    if len(reset_data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le mot de passe doit contenir au moins 8 caractères"
        )
    
    # Hash le token pour la recherche
    hashed_token = auth_service.hash_reset_token(reset_data.token)
    
    # Trouver l'utilisateur avec ce token
    user = db.query(User).filter(
        User.reset_token == hashed_token,
        User.reset_token_expires > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token invalide ou expiré"
        )
    
    # Mettre à jour le mot de passe
    user.password_hash = auth_service.get_password_hash(reset_data.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    
    return {
        "message": "Mot de passe réinitialisé avec succès"
    }
