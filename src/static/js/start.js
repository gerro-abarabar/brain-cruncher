function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



function status(msg) {
    question.innerHTML = msg;
}

function multiply(a) {
    if (Math.abs(a) > 20){
        return do_operation(a);
    }
    var b = generateRandomNumber(2, 10);
    status("Multiply it by " + b);
    return a * b;
}

function add(a) {
    var b = generateRandomNumber(2, 100);
    status("Add " + b);
    return a + b;
}

function subtract(a) {
    var b = generateRandomNumber(2, 100);
    status("Subtract " + b);
    return a - b;
}

function divide(a) { 
    let b;
    var counter=0;
    do {
        b = generateRandomNumber(2, 50);
        counter++;
        if (counter>=30){ // It will loop for 30 iterations before failsafe.
            return do_operation(a);
        }
    } while (a % b !== 0);
    status("Divide it by " + b);
    return a / b;
}

function square(a){
    if(Math.abs(a) > 30){
        return do_operation(a);
    }
    status("Square it");
    return a*a;
}

function cube(a){
    if(Math.abs(a) > 10){
        return do_operation(a);
    }
    status("Cube it");
    return a*a*a;
}

function squareroot(a){
    if (Math.sqrt(a) % 1 === 0){
        return Math.sqrt(a);
    }
    return do_operation(a);
}

function do_operation(num){
    var operations = [multiply, add, subtract, divide, square, cube];
    var operation = operations[generateRandomNumber(0, operations.length - 1)];
    return operation(num);
}

var question = document.getElementById("question");
var is_questioning=false

function get_answer(){
    return document.getElementById("answer").value;
}
var question = document.getElementById("question");
var button=document.getElementById("start-btn")
var newNum, speed;
var num= generateRandomNumber(1,100);
async function button_func(){
    if (!is_questioning){
        speed = 10/document.getElementById("speed").value;
        is_questioning=true;
        button.disabled = true;
        

        question.innerText = "Get ready to answer the question. Number: " + num;

        await new Promise(resolve => setTimeout(resolve, 2000));

        newNum=await startQuestions(num);

        question.innerText = "What's your answer?";
        button.disabled = false;
        button.innerText="Submit Answer";
    } else{
        var user_answer=get_answer();
        if (parseInt(user_answer) === newNum){
            question.innerText = "Correct! The answer is " + newNum + ". Click Start to try again.";
        } else{
            question.innerText = "Wrong! The answer is " + newNum + ". Click Start to try again.";
        }
        is_questioning=false;
        num=generateRandomNumber(1,100);
        button.innerText="Start";
    }
}

async function startQuestions(num) {
    var new_num=num;
    num_of_options = generateRandomNumber(2, 10);
    for (var i = 0; i < num_of_options; i++) {
        new_num = do_operation(new_num);
        console.log("Intermediate num:"+new_num);
        await new Promise(resolve => setTimeout(resolve, speed*1000));
    }
    return new_num;
}