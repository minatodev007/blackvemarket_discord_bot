// This will check if the node version you are running is the required
// Node version, if it isn't it will throw the following error to inform
// you.
if (Number(process.version.slice(1).split(".")[0]) < 16)
  throw new Error("Node 16.x or higher is required. Update Node on your system.");

require("dotenv").config();

const { intents, partials, permLevels, token } = require("./config.js");

// Load up the discord.js library
const { Client, Collection, MessageEmbed } = require("discord.js");

const activityService = require('./services/activity')

// Database Connection
const { connect } = require("./modules/connect.js")
connect();

// This is your client. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `client.something`,
// or `bot.something`, this is what we're referring to. Your client.
const client = new Client({ intents, partials });

// Aliases, commands and slash commands are put in collections where they can be
// read from, catalogued, listed, etc.
const commands = new Collection();
const aliases = new Collection();
const slashcmds = new Collection();

// Generate a cache of client permissions for pretty perm names in commands.
const levelCache = {};
for (let i = 0; i < permLevels.length; i++) {
  const thisLevel = permLevels[i];
  levelCache[thisLevel.name] = thisLevel.level;
}

// To reduce client pollution we'll create a single container property
// that we can attach everything we need to.
client.container = {
  commands,
  aliases,
  slashcmds,
  levelCache
};

let vethugsSaleFrom = Date.now()
let vethugsBuyFrom = Date.now()
let createdSaleFrom = Date.now()
let createdBuyFrom = Date.now()

// We're doing real fancy node 8 async/await stuff here, and to do that
// we need to wrap stuff in an anonymous function. It's annoying but it works.

const toUppercase = str => str.charAt(0).toUpperCase() + str.slice(1)

const checkVeThugsSale = async (message) => {
  const activities = await activityService.getActivities(vethugsSaleFrom)
  //Filter by Action
  //Action Type:Create Sale
  activities.filter(activity => activity.action === 'sale' && activity.contract.name === 'VeThugs').map(activity => {
    let attrs = ''
    activity.attributes.map(attr => {
      attrs = `${attrs}**-${toUppercase(attr.trait_type)}: ** ${toUppercase(attr.value)}\n`
    })
    let description = `
      **Create Sale**
      **Collection:** ${activity.contract.name}
      **Contract Address:** [${activity.contract.address}](https://explore.vechain.org/accounts/${activity.contract.address}/)
      **Token ID:** ${activity.tokenId}
      **Token Name:** ${activity.tokenName}
      
      **Seller:** [${activity.user.substr(0, 6)}...${activity.user.substr(activity.user.length - 4, 4)}](https://blackvemarket.com/author/${activity.user})
      **Transaction ID:** [${activity.info.txid.substr(0, 6)}...${activity.info.txid.substr(activity.info.txid.length - 4, 4)}](https://explore.vechain.org/transactions/${activity.info.txid}#info)

      **Attributes Count:** ${activity.attributes.length}
      ${attrs}

    `
    if (activity.info.auction > 0) {
      description = description.concat(`Auction
      **Start Price:** ${activity.info.startPrice} VET
      **End Price:** ${activity.info.endPrice} VET
      **Auction:** ${activity.info.auction} Days`)
    } else {
      description = description.concat(`**Price:** ${activity.info.startPrice} VET`)
    }
    try {
      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setAuthor({ name: `BlackVeMarket`, iconURL: `https://cdn.discordapp.com/icons/924020234850041917/b8da673296d07ca8b3fe3c1f7ff3f32c.webp?size=100`, url: `https://blackvemarket.com` })
        .setDescription(description)
        .setThumbnail(`${activity.image}`)
        .setFooter({ text: `${new Date(activity.date).toISOString().substr(0, 10)} ${new Date(activity.date).toISOString().substr(11, 8)}`, iconURL: `https://cdn.discordapp.com/icons/924020234850041917/b8da673296d07ca8b3fe3c1f7ff3f32c.webp?size=100` });

      message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.log('error:', err)
    }
  })
  vethugsSaleFrom = Date.now()
}

const checkVeThugsBuy = async (message) => {
  const activities = await activityService.getActivities(vethugsBuyFrom)
  //Filter by Action
  //Action Type:Create Sale
  activities.filter(activity => activity.action === 'buy' && activity.contract.name === 'VeThugs').map(activity => {
    let attrs = ''
    activity.attributes.map(attr => {
      attrs = `${attrs}**-${toUppercase(attr.trait_type)}: ** ${toUppercase(attr.value)}\n`
    })
    let description = `
      **Buy Token**
      **Collection:** ${activity.contract.name}
      **Contract Address:** [${activity.contract.address}](https://explore.vechain.org/accounts/${activity.contract.address}/)
      **Token ID:** ${activity.tokenId}
      **Token Name:** ${activity.tokenName}
      
      **Buyer:** [${activity.user.substr(0, 6)}...${activity.user.substr(activity.user.length - 4, 4)}](https://blackvemarket.com/author/${activity.user})
      **Seller:** [${activity.info.seller.substr(0, 6)}...${activity.info.seller.substr(activity.info.seller.length - 4, 4)}](https://blackvemarket.com/author/${activity.info.seller}) 
      **Transaction ID:** [${activity.info.txid.substr(0, 6)}...${activity.info.txid.substr(activity.info.txid.length - 4, 4)}](https://explore.vechain.org/transactions/${activity.info.txid}#info)

      **Attributes Count:** ${activity.attributes.length}
      ${attrs}

      **Price:** ${activity.info.price} VET
    `
    try {
      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setAuthor({ name: `BlackVeMarket`, iconURL: `https://cdn.discordapp.com/icons/924020234850041917/b8da673296d07ca8b3fe3c1f7ff3f32c.webp?size=100`, url: `https://blackvemarket.com` })
        .setDescription(description)
        .setThumbnail(`${activity.image}`)
        .setFooter({ text: `${new Date(activity.date).toISOString().substr(0, 10)} ${new Date(activity.date).toISOString().substr(11, 8)}`, iconURL: `https://cdn.discordapp.com/icons/924020234850041917/b8da673296d07ca8b3fe3c1f7ff3f32c.webp?size=100` });

      message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.log('error:', err)
    }
  })
  vethugsBuyFrom = Date.now()
}

const checkCreatedSale = async (message) => {
  const activities = await activityService.getActivities(createdSaleFrom)
  //Filter by Action
  //Action Type:Create Sale
  activities.filter(activity => activity.action === 'sale' && ['Art', 'Cartoon', 'Collectibles', 'Music'].includes(activity.contract.name)).map(activity => {
    let description = `
      **Create Sale**
      **Collection:** ${activity.contract.name}
      **Contract Address:** [${activity.contract.address}](https://explore.vechain.org/accounts/${activity.contract.address}/)
      **Token ID:** ${activity.tokenId}
      **Token Name:** ${activity.tokenName}
      
      **Seller:** [${activity.user.substr(0, 6)}...${activity.user.substr(activity.user.length - 4, 4)}](https://blackvemarket.com/author/${activity.user})
      **Transaction ID:** [${activity.info.txid.substr(0, 6)}...${activity.info.txid.substr(activity.info.txid.length - 4, 4)}](https://explore.vechain.org/transactions/${activity.info.txid}#info)
      **Royalty:** ${activity.info.royalty}%

    `
    if (activity.info.auction > 0) {
      description = description.concat(`Auction
      **Start Price:** ${activity.info.startPrice} VET
      **End Price:** ${activity.info.endPrice} VET
      **Auction:** ${activity.info.auction} Days`)
    } else {
      description = description.concat(`**Price:** ${activity.info.startPrice} VET`)
    }
    try {
      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setAuthor({ name: `BlackVeMarket`, iconURL: `https://cdn.discordapp.com/icons/924020234850041917/b8da673296d07ca8b3fe3c1f7ff3f32c.webp?size=100`, url: `https://blackvemarket.com` })
        .setDescription(description)
        .setThumbnail(`${activity.image}`)
        .setFooter({ text: `${new Date(activity.date).toISOString().substr(0, 10)} ${new Date(activity.date).toISOString().substr(11, 8)}`, iconURL: `https://cdn.discordapp.com/icons/924020234850041917/b8da673296d07ca8b3fe3c1f7ff3f32c.webp?size=100` });

      message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.log('error:', err)
    }
  })
  createdSaleFrom = Date.now()
}

const checkCreatedBuy = async (message) => {
  const activities = await activityService.getActivities(createdBuyFrom)
  //Filter by Action
  //Action Type:Create Sale
  //Action Type: Buy
  activities.filter(activity => activity.action === 'buy' && ['Art', 'Cartoon', 'Collectibles', 'Music'].includes(activity.contract.name)).map(activity => {
    let description = `
      **Buy Token**
      **Collection:** ${activity.contract.name}
      **Contract Address:** [${activity.contract.address}](https://explore.vechain.org/accounts/${activity.contract.address}/)
      **Token ID:** ${activity.tokenId}
      **Token Name:** ${activity.tokenName}
      
      **Buyer:** [${activity.user.substr(0, 6)}...${activity.user.substr(activity.user.length - 4, 4)}](https://blackvemarket.com/author/${activity.user})
      **Seller:** [${activity.info.seller.substr(0, 6)}...${activity.info.seller.substr(activity.info.seller.length - 4, 4)}](https://blackvemarket.com/author/${activity.info.seller}) 
      **Transaction ID:** [${activity.info.txid.substr(0, 6)}...${activity.info.txid.substr(activity.info.txid.length - 4, 4)}](https://explore.vechain.org/transactions/${activity.info.txid}#info)
      **Royalty:** ${activity.info.royalty}%

      **Price:** ${activity.info.price} VET
    `
    try {
      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setAuthor({ name: `BlackVeMarket`, iconURL: `https://cdn.discordapp.com/icons/924020234850041917/b8da673296d07ca8b3fe3c1f7ff3f32c.webp?size=100`, url: `https://blackvemarket.com` })
        .setDescription(description)
        .setThumbnail(`${activity.image}`)
        .setFooter({ text: `${new Date(activity.date).toISOString().substr(0, 10)} ${new Date(activity.date).toISOString().substr(11, 8)}`, iconURL: `https://cdn.discordapp.com/icons/924020234850041917/b8da673296d07ca8b3fe3c1f7ff3f32c.webp?size=100` });

      message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.log('error:', err)
    }
  })
  createdBuyFrom = Date.now()
}

const init = async () => {
  client.on('ready', function () {
    console.log('The Bot is ready')
    console.log(client.user.username)
  });

  client.on('messageCreate', function (message) {
    if (message.content === "$listing-vethugs") {
      setInterval(function () {
        checkVeThugsSale(message)
      }, 10000);
    }
    if (message.content === "$sale-vethugs") {
      setInterval(function () {
        checkVeThugsBuy(message)
      }, 10000);
    }
    if (message.content === "$listing-created") {
      setInterval(function () {
        checkCreatedSale(message)
      }, 10000);
    }
    if (message.content === "$sale-created") {
      setInterval(function () {
        checkCreatedBuy(message)
      }, 10000);
    }
  });

  // client.login(crypto.decrypt(token));
  client.login(process.env.DISCORD_TOKEN);
};

init();

// checkLog()