const TelegramBot = require("node-telegram-bot-api");
const { allSubsciptions } = require('../db')

const plans = [
  {
    name: "Intermediate Mentorship",
    group: "NivanFX Intermediate Mentorship Program",
  },
  {
    name: "Profitable Trader",
    group: "NivanFX Profitable Trader Mentorship Program",
  },
  {
    name: "Exclusive Mentorship",
    group: "NivanFX Exclusive Mentorship Program",
  },
  {
    name: "Premium Signals",
    group: "NivanFx Premium Signals",
  },
];

const activateIntermdiateBot = () => {
  const bot = new TelegramBot(
    "7026344938:AAHqgEBOfN9RJIy9g_ztBOTk1Pp443Z1WzA",
    { polling: true }
  );
  bot.on("new_chat_members", async (msg) => {
    try {
      const chatId = msg.chat.id;
      const newMembers = msg.new_chat_members;
    //   console.log(msg);
      allSubsciptions(async ({ status, data }) =>{
        if(status){
            for (const member of newMembers) {
               const userName = member.username;
               const thisUser = data.filter(function(el){
                    return el.telegram == userName
               })
               const getGroup = plans.filter(function(el){
                return el.group == msg.chat.title;
               })[0]
               if(getGroup.group == thisUser.plan){
                     if (thisUser.length > 0) {
                       if (thisUser[0].valid) {
                         await bot.sendMessage(
                           chatId,
                           `Welcome, ${member.first_name}!`
                         );
                       } else {
                         if (userName == "nivan_fx_auth_bot") {
                           await bot.sendMessage(
                             chatId,
                             `Welcome, ${member.first_name}!`
                           );
                         } else {
                           try {
                             await bot.sendMessage(
                               chatId,
                               `, ${member.first_name}! Your are not allowed to be here.`
                             );
                             await bot.banChatMember(chatId, member.id);
                             await bot.unbanChatMember(chatId, member.id);
                           } catch (error) {
                             console.log("minor error");
                           }
                         }
                       }
                     } else {
                       if (userName == "nivan_fx_auth_bot") {
                         await bot.sendMessage(
                           chatId,
                           `Welcome, ${member.first_name}!`
                         );
                       } else {
                         try {
                           await bot.sendMessage(
                             chatId,
                             `, ${member.first_name}! Your are not allowed to be here.`
                           );
                           await bot.banChatMember(chatId, member.id);
                           await bot.unbanChatMember(chatId, member.id);
                         } catch (error) {
                           console.log("minor error");
                         }
                       }
                     }
               }else{
                     try {
                       await bot.sendMessage(
                         chatId,
                         `, ${member.first_name}! Your are not allowed to be here.`
                       );
                       await bot.banChatMember(chatId, member.id);
                       await bot.unbanChatMember(chatId, member.id);
                     } catch (error) {
                       console.log("minor error");
                    }
               }
            }
        }
      });
    } catch (err) {
      console.log("ee");
    }
  });

  bot.on("polling_error", (error) => {
    console.error(error);
  });

  bot.on("polling_error", (error) => {
    console.log(error);
    console.log("ERRRR");
  });
  console.log("Intermediate Bot is running...");
};

module.exports = { activateIntermdiateBot };
