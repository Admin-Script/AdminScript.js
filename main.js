let parse = require("./parser.js");

module.exports = {
    parse:function(str){
        console.log("parsing your text");
        return parse(str,0);
    }
};