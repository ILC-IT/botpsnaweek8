const fs = require('fs');
const path = require('path');
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js')
require('dotenv/config')

// initial value
let mapBonusRewardWeek = 1;
// Channel ID
const idChannelTest = process.env.IDCHANNEL;

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
        .setDescription(`This week is number ${mapBonusRewardWeek}, the best to use PSNA tokens at Fireheart Rise [&BBsCAAA=]`)
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
    if (mapBonusRewardWeek === 8){ // best week = 8
        if (day === 3){ // day 3 = Wednesday
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

// Function to schedule the notification check, once per day at 10am
const scheduleNotification = () => {
    const now = new Date();
    const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);  // 10 a.m.

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