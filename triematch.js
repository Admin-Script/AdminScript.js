class TrieMatch{
    //puclic
    chars = {};
    value;
    constructor(arr){
        if(arr){
            for(let i = 0; i < arr.length; i++){
                this.insert(arr[i],arr[i]);
            }
        }
    }
    
    insert(word,content){
        if(word === ""){
            this.value = content;
            return false;
        }
        let chars = this.chars;
        let char = word[0];
        if(!(char in chars))chars[char] = new TrieMatch();
        chars[char].insert(word.slice(1),content);
    }
    
    contains(word){// bool
        if(word === "" && this.value)return true;
        let chars = this.chars;
        let char = word[0];
        if(!(char in chars))return false;
        return chars[char].contains(word.slice(1));
    }
    
    maxMatch(str,i){// [word, i1]
        if(i === str.length){
            return [this.value || "",i];
        }else if(i >= str.length){
            throw new Error("string out of range, in a trie operation");
        }
        let chars = this.chars;
        let char = str[i];
        if(char in chars){
            let result = chars[char].maxMatch(str,i+1);
            if(result[0] === ""){
                return ["",i];
            }else{
                return result;
            }
        }else{
            return [this.value || "",i];
        }
    }
};

module.exports = TrieMatch;