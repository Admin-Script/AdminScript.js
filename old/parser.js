//select member : member.id == * : jine | member => ban

let err = function(str){
    if(str){
        throw new Error(str);
    }else{
        throw new Error("Unexpected token");
    }
};

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


let parseClassicalFunctionCall = function(str,i){
    try{
        
        var [funcname,i] = parseIdentifier(str,i);
        i = consumeSpaces(str,i);
        if(str[i] !== "(")err();
        i = consumeSpaces(str,i);
        
        let args = [];
        if(funcname === "time" && str[i] !== "\""){//special case, treat the content as string
            var [time, i] = consumeRegex(str,i,/[^\)]/,"\\");
            args.push(time);
        }else{
            while(){
                
            }
        }
        
        
    }catch(err){
        throw err;
    }
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

let firstClassExpr = function(str,i){
    try{
        let ast;
        [i,ast] = processCandidates([
            operatorExpr,
            funcExpr,
            funcParenExpr,
            execExpr // $()
        ],str,i);
        return {
            type:"expr",
            ast
        }
    }catch(err){
        throw err;
    }
};
//let первоклассное выражение

parseFunction("asdfadf() fa dk",0);




//old code
/*
let parseFunctionCall = function(str,i){
    try{
        
        var [funcname,i] = parseIdentifier(str,i);
        console.log(funcname,i);
        console.log(str[i],i);
        i = consumeSpaces(str,i);
        console.log(str[i],i);
        if(str[i] !== "(")err();
        
        
        
    }catch(err){
        throw err;
    }
};


let parseFunction = function(str,i){
    let funcname;
    //first match the identifier
    let r = parseIdentifier(str,i);
    if(!r){
        return false;
    }
    [funcname,i] = r;
    console.log(funcname,i);
};
*/
/*

let parseString = function(){
    
}

//just recursive descent parser
let parseLine = function(str,i){
    [parse]
}

let consumeId = function(str,i){
    let token = "";
    if(str[i].match(/[a-zA-Z]/)){
        
    }
    for(; i < str.length; i++){
        if(str[i].match(/[a-zA-Z]/)){
            
        }
    }
}

const Parse = function(str){
    let lines = str.split(/\n\;/).map();
};

*/