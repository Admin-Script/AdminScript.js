let TrieMatch = require("./triematch.js");

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

!

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

let operators = new TrieMatch(Object.keys(precedenceTable).filter(o=>o!=="\n"));// \n is kinda treated specially

module.exports = {
    maxMatch:operators.maxMatch.bind(operators),
    precedenceTable
};