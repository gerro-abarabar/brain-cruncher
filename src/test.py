import utils.operation_loader as ol
from time import sleep
loader=ol.OperationLoader(["+5","-3","*2"], 10, 5)
loader.start()
while True:
    print(loader.get_current_number())
    sleep(4)