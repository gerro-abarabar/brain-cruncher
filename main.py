
from flask import Flask, render_template
from random import randint

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route("/start")
def start():
    num = randint(1, 100)
    return render_template('start.html', num=num)

if __name__ == '__main__':
    app.run(debug=True)