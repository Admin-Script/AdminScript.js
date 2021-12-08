// imported functions
let operatorExpr;
//util functions
let err;
let consumeSpaces;
let consumeRegex;
let processCandidates;
let matchIdentifier;
let getChar;
let TYPES;

//A rule of thumb for expressions
//They assume the first letter is not space
//expressions don't consume trailing spaces, this is to preserve the spacial operators



let objectLiteralExpr = function(str,i){
    if(str[i] !== "{"){
        err();
    }
    i++;
    let s;
    const result = {};
    [s,i] = consumeSpaces(str,i);
    if(str[i] === "}"){//no content initialization
        i++;
        return [[TYPES.OBJLIT.ID,i,result],i];
    }
    while(i >= str.length){
        let index = processCandidates([
            identifierExpr,
            stringLiteralExpr
        ],str,i);
        [s,i] = consumeSpaces(str,i);
        if(str[i] === ":"){
            [value,i] = operatorExpr(str,i);
            result[index[1]] = value;
            [s,i] = consumeSpaces(str,i);
        }else{
            result[index[1]] = null;//destructuring assignment
        }
        if(str[i] === ","){
            i++;
            [s,i] = consumeSpaces(str,i);
            continue;
        }else{
            break;
        }
    }
    if(str[i] !== "}"){
        err("Unexpected end of object literal. You need a matching \"}\" after \"{\"");
    }
    i++;
    return [[TYPES.OBJLIT.ID,i,result],i];
};

let arrayLiteralExpr = function(str,i){
    if(str[i] !== "["){
        err();
    }
    i++;
    let s;
    const result = [];
    [s,i] = consumeSpaces(str,i);
    if(str[i] === "]"){//no content initialization
        i++;
        return [[TYPES.ARRLIT.ID,i,result],i];
    }
    while(i < str.length){
        let value;
        [value,i] = operatorExpr(str,i);
        result.push(value);
        if(str[i] === ","){
            i++;
            [s,i] = consumeSpaces(str,i);
            continue;
        }else{
            break;
        }
    }
    if(str[i] !== "]"){
        err("Unexpected end of arrray literal. You need a matching \"]\" after \"[\"");
    }
    i++;
    return [[TYPES.ARRLIT.ID,i,result],i];
};

let stringLiteralExpr = function(str,i){
    if(str[i] !== "\""){
        err();
    }
    i++;
    let result = "";
    while(i < str.length){
        if(str[i] === "\""){
            i++;
            return [TYPES.STRLIT.ID,i,result];
            break;
        }else if(str[i] === "\\"){
            i++;
            result += str[i];
            i++;
        }else{
            result += str[i];
            i++;
        }
        result += str[i];
    }
    err("Expected \" after the end of a string");
};

let identifierExpr = function(str,i){
    let idname,s;
    [s,i] = consumeSpaces(str,i);
    [idname,i] = matchIdentifier(str,i);
    if(idname === ""){
        err();
    }
    return [[TYPES.ID.ID,i,idname],i];
};

let numberExpr = function(str,i){
    //conforms to the JSON standard number notation
    //sign
    let sign = "+";
    if(str[i] === "+"){//kinda redundant with the prefix, but that's good
        i++;
    }else if(str[i] === "-"){
        sign = "-";
        i++;
    }
    //digit
    let digitStr = "";
    if(str[i] === "0"){
        digitStr += str[i];
        i++;
    }else if(str[i].match(/[1-9]/)){
        digitStr += str[i];
        i++;
        while(i < str.length){
            if(str[i].match(/[0-9]/)){
                i++;
                digitStr += str[i];
            }else{
                break;
            }
        }
    }else{
        err();
    }
    //fraction
    let fracStr = "";
    if(str[i] === "."){
        i++;
        if(!str[i].match(/[0-9]/)){
            err();
        }
        while(i < str.length){
            if(str[i].match(/[0-9]/)){
                i++;
                fracStr += str[i];
            }else{
                break;
            }
        }
    }
    //exponent
    let expSign = "+";
    let expStr = "";
    if(str[i] === "e" || str[i] === "E"){
        i++;
        if(str[i] === "+"){
            i++;
        }else if(str[i] === "-"){
            i++;
            expSign = "-";
        }
        if(!str[i].match(/[0-9]/)){
            err();
        }
        while(i < str.length){
            if(str[i].match(/[0-9]/)){
                i++;
                expStr += str[i];
            }else{
                break;
            }
        }
    }
    
    //float (double)
    const numstr = sign+digitStr+(fracStr===""?"":"."+fracStr)+(expStr===""?"":"E"+expSign+expStr);
    if(fracStr !== "" || expStr !== ""){
        return [[TYPES.FLOAT.ID,i,parseFloat(numstr)],i];
    }else{
        return [[TYPES.INT.ID,i,parseInt(numstr)],i];
    }
};

let funcdefExpr = function(str,i){
    let s;
    let args = [];//pairs of names and default values
    //parsing the argument list
    if(str[i] === "("){
        i++;
        [s,i] = consumeSpaces(str,i);
        if(str[i] === ")"){//short declaration
            //do nothing
        }else{
            while(i < str.length){
                let id;
                let restFlag = false;
                if(str.slice(i,i+3) === "..."){
                    restFlag = true;
                    i+=3;
                }
                [id,i] = processCandidates([
                    identifierExpr,
                    objectLiteralExpr,
                    arrayLiteralExpr
                ],str,i);
                [s,i] = consumeSpaces(str,i);
                let arg = id;
                if(str[i] === "="){//process default
                    i++;
                    let default;
                    [s,i] = consumeSpaces(str,i);
                    [default,i] = operatorExpr(str,i);
                    [s,i] = consumeSpaces(str,i);
                    arg = [TYPES.BINARY.ID,i,"=",arg,default];
                }
                if(restFlag){
                    arg = [TYPES.UNARY.ID,i,arg,"..."];
                }
                
                if(str[i] === ","){
                    i++;
                    [s,i] = consumeSpaces(str,i);
                }else{
                    break;
                }
            }
        }
        if(str[i] !== ")"){
            err("Expected closing parenthesis after a function argument");
        }
        i++;
        [s,i] = consumeSpaces(str,i);
    }else{
        [arg,i] = processCandidates([
             identifierExpr,
             objectLiteralExpr,
             arrayLiteralExpr
        ],str,i);
        [s,i] = consumeSpaces(str,i);
        args.push(arg);
    }
    if(str.slice(i,i+2) !== "=>"){
        err();//not an arrow function
    }
    i+=2;
    [s,i] = consumeSpaces(str,i);
    let body;
    if(str[i] === "{"){
        [body,i] = operatorExpr(str,i);
        [s,i] = consumeSpaces(str,i);
        if(str[i] !== "}"){
            err("Expected \"}\" after a function definition");
        }
        i++;
    }else{
        //maybe add single line flag in the operatorExpr in the furue
        [body,i] = operatorExpr(str,i);
    }
    return [TYPES.FUNCDEF.ID,i,args,body];
};

let parenthesisExpr = function(str,i){
    if(str[i] !== "("){
        err();
    }
    i++;
    let s;
    [s,i] = consumeSpaces(str,i);
    let contents;
    [contents,i] = operatorExpr(str,i);
    [s,i] = consumeSpaces(str,i);
    if(str[i] !== ")"){
        err("Expected a closing parenthesis");
    }
    i++;
    return [TYPES.PAREN.ID,i,contents];
};

let trueAtomicExpr;
let prefixExpr;
let postfixExpr;
let memberAccessExpr;
let funccallExpr;
let operatorExpr;




trueAtomicExpr = function(str,i){
    return processCandidates([
        objectLiteralExpr,
        arrayLiteralExpr,
        identifierExpr,
        numberExpr,
        funcdefExpr
    ],str,i);
};




module.exports = function(obj){
    obj.onLink.push(()=>{
        {operatorExpr,
        err,
        consumeSpaces,
        consumeRegex,
        processCandidates,
        matchIdentifier,
        getChar,
        TYPES} = obj;//getting those variables that are externally defined
    });
    return atomicExpr;
};

