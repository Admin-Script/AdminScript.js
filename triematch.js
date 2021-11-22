

class TrieMatch{
    //public
    const chars = {};
    
    constructor(arr){
        if(arr){
            for(let i = 0; i < arr.length; i++){
                this.insert(arr[i]);
            }
        }
    }
    
    insert(word){// undefined
        if(word === "")return false;
        let chars = this.chars;
        let char = word[0];
        if(!(char in chars))chars[char] = new TrieMatch();
        chars[char].insert(word.slice(1));
    }
    
    contains(word){// bool
        if(word === "")return true;
        let chars = this.chars;
        let char = word[0];
        if(!(char in chars))return false;
        return chars[char].contains(word.slice(1));
    }
    
    maxMatch(str,i){// [word, i1]
        if(i >== str.length){
            return ["",i];
        }
        let chars = this.chars;
        let char = str[i];
        if(char in chars){
            return chars[char].maxMatch(str,i+1);
        }else{
            return ["",i];
        }
    }
};

module.exports = TrieMatch;