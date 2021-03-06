import fetch from "node-fetch";
import dotenv from "dotenv";
import { Client, Intents, MessageEmbed } from "discord.js";
dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS] });

let gasData = null;
const prefix = 'eth!gas';

//update gas every 60 seconds
var intervalId = setInterval(async function(){
    const fetchGasPrice = await fetch('https://api.blocknative.com/gasprices/blockprices', {method: 'GET', headers: {
        'Authorization': process.env.BLOCKNATIVE_TOKEN, 
        'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    gasData = await fetchGasPrice.json();
    if (client.user && gasData.blockPrices) {
        client.user.setActivity("Fast="+Math.round(gasData.blockPrices[0].baseFeePerGas + gasData.blockPrices[0].estimatedPrices[0].maxPriorityFeePerGas)+" Slow="+Math.round(gasData.blockPrices[0].baseFeePerGas + 1), {
            type: "PLAYING",
        });
        const guild = client.guilds.cache.get('748031363935895552');
        const user = await guild.members.fetch(client.user.id);
        await user.setNickname(Math.round(gasData.blockPrices[0].baseFeePerGas + 1)+" GWEI");
    }
  }, 60_000);

client.on('messageCreate', function(message) {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix) && gasData !== null) return;
    if (message.channelId !== '809503313975443536') return; //can call only in #bot-command channel

    const currentGas = gasData.blockPrices[0];

    const embedMsg = new MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Gas price to make it into the next block :')
    .setDescription('Current baseFee : '+currentGas.baseFeePerGas+' GWEI')
	.addFields(
		{ name: ':orangutan:  FAST (99% chance) :', value: 'MaxFee => '+Math.round(currentGas.estimatedPrices[0].maxFeePerGas)+' & MaxPriorityFee => '+Math.round(currentGas.estimatedPrices[0].maxPriorityFeePerGas) },
		{ name: ':rabbit2:  MEDIUM (90% chance) :', value: 'MaxFee => '+Math.round(currentGas.estimatedPrices[2].maxFeePerGas)+' & MaxPriorityFee => '+Math.round(currentGas.estimatedPrices[2].maxPriorityFeePerGas) },
		{ name: ':turtle:  SLOW (70% chance) :', value: 'MaxFee => '+Math.round(currentGas.estimatedPrices[4].maxFeePerGas)+' & MaxPriorityFee => '+Math.round(currentGas.estimatedPrices[4].maxPriorityFeePerGas) }
	)
	.setTimestamp();
    message.reply({ embeds: [embedMsg] });
});

client.login(process.env.DISCORD_TOKEN);