let parse = require("./parser.js");

module.exports = {
    parse:function(str){
        console.log("parsing your text owo awa");
        return parse(str,0);
    }
};