
from flask import Flask, render_template, request
from random import randint
from dotenv import load_dotenv
import os
import utils.operation_loader as ol

load_dotenv()

admin=os.getenv('ADMIN_ID')
admin_name=os.getenv('ADMIN_NAME')
app = Flask(__name__)
players={}
operations=ol.OperationLoader([],0,0) # Default Data

@app.route('/')
def home():
    return render_template('home.html')

@app.route("/start")
def start():
    num = randint(1, 100)
    return render_template('singleplayer.html', num=num)

@app.route("/multiplayer/play")
def multiplayer():
    return render_template('multiplayer.html')

@app.route("/admin/<admin_id>")
def admin_panel(admin_id):
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

@app.route("/multiplayer/status", methods=['GET'])
def get_status():
    if operations.is_done(): # if the game hasn't started yet
        return {'started': False, "players":players}
    else:
        return {
            'started': True,
            "players":players,
            "operations":operations.get_operations(),
            "current_operation":operations.get_current_operation(),
            "duration":operations.get_duration(),
            "initial_number":operations.get_initial_number(),
            "iteration":operations.get_iteration()
            }

def done_game(): # Function to run when the game is done
    print("Game has ended. Resetting operations.")
    return {'status': 'success', 'message': 'Game ended.'}

"""
Testing Command
curl -X POST localhost:5000/multiplayer/start \
           -H "Content-Type: application/json" \
           -d '{"operations": "*8,+5,-3", "current_number": 5,"duration": 5,"admin_id":"gerropogitalagasabuongmundo"}'

           """
@app.route("/multiplayer/start", methods=['POST'])
def start_multiplayer():
    data = request.get_json()
    admin_id = data.get('admin_id')
    if admin_id != admin:
        print("Unauthorized access attempt with admin_id:", admin_id, "compared to:",admin)
        return {'status': 'error', 'message': 'Unauthorized'}, 401
    else:
        global operations

        input_data = data.get('operations', '').strip('[').strip("]")  # Remove leading and trailing quotes
        operations = input_data.split(',')
        current_number = data.get('current_number', 0)
        duration = data.get('duration', 0)

        operations=ol.OperationLoader(operations,int(current_number),int(duration),done_game) # Load new operations for the game
        operations.start()
        return {'status': 'success', 'message': 'Multiplayer game started.'}

@app.route("/multiplayer/get_operation", methods=['GET'])
def get_operation():
    if operations.is_done():
        return {'status': 'error', 'message': 'Game is not active.'}, 400
    return {'operation': operations.get_current_operation(), 'current_number': operations.get_current_number(), 'duration': operations.get_duration()}

"""
Testing Command:
curl -X POST localhost:5000/multiplayer/answer \
           -H "Content-Type: application/json" \
           -d '{"answer": "42", "player_name":"beronicous"}'
"""
@app.route("/multiplayer/answer", methods=['POST'])
def check_answer():
    data = request.get_json()
    answer = int(data.get('answer'))
    player_name = data.get('player_name')
    
    if not answer or not player_name:
        return {'status': 'error', 'message': 'Missing answer or player name.'}, 400
    
    if player_name not in players:
        return {'status': 'error', 'message': 'Player not found.'}, 404
    
    if not operations.is_done():
        return {'status': 'error', 'message': 'Game is not active.'}, 400
    
    print("Checking answer...", "Player:", player_name, "Answer:", answer, "Current Number:", operations.get_current_number())
    if operations.check_answer(answer):
        print(f"{player_name} answered correctly!")
        players[player_name] += 1  # Increment player score
        return {'status': 'success', 'message': f'Congrats! {player_name} answered correctly!'}
    else:
        print(f"{player_name} answered incorrectly.")
        return {'status': 'success', 'message': f'Sorry, {player_name} answered incorrectly. The correct answer was {operations.get_current_number()}.'}

"""
Testing Command:
curl -X POST localhost:5000/multiplayer/add_player \
           -H "Content-Type: application/json" \
           -d '{"player_name":"beronicous"}'
"""

@app.route("/multiplayer/add_player", methods=['POST'])
def add_player():
    global players
    data = request.get_json()
    player_name = data.get('player_name')
    print(player_name, "has been added")
    if player_name and player_name not in players:
        players[player_name] = 0  # Initialize player score
        return {'status': 'success', 'message': f'Player {player_name} added.'}
    return {'status': 'error', 'message': 'Invalid player name or player already exists.'}, 400

if __name__ == '__main__':
    app.run(debug=True)