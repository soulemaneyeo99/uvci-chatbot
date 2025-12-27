
import sqlite3
import os

# Chemin vers la base de donnée
DB_PATH = "uvci_chatbot.db"

def migrate():
    print(f"🔍 Vérification de la base de données: {DB_PATH}")
    if not os.path.exists(DB_PATH):
        print("❌ Base de données introuvable localement.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Vérifier si la colonne existe déjà
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "last_moodle_sync" not in columns:
            print("➕ Ajout de la colonne last_moodle_sync...")
            cursor.execute("ALTER TABLE users ADD COLUMN last_moodle_sync DATETIME")
            conn.commit()
            print("✅ Migration réussie !")
        else:
            print("ℹ️ La colonne last_moodle_sync existe déjà.")
            
    except Exception as e:
        print(f"❌ Erreur pendant la migration: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
