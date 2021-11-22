
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