
from flask import Flask, render_template, request
from random import randint
from dotenv import load_dotenv
import os

load_dotenv()

admin=os.getenv('ADMIN_ID')
admin_name=os.getenv('ADMIN_NAME')
app = Flask(__name__)
operations=[]
players=[]

@app.route('/')
def home():
    return render_template('home.html')

@app.route("/start")
def start():
    num = randint(1, 100)
    return render_template('singleplayer.html', num=num)

@app.route("/start/multiplayer")
def multiplayer():
    return render_template('multiplayer.html')

@app.route("/admin/<admin_id>")
def admin(admin_id):
    if admin_id != admin:
        return {'status': 'error', 'message': 'Unauthorized'}, 401
    return render_template('admin.html')

@app.route("/get_admin_name", methods=['GET'])
def get_admin_name():
    return {'admin_name': admin_name}

@app.route("/operations", methods=['GET'])
def add_operations():
    data = request.args.get('data')
    admin_id = request.args.get('admin_id')
    if admin_id != admin:
        return {'status': 'error', 'message': 'Unauthorized'}, 401
    if data:
        operations=data.split(',')
    return {'status': 'success', 'operations': operations}

@app.route("/check_start", methods=['GET'])
def check_start():
    # Placeholder implementation - replace with actual start check logic
    return {'started': False, "players":players}

@app.route("/add_player", methods=['POST'])
def add_player():
    global players
    data = request.get_json()
    player_name = data.get('player_name')
    print(player_name, "has been added")
    if player_name and player_name not in players:
        players.append(player_name)
        return {'status': 'success', 'message': f'Player {player_name} added.'}
    return {'status': 'error', 'message': 'Invalid player name or player already exists.'}, 400


if __name__ == '__main__':
    app.run(debug=True)