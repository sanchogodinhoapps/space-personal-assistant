from flask import Flask, send_from_directory, request
import g4f

app = Flask(__name__, static_url_path='', static_folder='./public')

@app.route('/')
def homePage():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/settings')
def settingsPage():
    return send_from_directory(app.static_folder, 'settings.html')

@app.route('/generate')
def generate():
    if (request.args.get('query') != None):
        response = g4f.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role":"user", "content": request.args.get('query')}],
            stream=False,
        )
        return response
    else:
        return {'success': False, 'error': 'Please Enter A Proper Query Value!'}