'use strict';

const childProcess = require('child_process');
const {Command} = require('yuuko');
const {version: erisVersion} = require('../node_modules/eris/package');
const {version: jsdocVersion} = require('../node_modules/jsdoc/package');
const gitCommit = childProcess.execSync('git rev-parse --short HEAD', {encoding: 'utf8'}).slice(0, -1);

module.exports = new Command([
	'info',
	'help',
	'version',
	'ping',
	'about',
], msg => {
	msg.channel.createMessage(`
Usage: \`e;docs ClassName\` or \`e;docs ClassName#methodPropOrEvent\`
Source: <https://github.com/Geo1088/eris-docs-bot>
Bot commit: \`${gitCommit}\`, using \`jsdoc@${jsdocVersion}\`, \`eris@${erisVersion}\`
Eris version outdated? \`e;update\`
	`).catch(console.error);
});
