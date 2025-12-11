import chromadb
import google.generativeai as genai
from typing import List, Dict, Tuple
from app.config import settings
from app.utils.pdf_processor import pdf_processor
import os
import logging
import asyncio

logger = logging.getLogger(__name__)

class RAGService:
    """Service pour Retrieval Augmented Generation"""
    
    def __init__(self):
        # Configurer Gemini
        if settings.GOOGLE_API_KEY:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
        else:
            logger.warning("⚠️ GOOGLE_API_KEY manquant. Le RAG ne fonctionnera pas.")

        # Créer le dossier de persistance s'il n'existe pas
        persist_directory = "./data/chroma"
        os.makedirs(persist_directory, exist_ok=True)
        
        # Initialiser ChromaDB
        self.chroma_client = chromadb.PersistentClient(path=persist_directory)
        
        # Créer ou récupérer la collection
        try:
            self.collection = self.chroma_client.get_collection("uvci_documents")
            logger.info("✅ Collection ChromaDB existante récupérée")
        except:
            self.collection = self.chroma_client.create_collection(
                name="uvci_documents",
                metadata={"description": "Documents UVCI pour RAG"}
            )
            logger.info("✅ Nouvelle collection ChromaDB créée")
        
        logger.info("✅ RAG Service initialisé (Gemini Embeddings)")
    
    def _get_embedding(self, text: str) -> List[float]:
        """Génère un embedding avec Gemini"""
        try:
            # Nettoyer et tronquer si nécessaire (limite Gemini)
            if len(text) > 9000:
                text = text[:9000]
            
            # Utiliser le modèle d'embedding le plus récent
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=text,
                task_type="retrieval_document",
                title="Document chunk"
            )
            return result['embedding']
        except Exception as e:
            logger.warning(f"⚠️ Erreur embedding text-embedding-004, essai embedding-001: {str(e)}")
            try:
                # Fallback sur l'ancien modèle
                result = genai.embed_content(
                    model="models/embedding-001",
                    content=text,
                    task_type="retrieval_document",
                    title="Document chunk"
                )
                return result['embedding']
            except Exception as e2:
                logger.error(f"❌ Erreur embedding persistante: {str(e2)}")
                return []

    def _get_query_embedding(self, text: str) -> List[float]:
        """Génère un embedding pour une requête"""
        try:
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=text,
                task_type="retrieval_query"
            )
            return result['embedding']
        except Exception as e:
            try:
                result = genai.embed_content(
                    model="models/embedding-001",
                    content=text,
                    task_type="retrieval_query"
                )
                return result['embedding']
            except Exception as e2:
                logger.error(f"❌ Erreur embedding requête Gemini: {str(e2)}")
                return []

    def index_document(self, document_id: str, file_path: str, filename: str) -> int:
        """
        Index un document PDF dans la base vectorielle
        """
        try:
            # 1. Extraire le texte du PDF
            logger.info(f"📄 Extraction du texte de {filename}...")
            raw_text = pdf_processor.extract_text(file_path)
            
            if not raw_text or len(raw_text) < 100:
                logger.warning(f"⚠️  Texte trop court ou vide pour {filename}")
                return 0
            
            # 2. Nettoyer le texte
            clean_text = pdf_processor.clean_text(raw_text)
            
            # 3. Découper en chunks
            # Augmenter la taille des chunks pour Gemini (il gère mieux le contexte)
            chunks = pdf_processor.chunk_text(
                clean_text,
                chunk_size=1000, 
                overlap=200
            )
            
            logger.info(f"✂️  {len(chunks)} chunks créés pour {filename}")
            
            # 4. Créer les embeddings et ajouter à ChromaDB
            ids = []
            embeddings = []
            valid_chunks = []
            metadatas = []

            for i, chunk in enumerate(chunks):
                # Pause pour éviter de spammer l'API (Rate limit)
                # Note: Sur la version synchrone on ne peut pas await, mais c'est rapide.
                
                embedding = self._get_embedding(chunk)
                if embedding:
                    ids.append(f"{document_id}_chunk_{i}")
                    embeddings.append(embedding)
                    valid_chunks.append(chunk)
                    metadatas.append({
                        "document_id": document_id,
                        "filename": filename,
                        "chunk_index": i,
                        "total_chunks": len(chunks)
                    })
            
            if not ids:
                logger.warning("Aucun embedding généré.")
                return 0

            # 5. Ajouter à ChromaDB par lots (batch)
            self.collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=valid_chunks,
                metadatas=metadatas
            )
            
            logger.info(f"✅ {len(ids)} chunks indexés avec succès")
            return len(ids)
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'indexation: {str(e)}")
            return 0
    
    def search(self, query: str, top_k: int = None) -> Tuple[List[str], List[str]]:
        """
        Recherche les chunks pertinents pour une requête
        """
        if top_k is None:
            top_k = settings.TOP_K_RESULTS
        
        try:
            # 1. Créer l'embedding de la requête
            query_embedding = self._get_query_embedding(query)
            
            if not query_embedding:
                return [], []

            # 2. Rechercher dans ChromaDB
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k
            )
            
            if not results['documents'] or not results['documents'][0]:
                return [], []
            
            # 3. Extraire les chunks et sources
            chunks = results['documents'][0]
            sources = [meta['filename'] for meta in results['metadatas'][0]]
            
            return chunks, sources
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de la recherche RAG: {str(e)}")
            return [], []
    
    def get_rag_context(self, query: str) -> Tuple[str, List[str]]:
        """
        Récupère le contexte RAG formaté pour Gemini
        
        Returns:
            (context_text, sources) - Contexte formaté et liste des sources
        """
        chunks, sources = self.search(query)
        
        if not chunks:
            return "", []
        
        # Formater le contexte
        context_parts = []
        unique_sources = list(set(sources))
        
        for i, chunk in enumerate(chunks):
            source = sources[i]
            context_parts.append(f"[Document: {source}]\n{chunk}\n")
        
        context_text = "\n---\n".join(context_parts)
        return context_text, unique_sources
    
    def list_documents(self) -> List[Dict]:
        """Liste tous les documents indexés (uniques)"""
        try:
            results = self.collection.get(include=['metadatas'])
            metadatas = results['metadatas']
            
            docs_map = {}
            for meta in metadatas:
                if meta and 'document_id' in meta:
                    doc_id = meta['document_id']
                    if doc_id not in docs_map:
                        docs_map[doc_id] = {
                            "id": doc_id,
                            "filename": meta.get('filename', 'Inconnu'),
                            "chunk_count": meta.get('total_chunks', 0),
                            "upload_date": meta.get('upload_date', None)
                        }
            
            return list(docs_map.values())
        except Exception as e:
            logger.error(f"❌ Erreur list_documents: {str(e)}")
            return []

    def delete_document_chunks(self, document_id: str):
        """Supprime tous les chunks d'un document"""
        try:
            # Récupérer tous les IDs des chunks du document
            results = self.collection.get(
                where={"document_id": document_id}
            )
            
            if results['ids']:
                self.collection.delete(ids=results['ids'])
                logger.info(f"🗑️  {len(results['ids'])} chunks supprimés")
                return True
            return False
        except Exception as e:
            logger.error(f"❌ Erreur suppression chunks: {str(e)}")
            return False

# Instance globale
rag_service = RAGService()