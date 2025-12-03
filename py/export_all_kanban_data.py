import subprocess
import sys
import os
from datetime import datetime

def run_export_script(script_name):
    """Menjalankan script ekspor dan menampilkan hasilnya"""
    print(f"\n{'='*50}")
    print(f"Menjalankan {script_name}...")
    print(f"{'='*50}")
    
    try:
        result = subprocess.run([sys.executable, script_name], 
                              capture_output=True, text=True, cwd=os.path.dirname(os.path.abspath(__file__)))
        
        if result.returncode == 0:
            print(result.stdout)
        else:
            print(f"Error menjalankan {script_name}:")
            print(result.stderr)
    except Exception as e:
        print(f"Exception saat menjalankan {script_name}: {str(e)}")

def main():
    """Fungsi utama untuk menjalankan semua script ekspor"""
    print("Sistem Ekspor Data Kanban SRL")
    print(f"Waktu eksekusi: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    export_scripts = [
        "export_users.py",
        "export_student_grades.py",
        "export_difficulty_ratings.py",
        "export_course_ratings.py",
        "export_card_activities.py"
    ]
    
    for script in export_scripts:
        run_export_script(script)
    
    print(f"\n{'='*50}")
    print("Proses ekspor semua data kanban selesai!")
    print("File CSV telah dibuat di folder py/")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()