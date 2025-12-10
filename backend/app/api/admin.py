from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from typing import List
import shutil
import os
import uuid
from app.services.auth_service import auth_service
from app.services.rag_service import rag_service
from app.models.user import User

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_admin: User = Depends(auth_service.get_current_admin)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(400, "Seuls les fichiers PDF sont acceptés")
    
    # Sauvegarder le fichier temporairement
    upload_dir = "./uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_id = str(uuid.uuid4())
    file_path = os.path.join(upload_dir, f"{file_id}_{file.filename}")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Indexer (Ceci est bloquant, idéalement à faire en background task)
        # Pour l'instant on le fait direct pour avoir le retour immédiat
        chunks_count = rag_service.index_document(file_id, file_path, file.filename)
        
        if chunks_count == 0:
            os.remove(file_path)
            raise HTTPException(500, "Échec de l'indexation du document")
            
        return {
            "message": "Document uploadé et indexé avec succès",
            "document_id": file_id,
            "filename": file.filename,
            "chunks_indexed": chunks_count
        }
        
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(500, f"Erreur upload: {str(e)}")

@router.get("/documents")
async def list_documents(current_admin: User = Depends(auth_service.get_current_admin)):
    return rag_service.list_documents()

@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_admin: User = Depends(auth_service.get_current_admin)
):
    success = rag_service.delete_document_chunks(document_id)
    if not success:
        raise HTTPException(404, "Document introuvable ou erreur suppression")
    return {"message": "Document supprimé avec succès"}
