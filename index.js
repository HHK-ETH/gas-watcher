import fetch from "node-fetch";
import dotenv from "dotenv";
import { Client, Intents, MessageEmbed } from "discord.js";
dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS] });

const gas = {
    timestamp: 0,
    data: null
};
const prefix = '!!gas';

//update gas every 10 seconds
var intervalId = setInterval(async function(){
    const fetchGasPrice = await fetch('https://api.blocknative.com/gasprices/blockprices', {method: 'GET', headers: {
        'Authorization': process.env.BLOCKNATIVE_TOKEN, 
        'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    const gasData = await fetchGasPrice.json();
    gas.timestamp = new Date().getTime();
    gas.data = gasData;
    if (client.user) {
        client.user.setActivity("BaseFee: "+gasData.blockPrices[0].baseFeePerGas+" GWEI", {
            type: "WATCHING",
        });
    }
  }, 10_000);

client.on('messageCreate', function(message) {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const currentGas = gas.data.blockPrices[0];

    const embedMsg = new MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Current gas price :')
    .setDescription('Current baseFee : '+currentGas.baseFeePerGas+' GWEI')
	.addFields(
		{ name: ':orangutan:  FAST (99%) :', value: 'MaxFee => '+currentGas.estimatedPrices[0].maxFeePerGas+' & MaxPriorityFee => '+currentGas.estimatedPrices[0].maxPriorityFeePerGas },
		{ name: ':rabbit2:  MEDIUM (90%) :', value: 'MaxFee => '+currentGas.estimatedPrices[2].maxFeePerGas+' & MaxPriorityFee => '+currentGas.estimatedPrices[2].maxPriorityFeePerGas },
		{ name: ':turtle:  SLOW (70%) :', value: 'MaxFee => '+currentGas.estimatedPrices[4].maxFeePerGas+' & MaxPriorityFee => '+currentGas.estimatedPrices[4].maxPriorityFeePerGas }
	)
	.setTimestamp();

    message.reply({ embeds: [embedMsg] });
});

client.login(process.env.DISCORD_TOKEN);