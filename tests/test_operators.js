let operators = require("../operators.js");


// util functions

let err = function(str){
    if(str){
        throw new Error(str);
    }else{
        throw new Error("Unexpected token");
    }
};


let consumeSpaces = function(str,i){
    let token = "";
    for(; i < str.length; i++){
        if(!str[i].match(/\s/)){
            if(str[i] === "#"){//comments
                i = consumeRegex(str,i,/[^\n]/)[1];
            }else{
                break;
            }
        }else{
            token += str[i];
        }
    }
    return [token,i];
};

let consumeRegex = function(str,i,match,escape){
    let token = "";
    for(; i < str.length; i++){
        if(escape && str[i].match(escape) && i+1 < str.length){
            i++;
            token += str[i];
        }else if(str[i].match(match)){
            token += str[i];
        }else{
            break;
        }
    }
    return [token,i];
};


let processCandidates = function(candidates,str,i){
    let lastError;
    for(let j = 0; j < candidates.length; j++){
        let cand = candidates[j];
        try{
            return cand(str,i);
        }catch(err){
            lastError = err;
        }
    }
    throw lastError;
};



//parser main


let parseIdentifier = function(str,i){
    if(!str[i].match(/[a-zA-Z]/)){
        err();
    }
    let token = "";
    for(; i < str.length; i++){
        if(str[i].match(/[a-zA-Z0-9]/)){
            token += str[i];
        }else{
            break;
        }
    }
    return [token,i];
};

let atomicExpr = parseIdentifier;


//operator logic

let matchOperator = function(str,i){
    console.log("operator at position: ",i);
    let optoken,s,newLine;
    [s,i] = consumeSpaces(str,i);
    console.log(s,i);
    newLine ||= !!s.match(/\n/);
    
    [optoken,i] = operators.maxMatch(str,i);
    console.log(optoken,i);
    
    [s,i] = consumeSpaces(str,i);
    newLine ||= !!s.match(/\n/);
    console.log(s,i);
    
    if(optoken === ""){
        if(newLine){
            optoken = "\n";
        }else{
            err("expected operator but not found");
        }
    }
    if(i === str.length && optoken === "\n")err();//trailing new lines
    
    return [optoken,i];
};

let comptoken = function(op1,op2){//true if right token wins out (has lower precedence value or is left associative)
    let p1 = operators.precedenceTable[op1].precedence;
    let p2 = operators.precedenceTable[op2].precedence;
    if(p1 === p2){
        return operators.precedenceTable[op2].associativity;
    }
    return p1 > p2;
};

let operatorExpr = function(str,i){
    let lefthand,s;
    [s,i] = consumeSpaces(str,i);
    [lefthand,i] = atomicExpr(str,i);//atomic returns an type:"atom"
    while(true){
        let ast,optoken;
        let i0 = i;
        try{
            [optoken,i] = matchOperator(str,i);//matches the spaces as well
        }catch(err){//end of the sequence
            return [lefthand,i0];
        }
        try{
            [atom,i] = atomicExpr(str,i);
        }catch(error){//definitely got something odd here
            console.log(`"${optoken}"`,str.length,i);
            err("Expected atomic expression, but got something else instead. Are you chaining operaotrs?");
        }
        
        let assignContainer = {
            right:lefthand
        };
        let wrapper = assignContainer;
        let expression = lefthand;
        while(expression.type === "operator" && comptoken(expression.value,optoken)){
            wrapper = expression;
            expression = expression.right;
        }
        wrapper.right = {
            type:"operator",
            value:optoken,
            left:expression,
            right:atom
        };
        lefthand = assignContainer.right;
        /*// buggy code, no deep replacement
        if(lefthand.type === "operator" && comptoken(lefthand.value,optoken)){
            //decompose the left token
            let ast1 = {
                type:"operator",
                value:optoken,
                left:lefthand.right,
                right:atom
            }
            lefthand = {
                type:"operator",
                value:lefthand.value,
                left:lefthand.left,
                right:ast1
            }
        }else{
            //preserve the left token
            lefthand = {
                type:"operator",
                value:optoken,
                left:lefthand,
                right:atom
            }
        }*/
    }
};

console.log(operators.precedenceTable);

console.log(JSON.stringify(operatorExpr(`
    # test code
    # comments will be ignored
    line1 = asdf * sa + a / b
    # equal signs are left associative, 
    # others are right associative
    line2 = a = b:c| ||d!e 
    line3 && true
    # for more info, look at operators.js
`,0)));

// result
/*
{
    "type": "operator",
    "value": "\n",
    "left": {
        "type": "operator",
        "value": "=",
        "left": "line1",
        "right": {
            "type": "operator",
            "value": "+",
            "left": {
                "type": "operator",
                "value": "*",
                "left": "asdf",
                "right": "sa"
            },
            "right": {
                "type": "operator",
                "value": "/",
                "left": "a",
                "right": "b"
            }
        }
    },
    "right": {
        "type": "operator",
        "value": "\n",
        "left": {
            "type": "operator",
            "value": "=",
            "left": "line2",
            "right": {
                "type": "operator",
                "value": "=",
                "left": "a",
                "right": {
                    "type": "operator",
                    "value": "!",
                    "left": {
                        "type": "operator",
                        "value": "|",
                        "left": {
                            "type": "operator",
                            "value": ":",
                            "left": "b",
                            "right": "c"
                        },
                        "right": "d"
                    },
                    "right": "e"
                }
            }
        },
        "right": {
            "type": "operator",
            "value": "&&",
            "left": "line3",
            "right": "true"
        }
    }
}
*/












/*
?select user [JoinedAt > -3 hours] | ban
?select message : time > -3 hours : user == "sussyBaka" | delete
>> 135 messages will be deleted. if you are sure, type ?commit

?select message [time > -3 hours] [user == "sussyBaka"] | delete

?select message time > -3 hours  user == "sussyBaka" | delete

?msgs => select message : time > -3 hours : user == "sussyBaka"
?msgs | length | echo
>> 135
?msgs | echo
>> ...displays all 135 messages
?msgs | delete
>> 135 messages will be deleted. if you are sure, type ?commit
?commit
>>message deleted
?clear log
*/

