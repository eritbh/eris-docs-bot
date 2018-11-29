const path = require('path');
const {Client} = require('yuuko');
const config = require('./config');

const c = new Client(config);

c.once('ready', () => {
	console.log('Ready!');
});
c.on('error', console.error);
c.addCommandDir(path.join(__dirname, 'commands'));

c.connect();
