"""Files routes: list and delete uploaded file records."""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from firebase_client import get_db

files_bp = Blueprint('files', __name__)

@files_bp.route('', methods=['GET'])
@jwt_required()
def get_files():
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Simple query to avoid index requirement for where + order_by
        files_docs = db.collection('uploaded_files').where('user_id', '==', user_id).stream()
        files = [{**d.to_dict(), 'id': d.id} for d in files_docs]
        
        # Sort client-side to avoid Firestore index requirement
        files.sort(key=lambda x: x.get('upload_date', ''), reverse=True)
        
        return jsonify({'files': files}), 200
    except Exception as e:
        print(f"Error fetching files: {e}")
        return jsonify({'error': str(e), 'files': []}), 500

@files_bp.route('/<file_id>', methods=['DELETE'])
@jwt_required()
def delete_file(file_id):
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        file_doc = db.collection('uploaded_files').document(file_id).get()
        if not file_doc.exists:
            return jsonify({'error': 'File record not found.'}), 404
            
        if file_doc.to_dict().get('user_id') != user_id:
            return jsonify({'error': 'Unauthorized.'}), 403
            
        # Delete the file record
        db.collection('uploaded_files').document(file_id).delete()
        
        # Delete all leads associated with this file
        leads_to_delete = db.collection('leads').where('file_id', '==', file_id).stream()
        batch = db.batch()
        count = 0
        for doc in leads_to_delete:
            batch.delete(doc.reference)
            count += 1
            if count >= 400:
                batch.commit()
                batch = db.batch()
                count = 0
        if count > 0:
            batch.commit()
            
        return jsonify({'success': True, 'message': f'File and associated leads deleted.'}), 200
    except Exception as e:
        print(f"Error deleting file: {e}")
        return jsonify({'error': str(e)}), 500
