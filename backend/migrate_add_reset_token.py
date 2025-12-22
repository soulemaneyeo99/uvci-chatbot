"""
Script de migration pour ajouter les champs reset_token et reset_token_expires
à la table users.
"""
import sqlite3
import os
from pathlib import Path

def migrate_database():
    db_path = Path(__file__).parent / "uvci_chatbot.db"
    
    if not db_path.exists():
        print("❌ Base de données non trouvée. Elle sera créée automatiquement au prochain démarrage.")
        return
    
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    try:
        # Vérifier si les colonnes existent déjà
        cursor.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'reset_token' not in columns:
            print("➕ Ajout de la colonne reset_token...")
            cursor.execute("ALTER TABLE users ADD COLUMN reset_token TEXT")
            print("✅ Colonne reset_token ajoutée")
        else:
            print("✓ Colonne reset_token existe déjà")
        
        if 'reset_token_expires' not in columns:
            print("➕ Ajout de la colonne reset_token_expires...")
            cursor.execute("ALTER TABLE users ADD COLUMN reset_token_expires DATETIME")
            print("✅ Colonne reset_token_expires ajoutée")
        else:
            print("✓ Colonne reset_token_expires existe déjà")
        
        # Créer un index sur reset_token pour améliorer les performances
        try:
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token)")
            print("✅ Index créé sur reset_token")
        except sqlite3.OperationalError:
            print("✓ Index existe déjà")
        
        conn.commit()
        print("\n✅ Migration terminée avec succès!")
        
    except Exception as e:
        print(f"❌ Erreur lors de la migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()

