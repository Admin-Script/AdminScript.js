let parse = require("./parser.js");

module.exports = {
    parse:function(str){
        return parse(str,0);
    }
};