import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from firebase_client import init_firebase

# Import blueprints
from routes.auth import auth_bp
from routes.leads import leads_bp
from routes.analytics import analytics_bp
from routes.messages import messages_bp
from routes.files import files_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    # Use explicit CORS configuration to prevent "No Access-Control-Allow-Origin header" errors
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    JWTManager(app)
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    # Initialize Firebase
    try:
        init_firebase()
        logger.info("Firebase Initialized Successfully")
    except Exception as e:
        logger.error(f"Firebase Initialization Failed: {e}")

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(leads_bp, url_prefix='/api/leads')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')
    app.register_blueprint(files_bp, url_prefix='/api/files')

    @app.route('/health')
    def health():
        return jsonify({'status': 'healthy', 'version': '1.0.0'}), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def server_error(e):
        # Ensure CORS headers are added to error responses
        response = jsonify({'error': 'Internal server error'})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

    return app

if __name__ == '__main__':
    app = create_app()
    # Explicitly run on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
