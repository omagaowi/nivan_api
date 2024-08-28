require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const discordPlans = [
  {
    discordCode: "1278061542167810058",
    plan: "Intermediate Mentorship",
    type: "mentorship",
    planCode: "PLN_cu7k3ly30mwip4g",
  },
  {
    discordCode: "1278061850847871086",
    planCode: "PLN_w9fggz2ezfe44u9",
    plan: "Exclusive Mentorship",
    type: "mentorship",
  },
  {
    discordCode: "1278062007236694147",
    planCode: "PLN_omp4zkk597lbobe",
    plan: "Profitable Trader",
    type: "mentorship",
  },
  {
    discordCode: "PLN_d87553b9gq8mhde",
    planCode: "",
    plan: "Premium Signals",
    type: "signal",
  },
];

const runDiscordBot = (db) => {
    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    });
    // When the bot is ready, run this code
    client.once("ready", () => {
      console.log('discord bot active!')
    });

    // Listen for new members joining the server
    client.on("guildMemberAdd", async (member) => {
      // ID of the role you want to assign to new members
      // Fetch the role from the guild
      const userName = member.user.globalName
      try{
              db.collection('subscriptions').findOne({ discord: userName }).then(async (data) => {
                      console.log(data)
                      const roleId = discordPlans.filter(function (el) {
                        return el.planCode == data.planCode;
                      })[0].discordCode;
                      if(roleId){
                         const role = member.guild.roles.cache.get(roleId);
                         if(role){
                            await member.roles.add(role);
                         }else{
                            console.log('invalid role')
                         }
                      }else{
                         console.log("invalid roleID");
                      }
                }).catch((err)=>{
                    console.log('DATABASE ERROR')
                    console.log(err)
                })
      }catch(err){
        console.log(err, 'ROLE ERROR')
      }

    });

    // Login to Discord with your app's token
    client.login(process.env.DISCORD_TOKEN);
};

module.exports = runDiscordBot;
