from flask import Blueprint
from controllers import attachment_controller

attachments_bp = Blueprint('attachments', __name__)

attachments_bp.route('/api/attachments/card/<card_id>', methods=['GET'])(attachment_controller.get_card_attachments)
attachments_bp.route('/api/attachments/upload', methods=['POST'])(attachment_controller.upload_attachment)
attachments_bp.route('/api/attachments/download/<attachment_id>', methods=['GET'])(attachment_controller.download_attachment)
attachments_bp.route('/api/attachments/<attachment_id>', methods=['DELETE'])(attachment_controller.delete_attachment) 