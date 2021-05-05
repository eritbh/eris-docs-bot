const {Command} = require('yuuko');
module.exports = new Command('update', async msg => {
	await msg.channel.createMessage('Updating the bot to latest Eris version, gimme a minute or so').catch(() => {});
	// this will restart the process
	require('child_process').execSync('npm i --no-save eris@latest; sudo systemctl restart eris-docs-bot.service');
}, {
	custom: msg => msg.member.roles.includes('831967755447828493')
});
