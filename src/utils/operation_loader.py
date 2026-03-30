# This runs in the background to load operations that was given, and loops through it

from time import sleep
from random import randint
from dotenv import load_dotenv
from flask import request

admin=load_dotenv().get('ADMIN_ID')

operations=[]

class OperationLoader:
    def __init__(self,operations,current_number):
        self._operations = operations
        self._current_operation = None
        self.current_number = current_number


    def start_timer(self, duration):
        sleep(duration)
    
    def _set_current_operation(self, operation):
        self._current_operation = operation
        match operation[0]:
            case "+":
                self.current_number += int(operation[1:])
            case "-":
                self.current_number -= int(operation[1:])
            case "*":
                self.current_number *= int(operation[1:])
            case "/":
                self.current_number /= int(operation[1:])
            case "^":
                self.current_number **= int(operation[1:])
    
    def get_current_number(self):
        return self.current_number
        

    def get_operations(self):
        return self._operations

    def get_current_operation(self):
        return self._current_operation