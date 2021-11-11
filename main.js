
/*
?select user [JoinedAt > -3 hours] | ban
?select message : time > -3 hours : user == "sussyBaka" | delete
>> 135 messages will be deleted. if you are sure, type ?commit

?select message [time > -3 hours] [user == "sussyBaka"] | delete

?select message time > -3 hours  user == "sussyBaka" | delete

?msgs => select message : time > -3 hours : user == "sussyBaka"
?msgs | length | echo
>> 135
?msgs | echo
>> ...displays all 135 messages
?msgs | delete
>> 135 messages will be deleted. if you are sure, type ?commit
?commit
>>message deleted
?clear log
*/

const Discord = require('discord.js');

let getClient = function(Discord){
    let flags = Discord.Intents.FLAGS;
    const client = new Discord.Client({
        intents: [
            flags.GUILDS, flags.GUILD_MESSAGES
        ] /*["GUILDS", "GUILD_MESSAGES"]*/
    });
    
    /*
    let wrapper = Object.create(client);
    
    let evts = {};
    let targets = "ready,message".split(",");
    targets.map(t=>{
        evts[t] = [];
        client.on(t,function(a,b,c,d,e,f){
            evts[t].map(cb=>{
                console.log("cb called");
                cb(a,b,c,d,e,f)
            });
        });
    });
    client.on = function(evt,cb){
        evts[evt].push(cb)
    };*/
    return client;
};


const client = getClient(Discord);
require('dotenv').config();
client.login(process.env.TOKEN);


let Bot = require("bot.js");

let main = async function(){
    let bot = (new Bot(client,"?"));
    bot.
    
    bot.onReady(()=>{
        console.log(`Logged in as ${client.user.tag}!`);
        const guilds = bot.client.guilds.cache;
        initmsgs.push("guilds: "+JSON.stringify(guilds.map(g=>g.name)));
        //sending it to every channels
        guilds.map(guild=>{
            //GUILD_CATEGORY
            //GUILD_CATEGORY
            //GUILD_TEXT
            //GUILD_VOICE
            guild.channels.cache.filter(channel=>{
                channel.type === "GUILD_TEXT";
            }).map(channel=>{
                console.log(channel.type);
                channel.send(initmsgs.join("\n"));
            });
        });
    });
    
    
    bot.sub("id").sub("set").addFunc(async function(msg,argv){
        if(argv[0]){
            let newid = argv[0];
            try{
                await updateIdStr(newid);//sideefect: mutates idstr if successful
                bot.prefix = idstr;
                msg.channel.send("idstr update success. New idstr: "+idstr);
            }catch(err){
                msg.channel.send("idstr "+newid+": update failed. current id: "+idstr);
            }
        }
    });
    
    bot.sub("ip").addFunc(function(msg, argv) {
        exec("curl -s ifconfig.me", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
            }else if (stderr) {
                console.log(`stderr: ${stderr}`);
            }
            msg.channel.send("the current ip address is: " + stdout);
        });
    });
    
    bot.sub("eval").addFunc(function(msg, argv){
        let content = msg.content.slice(idstr.length+" eval".length).trim();
        
        try{
            eval(content);
            msg.channel.send("eval success");
        }catch(err){
            console.log(err);
            msg.channel.send("eval error: "+err);
        }
    });
    
    
    //all bots
    slash.sub("id").addFunc(function(msg,argv){
        console.log("adasdfasdf");
        msg.channel.send("idstr: "+idstr);
    });
    
    slash.sub("showinfo").addFunc(function(msg,argv){
        exec("curl -s ifconfig.me", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
            }else if (stderr) {
                console.log(`stderr: ${stderr}`);
            }
            let lines = [
                "ip: " + stdout,
                "idstr: "+idstr
            ];
            msg.channel.send(lines.join("\n"));
        });
    });
};

main();

