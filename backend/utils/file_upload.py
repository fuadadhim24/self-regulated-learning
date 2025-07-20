import os
from werkzeug.utils import secure_filename
from datetime import datetime
from config import Config

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'xls', 'xlsx'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)


def get_upload_path(user_id: str, board_id: str, card_id: str):
    base = Config.UPLOAD_FOLDER
    ensure_dir(base)
    path = os.path.join(base, user_id, board_id, card_id)
    ensure_dir(path)
    return path


def save_file(file, user_id: str, board_id: str, card_id: str):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        upload_path = get_upload_path(user_id, board_id, card_id)
        file_path = os.path.join(upload_path, filename)
        file.save(file_path)
        return os.path.join(user_id, board_id, card_id, filename)
    return None


def delete_file(file_path: str):
    full_path = os.path.join(Config.UPLOAD_FOLDER, file_path)
    if os.path.exists(full_path):
        os.remove(full_path)
        return True
    return False


def get_file_path(file_path: str):
    return os.path.join(Config.UPLOAD_FOLDER, file_path) 