let TrieMatch = require("./triematch.js");

// imported functions
let atomicExpr;
//util functions
let err;
let consumeSpaces;
let consumeRegex;
let processCandidates;
let matchIdentifier;
let getChar;
let TYPES;


//preparing the precedence table


//.         LEFT

let precedenceTable = `
^

*
/
%
 
-
+

||
&&

>=
<=
!=
==
>
<

SPACE      LEFT

:
|
->

@

=          LEFT

NEWLINE    LEFT
;          LEFT
`.trim().split(/\s*\n\s*\n\s*/).map((group,i)=>{
    return group.trim().split("\n").map((line)=>{
        let l = line.split(/\s+/);
        let token = l[0] === "NEWLINE" ? "\n" : l[0] === "SPACE" ? " " : l[0];
        if(l.length === 1){
            return {
                token,
                precedence:i,
                associativity:false
            }
        }else{
            return {
                token,
                precedence:i,
                associativity:true//left associative
            }
        }
    });
}).reduce((acc,group)=>{
    group.map((line)=>{
        acc[line.token] = line;
    });
    return acc;
},{});

let operators = new TrieMatch(Object.keys(precedenceTable).filter(o=>o!=="\n"&&o!==" "));// \n is kinda treated specially

console.log(precedenceTable);


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
    let p1 = precedenceTable[op1].precedence;
    let p2 = precedenceTable[op2].precedence;
    if(p1 === p2){
        return precedenceTable[op2].associativity;
    }
    return p1 > p2;
};

let operatorExpr = function(str,i){
    let lefthand,s;
    [lefthand,i] = atomicExpr(str,i);//atomic returns an type:"atom"
    while(i < str.length){
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
            if(optoken === " " || optoken === "\n"){
                return [lefthand,i0];
            }
            console.log(`"${optoken}"`,str.length,i);
            err("Expected atomic expression, but got something else instead. Are you chaining operaotrs?");
        }
        
        let assignContainer = [null,null,null,null,lefthand];
        /*{
            right:lefthand
        };*/
        let wrapper = assignContainer;
        let expression = lefthand;
        while(expression[0] === TYPES.BINARY.ID && //if lefthand type is binary
              expression[2] in precedenceTable &&  //if lefthand operator is in table
              comptoken(expression.value,optoken)){//if the cracking is necessary
            wrapper = expression;
            expression = expression[4];//right
        }
        //assigning to right
        wrapper[4] = [TYPES.BINARY.ID,i,optoken,expression,atom];
        lefthand = assignContainer[4]//.right;
    }
};



module.exports = function(obj){
    obj.onLink.push(()=>{
        {atomicExpr,
        err,
        consumeSpaces,
        consumeRegex,
        processCandidates,
        matchIdentifier,
        getChar,
        TYPES} = obj;//getting those variables that are externally defined
    });
    return operatorExpr;
};