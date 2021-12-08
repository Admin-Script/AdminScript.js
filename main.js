let parse = require("./parser.js");


/*
console.log(JSON.stringify(operatorExpr(`
    # test code
    # comments will be ignored
    line1 = asdf * sa + a / b
    # equal signs are left associative, 
    # others are right associative
    line2 = a = b:c|d e + f g h 
    line3 && true
    # for more info, look at operators.js
`,0)));


console.log(JSON.stringify(operatorExpr(`
    line1 = a $(b:(c*ww)) (++d):e++ # works
    line1 = a $(b:(c*ww)) ++d:e++ # what
`,0)));

console.log(JSON.stringify(operatorExpr(`
    ++i.what
`,0)));
*/


console.log(JSON.stringify(parse(`
    a+b`,0),null,4));
    
console.log(JSON.stringify(parse(`    
asdf    (select user : name == lemon | echo,d*e+f) (9)
`,0),null,4));



module.exports = {
    parse:function(str){
        return parse(str,0);
    }
};