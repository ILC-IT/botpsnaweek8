const { SlashCommandBuilder } = require('discord.js');

function mapBonusRewardweekNumber(date){
    const startDate = new Date('2023-07-07'); // Start date of the first week, it was week number 5
    const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000; // Number of milliseconds in a week
  
    const elapsedTime = date.getTime() - startDate.getTime();
    const weekNumber = Math.floor(elapsedTime / millisecondsPerWeek) + 5;
    let weekNumberMod8 = weekNumber % 8;
    if (weekNumberMod8 === 0) weekNumberMod8 = 8; //weeks are numbered from 1 to 8
  
    return weekNumberMod8;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('week')
		.setDescription('Returns with the current week number of PSNA'),
	async execute(interaction) {
        const givenDate = new Date();
        let week = mapBonusRewardweekNumber(givenDate)
		await interaction.reply(`Week: ${week}`);
	},
};