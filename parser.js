let TrieMatch = require("./triematch.js");
let operators = require("./operators.js");


// util functions

let err = function(str){
   throw new Error(str ? str : "Unexpected token");
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


let matchIdentifier = function(str,i){
    let token = "";
    for(; i < str.length; i++){
        if(str[i].match(/[\$\_a-zA-Z0-9]/)){
            token += str[i];
        }else{
            break;
        }
    }
    return [token,i];
};



//operator logic

let matchOperator = function(str,i){
    //console.log("operator at position: ",i);
    let optoken,s,newLine;
    [s,i] = consumeSpaces(str,i);
    //console.log(s,i);
    newLine ||= !!s.match(/\n/);
    
    [optoken,i] = operators.maxMatch(str,i);
    //console.log(optoken,i);
    
    [s,i] = consumeSpaces(str,i);
    newLine ||= !!s.match(/\n/);
    //console.log(s,i);
    
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
    //console.log(op1,op2);
    let p1 = operators.precedenceTable[op1].precedence;
    let p2 = operators.precedenceTable[op2].precedence;
    if(p1 === p2){
        return operators.precedenceTable[op2].associativity;
    }
    return p1 > p2;
};

let getChar = function(str,i){
    if(i < 0 || str.length <= i){
        return "";
    }
    return str[i];
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
            //check if func operator is possible
            if(i < str.length && getChar(str,i).match(/\s/)){//function operator (space) confirmed
                optoken = " ";
                [s,i] = consumeSpaces(str,i);
            }else{//end of operators
                return [lefthand,i0];
            }
        }
        try{
            //if(optoken === " ")console.log("optoken",i,str[i]);
            [atom,i] = atomicExpr(str,i);
            //if(optoken === " ")console.log("atom",i,str[i],atom);
        }catch(error){//definitely got something odd here, except if we hit spaces
            if(optoken === " "){
                return [lefthand,i0];
            }
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
    }
};




//Atomic Expression section
//work flow
// prefix -> postfix -> atomic


let prefixTrie = new TrieMatch("! ++ -- + -".split(" "));
let prefixExpr = function(str,i){
    let optoken,s,ast;
    [s,i] = consumeSpaces(str,i);
    [optoken,i] = prefixTrie.maxMatch(str,i);
    if(optoken === ""){
        return postfixExpr(str,i);//throw the sub expression does not contain prefix
    }
    [ast,i] = prefixExpr(str,i);
    return [{
        type:"prefix",
        value:optoken,
        content:ast
    },i];
};

let postfixTrie = new TrieMatch("++ --".split(" "));
let postfixExpr = function(str,i){
    let optoken,s,ast;
    [s,i] = consumeSpaces(str,i);
    [ast,i] = trueAtomicExpr(str,i);
    [optoken,i] = postfixTrie.maxMatch(str,i);
    while(optoken !== ""){
        ast = {
            type:"postfix",
            value:optoken,
            content:ast
        };
        [optoken,i] = postfixTrie.maxMatch(str,i);
    }
    return [ast,i];
};

let parenthesisExpr = function(str,i){
    let s,ast;
    [s,i] = consumeSpaces(str,i);
    if(str[i] !== "("){
        err();//not a parenthesis expr
    }
    i++;//skipping the parenthesis
    [ast,i] = operatorExpr(str,i);
    [s,i] = consumeSpaces(str,i);
    if(str[i] !== ")"){
        err();//not a parenthesis expr
    }
    console.log(ast);
    i++;
    return [{
        type:"parenthesis",
        content:ast
    },i];
};

let funccallExpr = function(str,i){
    let funcname,s,ast;
    [s,i] = consumeSpaces(str,i);
    [funcname,i] = matchIdentifier(str,i);
    if(funcname === ""){
        err();
    }
    [s,i] = consumeSpaces(str,i);
    if(str[i] !== "("){
        err();//not a parenthesis expr
    }
    i++;
    console.log("yes!",i,str[i],str[i+1]);
    let arguments = [];
    while(true){
        try{
            [ast,i] = operatorExpr(str,i);
            console.log(JSON.stringify(ast,null,4));
            [s,i] = consumeSpaces(str,i);
            if(str[i] === ","){
                arguments.push(ast);
                i++;
            }else if(str[i] === ")"){
                arguments.push(ast);
                break;
            }else{
                break;
            }
        }catch(err){
            break;
        }
    }
    [s,i] = consumeSpaces(str,i);
    console.log(arguments);
    console.log("e!",i,str[i]);
    if(str[i] === ")"){
        i++;
        return [{
            type:"functionCall",
            arguments
        },i];
    }
    err("Error while parsing a function statement");
};

let identifierExpr = function(str,i){
    let idname,s;
    [s,i] = consumeSpaces(str,i);
    [idname,i] = matchIdentifier(str,i);
    if(idname === ""){
        err();
    }
    return [{
        type:"identifier",
        value:idname
    },i];
};


let trueAtomicExpr = function(str,i){
    return processCandidates([
        parenthesisExpr,
        funccallExpr,// includes the identity function, $()
        //valueExpr,
        identifierExpr
    ],str,i);
};


let atomicExpr = prefixExpr;

module.exports = operatorExpr;

/*
console.log(JSON.stringify(operatorExpr(`
    # test code
    # comments will be ignored
    line1 = asdf * sa + a / b
    # equal signs are left associative, 
    # others are right associative
    line2 = a = b:c|d e + f g h 
    line3 && true
    # for more info, look at operators.js
`,0)));


console.log(JSON.stringify(operatorExpr(`
    line1 = a $(b:(c*ww)) (++d):e++ # works
    line1 = a $(b:(c*ww)) ++d:e++ # what
`,0)));

console.log(JSON.stringify(operatorExpr(`
    ++i.what
`,0)));
*/


console.log(JSON.stringify(operatorExpr(`
    a+b`,0)));


