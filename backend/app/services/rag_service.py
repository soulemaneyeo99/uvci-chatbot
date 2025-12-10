import chromadb
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Tuple
from app.config import settings
from app.utils.pdf_processor import pdf_processor
import os
import logging

logger = logging.getLogger(__name__)

class RAGService:
    """Service pour Retrieval Augmented Generation"""
    
    def __init__(self):
        # Créer le dossier de persistance s'il n'existe pas
        persist_directory = "./data/chroma"
        os.makedirs(persist_directory, exist_ok=True)
        
        # Initialiser ChromaDB avec la NOUVELLE API
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
        
        # Modèle pour les embeddings (multilingue français/anglais)
        logger.info("📥 Chargement du modèle d'embeddings...")
        self.embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        logger.info("✅ Modèle d'embeddings chargé")
    
    def index_document(self, document_id: str, file_path: str, filename: str) -> int:
        """
        Index un document PDF dans la base vectorielle
        
        Returns:
            Nombre de chunks indexés
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
            chunks = pdf_processor.chunk_text(
                clean_text,
                chunk_size=settings.CHUNK_SIZE,
                overlap=settings.CHUNK_OVERLAP
            )
            
            logger.info(f"✂️  {len(chunks)} chunks créés pour {filename}")
            
            # 4. Créer les embeddings
            embeddings = self.embedding_model.encode(chunks, show_progress_bar=False)
            
            # 5. Ajouter à ChromaDB
            chunk_ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
            metadatas = [
                {
                    "document_id": document_id,
                    "filename": filename,
                    "chunk_index": i,
                    "total_chunks": len(chunks)
                }
                for i in range(len(chunks))
            ]
            
            self.collection.add(
                ids=chunk_ids,
                embeddings=embeddings.tolist(),
                documents=chunks,
                metadatas=metadatas
            )
            
            logger.info(f"✅ {len(chunks)} chunks indexés avec succès")
            return len(chunks)
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'indexation: {str(e)}")
            return 0
    
    def search(self, query: str, top_k: int = None) -> Tuple[List[str], List[str]]:
        """
        Recherche les chunks pertinents pour une requête
        
        Returns:
            (chunks, sources) - Textes pertinents et noms des documents sources
        """
        if top_k is None:
            top_k = settings.TOP_K_RESULTS
        
        try:
            # 1. Créer l'embedding de la requête
            query_embedding = self.embedding_model.encode([query])[0]
            
            # 2. Rechercher dans ChromaDB
            results = self.collection.query(
                query_embeddings=[query_embedding.tolist()],
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