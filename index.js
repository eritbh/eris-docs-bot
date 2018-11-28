const path = require('path');
const {Client} = require('yuuko');
const config = require('./config');

const c = new Client(config);

c.on('ready', () => {
	console.log('Ready!');
});

c.addCommandDir(path.join(__dirname, 'commands'));

c.connect();
