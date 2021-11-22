let operators = require("./operators.js");

let s = "asd ==a\naa";

console.log(operators.maxMatch(s,4));
console.log(operators.precedenceTable[operators.maxMatch(s,4)[0]]);
