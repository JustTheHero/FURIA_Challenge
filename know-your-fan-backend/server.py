from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from main import KnowYourFanApp

app = Flask(__name__)
CORS(app)  

kyf_app = KnowYourFanApp()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "online", "message": "API funcionando corretamente"})

@app.route('/basic-info', methods=['POST'])
def basic_info():
    data = request.json
    success = kyf_app.collect_basic_info(data)
    return jsonify({"success": success})

@app.route('/preferences', methods=['POST'])
def preferences():
    data = request.json
    success = kyf_app.collect_esports_preferences(data)
    return jsonify({"success": success})

@app.route('/verify-document', methods=['POST'])
def verify_document():
    # Na implementação real, processaria um upload de arquivo
    # Simulando com um caminho fixo (você pode melhorar isso)
    document_path = "sample_document.jpg"
    result = kyf_app.verify_document(document_path)
    return jsonify(result)

@app.route('/connect-social', methods=['POST'])
def connect_social():
    data = request.json
    platform = data.get('platform')
    token = data.get('token')
    result = kyf_app.connect_social_profile(platform, token)
    return jsonify(result)

@app.route('/validate-profile', methods=['POST'])
def validate_profile():
    data = request.json
    profile_url = data.get('profile_url')
    result = kyf_app.validate_esports_profile(profile_url)
    return jsonify(result)

@app.route('/generate-profile', methods=['GET'])
def generate_profile():
    profile = kyf_app.generate_fan_profile()
    return jsonify(profile)

@app.route('/export-data', methods=['GET'])
def export_data():
    format_type = request.args.get('format', 'json')
    data = kyf_app.export_data(format=format_type)
    return jsonify({"data": data})

if __name__ == '__main__':
    app.run(debug=True, port=5000)


