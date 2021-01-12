const {Command} = require('yuuko');
module.exports = new Command('update', () => {
	// this will restart the process
	require('child_process').execSync('npm i --no-save eris@latest; sudo systemctl restart eris-docs-bot.service');
});
