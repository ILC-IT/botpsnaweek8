const fs = require('fs');
const path = require('path');
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js')
require('dotenv/config')

// initial value, do not change
let mapBonusRewardWeek = 1;
// Channel ID
const idChannelTest = process.env.IDCHANNEL;




/////////////////////////////// CUSTOMIZE HERE /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
const weekToAlert = 2; //1-8
const dayToAlert = 3; //0 Sunday, 1 Monday, 2 Tuesday, 3 Wednesday, 4 Thursday, 5 Friday, 6 Saturday
const hourToAlert = 10; //0-23
const minuteToAlert = 0; //0-59
const secondToAlert = 0; //0-59

//customize best maps per week
let bestMapW1 = "Straits of Devastation [&BPcCAAA=]"; //week1
let bestMapW2 = "Frostgorge Sound [&BHwCAAA=]"; //week2
let bestMapW3 = "Southsun Cove [&BNUGAAA=]"; //week3
let bestMapW4= "Cursed Shore [&BB4DAAA=]"; //week4
let bestMapW5 = "Fireheart Rise [&BBsCAAA=]"; //week5
let bestMapW6 = "Mount Maelstrom [&BNMCAAA=]"; //week6
let bestMapW7 = "Fireheart Rise [&BBsCAAA=]"; //week7
let bestMapW8 = "Frostgorge Sound [&BHwCAAA=]"; //week8
//let bestMapW = "Mount Maelstrom [&BNMCAAA=]" //week
//let bestMapW = "Cursed Shore [&BB4DAAA=]" //week
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
let map = [bestMapW1, bestMapW2, bestMapW3, bestMapW4, bestMapW5, bestMapW6, bestMapW7, bestMapW8];




const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
})

client.commands = new Collection();
// Grab all the command files from the commands directory
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Function to send a notification embed message
const sendNotification = (channel) => {
    let h = new Date();
    let hoy = h.toLocaleDateString();
    // define embed notification
    const embed = new EmbedBuilder()
        .setTitle(`GW2 PSNA BEST WEEK ${mapBonusRewardWeek}`)
        .setDescription(`This week is number ${mapBonusRewardWeek}, the best to use PSNA tokens at ${map[mapBonusRewardWeek-1]} \n
        [Fast Farming](https://fast.farming-community.eu/conversions/karma) - [Wiki](https://wiki.guildwars2.com/wiki/Map_bonus_reward#Central_Tyria_reward_track_rotation) \n
        \`\`\`Best PSNA: ${map[mapBonusRewardWeek-1]}\`\`\` `)
        .setColor('Random')
    // send notification to channel    
    channel.send({embeds: [embed]});
};

function getMapBonusRewardWeekNumber(){
    // returns current number week of map bonus reward (mapBonusRewardWeek) between 1 and 8
    const givenDate = new Date();
    const day = givenDate.getDay();
    mapBonusRewardWeek = mapBonusRewardweekNumber(givenDate);
    const channel = client.channels.cache.get(idChannelTest);
    if (mapBonusRewardWeek === weekToAlert){
        if (day === dayToAlert){
            if (channel){
                console.log('Hoy es el dia ',givenDate)
                sendNotification(channel);
            }else{
                console.error(`Channel ${idChannelTest} not found`);
            }
        }
    }
}

function mapBonusRewardweekNumber(date){
    const startDate = new Date('2023-07-07'); // Start date of the first week, it was week number 5
    const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000; // Number of milliseconds in a week
  
    const elapsedTime = date.getTime() - startDate.getTime();
    const weekNumber = Math.floor(elapsedTime / millisecondsPerWeek) + 5;
    let weekNumberMod8 = weekNumber % 8;
    if (weekNumberMod8 === 0) weekNumberMod8 = 8; //weeks are numbered from 1 to 8
  
    return weekNumberMod8;
}

// Function to schedule the notification check, once per day at hourToAlert
const scheduleNotification = () => {
    const now = new Date();
    const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hourToAlert, minuteToAlert, secondToAlert);

    if (now > targetTime) {
        targetTime.setDate(targetTime.getDate() + 1);
    }

    const timeUntilTarget = targetTime.getTime() - now.getTime();
    setTimeout(() => {
        getMapBonusRewardWeekNumber();
        setInterval(getMapBonusRewardWeekNumber, 24 * 60 * 60 * 1000); // Repeat every 24 hours
    }, timeUntilTarget);
};

// Event triggered when the bot is ready
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    scheduleNotification();
});

// Slash commands
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Login the bot
client.login(process.env.TOKEN)