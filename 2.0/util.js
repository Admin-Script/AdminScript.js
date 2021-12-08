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

let getChar = function(str,i){
    if(i < 0 || str.length <= i){
        return "";
    }
    return str[i];
};



//ast node types
//might make a separate file

//OBJLIT
//ARRLIT
//STRLIT
//ID
//NUM
//PAREN
//FUNCDEF
//FUNCCALL
//MEMBERACCESS
//UNARY
//BINARY
const TYPES = {
    OBJLIT:{},
    ARRLIT:{},
    STRLIT:{},
    ID:{},
    INT:{},
    FLOAT:{},
    PAREN:{},
    FUNCDEF:{
        ARGS:2,
        BODY:3
    },
    FUNCCALL:{
        ARGS:2
    },
    UNARY:{
        //value:2,
        TOKEN:3
    },
    BINARY:{
        TOKEN:2,
        LEFT:3,
        RIGHT:4
    }
};
Object.values(TYPES).map((o,i)=>{
    o.ID = i;//id
    o.TYPE = 0;//posiiton type identifier in the array (redundant)
    o.I = 1;
    o.VALUE = 2;
});






module.exports = function(obj){
    obj.err = err;
    obj.consumeSpaces = consumeSpaces;
    obj.consumeRegex = consumeRegex;
    obj.processCandidates = processCandidates;
    obj.matchIdentifier = matchIdentifier;
    obj.getChar = getChar;
    obj.TYPES = TYPES;
};