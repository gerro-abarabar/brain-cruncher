# This runs in the background to load operations that was given, and loops through it

import threading, os
from time import sleep
from random import randint
from dotenv import load_dotenv
from flask import request
load_dotenv()
admin=os.environ.get('ADMIN_ID')

operations=[]

class OperationLoader:
    def __init__(self,operations:list,current_number:int, duration:int,done_function=None):
        self._operations:list = operations
        self._current_operation:str = ""
        self.current_number:int = current_number
        self._initial_numer=current_number
        self._duration:int = duration
        self._done_function = done_function
        self._is_done = True
        self._iteration=0
        


    def _start_timer(self):
        while True:
            sleep(self._duration)
            if self._operations:
                operation = self._operations.pop(0)
                self._set_current_operation(operation)
                self._iteration+=1
            else:
                self._current_operation = ""
                self._done_function() # pyright: ignore[reportOptionalCall]
                self._is_done = True
                self._iteration=0
                break
            
            print(f"Current Number: {self.current_number}, Current Operation: {self._current_operation}, Remaining Operations: {self._operations}")
    
    def get_iteration(self):
        return self._iteration
    
    def is_done(self) -> bool:
        return self._is_done
    
    def get_duration(self):
        return self._duration

    def check_answer(self, answer):
        return self.current_number == answer
    def start(self):
        self._is_done = False
        self._thread = threading.Thread(target=self._start_timer)
        self._thread.daemon = True  # so that the thread will exit when the main thread exits
        self._thread.start()
    
    def _set_current_operation(self, operation):
        self._current_operation = operation
        operation, operand = operation[0], operation[1:]
        match operation:
            case "+":
                self.current_number += int(operand)
            case "-":
                self.current_number -= int(operand)
            case "*":
                self.current_number *= int(operand)
            case "/":
                self.current_number /= float(operand) # pyright: ignore[reportAttributeAccessIssue]
            case "^":
                self.current_number **= float(operand)
    
    def get_current_number(self):
        return self.current_number
        

    def get_operations(self):
        return self._operations

    def get_current_operation(self):
        return self._current_operation
    def get_initial_number(self):
        return self._initial_numer