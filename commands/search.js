const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require('discord.js');
const fs = require('fs');

// Parse the file
const mobs = JSON.parse(fs.readFileSync('./database/mobs.json', 'utf8'));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Search in ACE database !')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('The name of the mob')
				.setRequired(true)),
	async execute(interaction) {
		// Get the query
		const search = interaction.options.getString('name');

		// Filter with query
		const mobsFilter = mobs.filter(mob => mob.name_en.toLowerCase().includes(search.toLowerCase()) || mob.name_fr.toLowerCase().includes(search.toLowerCase()));

		// If no result
		if (mobsFilter.length === 0) {
			interaction.reply('No mob found with this name');
			return;
		}

		const embeds = [];
		const files = [];

		// For each mob
		mobsFilter.forEach(mob => {
			// Create the attachment file
			files.push(new MessageAttachment(mob.image));
			// Calculate the filename
			const filename = mob.image.substring(mob.image.lastIndexOf('/') + 1);
			// Create the embed
			embeds.push(
				{
					fields: [
						{
							name: mob.name_en,
							value: mob.name_fr,
						},
					],
					image: {
						url: `attachment://${filename}`,
					},
				},
			);
		});

		// Reply with the embeds
		await interaction.reply({ embeds, files });
	},
};
