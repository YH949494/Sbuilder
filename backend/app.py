from flask import Flask
from flask_cors import CORS
from routes.image import image_bp
from routes.build import build_bp
from routes.preview import preview_bp

app = Flask(__name__)
CORS(app, origins=["https://slotforge.vercel.app", "http://localhost:5173"])

app.register_blueprint(image_bp, url_prefix="/api/image")
app.register_blueprint(build_bp, url_prefix="/api/build")
app.register_blueprint(preview_bp, url_prefix="/api/preview")

@app.route("/health")
def health():
    return {"status": "ok"}, 200

if __name__ == "__main__":
    app.run(debug=True, port=8080)
