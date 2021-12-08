//main file that deals with parsing

const sharedVars = {
    onLink:[]
};

require("./util.js")(sharedVars);
let atomicExpr = require("./atomicExpr.js")(sharedVars);
let operatorExpr = require("./operatorExpr")(sharedVars);

sharedVars.atomicExpr = atomicExpr;
sharedVars.operatorExpr = operatorExpr;

//link those modules
sharedVars.onLink.map(fn=>fn());

module.exports = (str)=>{
    return operatorExpr(str,0);
};