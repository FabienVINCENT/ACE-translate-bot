const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/ace.sqlite', sqlite3.OPEN_READWRITE, (err) => {
	if (err) {
		return console.error(err.message);
	}

	console.log('Connected to the SQlite file.');
});


module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Search in ACE database !')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('The name of the mob')
				.setRequired(true)),
	async execute(interaction) {
		const search = interaction.options.getString('name');
		const sql = `SELECT * FROM mobs WHERE name_en LIKE '%${search}%' OR name_fr LIKE '%${search}%'`;

		db.serialize(() => {
			db.all(sql, async (err, rows) => {
				if (err) {
					console.error(err.message);
				}

				if (rows.length === 0) {
					interaction.reply('No mob found with this name.');
					return;
				}

				if (rows.length > 1) {
					interaction.reply(`Found ${rows.length} mobs with this name. Please specify. (${rows.map(row => row.name_en).join(', ')})`);
					return;
				}

				// const url_img = 'https://awakence.com/wp-content/uploads/2021/12/Ghajar-big-icon-190x300.png'
				const file = new MessageAttachment('./database/ghajar.png');
				const exampleEmbed = {
					image: {
						url: 'attachment://ghajar.png',
					},
				};

				await interaction.reply(
					{ content: 'English: ' + rows[0].name_en + '\t=>\t French: ' + rows[0].name_fr, embeds: [exampleEmbed], files: [file] },
				);
			});
		});
	},
};
