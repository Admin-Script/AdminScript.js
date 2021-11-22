let errif1 = function(a){
    if(a === 1){
        throw new Error("one found");
    }
    return a;
};


let test = function(){
    let arr = [1,1,1,1,7,5,1];
    let lastError;
    for(let j = 0; j < arr.length; j++){
        let a = arr[j];
        try{
            return errif1(a);
        }catch(err){
            lastError = err;
        }
    }
    console.log(lastError);
};

console.log(test());

