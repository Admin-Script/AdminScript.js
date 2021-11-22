
// util functions

let err = function(str){
    if(str){
        throw new Error(str);
    }else{
        throw new Error("Unexpected token");
    }
};


let consumeSpaces = function(str,i){
    for(; i < str.length; i++){
        if(!str[i].match(/\s/)){
            if(str[i] === "#"){//comments
                i = consumeRegex(str,i,/[^\n]/)[1];
            }else{
                break;
            }
        }
    }
    return i;
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

let matchStrings = function(str,i,arr){
    for(let j = 0; j < arr.length; j++){
        let match = arr[i];
        if(str.slice(i,i+match.length) === match){
            return [match,i+match.length];
        }
    }
    err("Unexpected token in string match");
};




// expressions
/*
(time 5:123:12)
time(5:123:12)
time "4 days ago"
$() ... identity function, returns whatever it gets in
*/

let atomicExpr = function(str,i){//tokens, parenfunc etc
    let ast;
    [ast,i] = processCandidates([
        funcExpr,
        funcParenExpr,
        parenExpr,
        unaryExpr
    ],str,i);
    return [{
        type:"expr",
        ast
    },i];
};


//preparing the precedence table
let precedenceTable = `
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

:
|
->

=          LEFT

NEWLINE    LEFT
;          LEFT
`.trim().split(/\s*\n\s*\n\s*/).map((group,i)=>{
    return group.trim().split("\n").map((line)=>{
        let l = line.split(/\s+/);
        let token = l[0] === "NEWLINE" ? "\n" : l[0];
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
console.log(precedenceTable);


let matchOperator = function(str,i){
    let s,newLine;
    [s,i] = matchSpaces(str,i);
    newLine ||= !!s.match(/\n/);
    
    //match the main thing
    matchStrings(str,i,);
    
    [s,i] = matchSpaces(str,i);
    newLine ||= !!s.match(/\n/);
    
    
    let newline = false;
    for(; i < str.length; i++){
        if(!str[i].match(/\s/)){
            if(str[i] === "#"){//comments
                i = consumeRegex(str,i,/[^\n]/)[1];
            }else{
                break;
            }
        }
    }
    return i;
}

let operatorExpr = function(str,i){
    let leftHand;
    [leftHand,i] = atomicExpr(str,i);
    
    while(i < str.length){
        let ast;
        [ast,i] = atomicExpr(str,i);
        
    }
};




let unaryExpr = function(str,i){
    /*
    !
    +
    -
    */
    let opcode;
    [opcode,i] = matchStrings(str,i,"++ -- + - ! ~".split(" "));
    
    i = consumeSpaces(str,i);
    if(!str[i].match(/[\!\+\-]/)){
        err("unexpected token in unary expression");
    }
    let opcode = str[i];
    i++;
    let ast;
    [ast,i] = processCandidates([
        funcExpr,
        execExpr, // $()
        atomicExpr//tokens, parenfunc etc
    ],str,i);
    return [{
        type:"unary",
        opcode,
        ast
    },i];
};

let operatorExpr = function(str,i){
    //operator precedence (higher to lower)
    /*
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
    
    :
    |
    ->
    
    = 
    
    \n
    ;
    */
};

let firstClassExpr = function(str,i){
    let ast;
    [ast,i] = processCandidates([
        operatorExpr,
        funcExpr,
        execExpr, // $()
        atomicExpr//tokens, parenfunc etc
    ],str,i);
    return [{
        type:"expr",
        ast
    },i];
};