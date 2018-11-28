const {Command} = require('yuuko');

// Docs data is parsed from jsdoc directly
const classes = require('../misc/jsdoc_parse');
// Version info, etc. can be found in package.json
const erisPackage = require('../node_modules/eris/package.json');

// Properties pulled into all embeds for consistency
const embedDefaults = {
	author: {
		name: 'Eris docs',
		url: 'https://abal.moe/Eris'
	},
	color: 0x4e98d8,
	footer: {
		text: `Docs generated from eris@${erisPackage.version} | e;docs Class#property`
	}
};

module.exports = new Command(['docs', ''], (msg, args) => {
	let [classname, search] = args.join(' ').split(/[#. ]/);
	// 'new Client' => 'Client'
	if (classname === 'new') {
		classname = search;
		search = undefined;
	}

	if (!classname) {
		msg.channel.createMessage('https://abal.moe/Eris/docs');
		return;
	}
	const docsClass = classes.find(cls => cls.name.toLowerCase() === classname.toLowerCase());
	if (!docsClass) {
		msg.channel.createMessage(`Couldn't find class ${classname}`).catch(pass);
		return;
	}
	if (!search || search === 'constructor') {
		msg.channel.createMessage(formatClass(docsClass));
		return;
	}

	let docsItem;
	for (const category of ['properties', 'methods', 'events']) {
		docsItem = docsClass[category] && docsClass[category].find(item => item.name.toLowerCase() === search.toLowerCase());
		if (docsItem) break; // otherwise try the next set of members
	}
	if (!docsItem) {
		msg.channel.createMessage(`Couldn't find ${search} on class ${docsClass.name}`).catch(pass);
		return;
	}
	let contents;
	// Properties don't have a .kind, but events and methods do
	if (docsItem.kind) {
		contents = formatMethodOrEvent(docsItem);
	} else {
		contents = formatProperty(docsClass.name, docsItem);
	}
	msg.channel.createMessage(contents).catch(pass);
});

// Generate a link to a certain member of a class
function linkTo (classname, doclet) {
	if (doclet && doclet.kind) {
		return `https://abal.moe/Eris/docs/${classname}#${doclet.kind}-${doclet.name}`;
	}
	return `https://abal.moe/Eris/docs/${classname}`;
}

// Generate a list of parameters to put in a field value
function paramList (params) {
	let string = params
		.map(param => `**\`${param.name}\`** (${param.type})\n${param.description}${param.defaultvalue ? `\nDefault: \`${param.defaultValue}\`` : ''}`)
		.join('\n\n');
	// Quick and dirty fit to the length requirement - this happens listing the
	// client's constructor parameters, for instance
	if (string.length > 1024) {
		string = `${string.slice(0, 1021)}...`;
	}
	return string;
}

// Message formatting functions
function formatClass (docsClass) {
	const url = linkTo(docsClass.name);
	return {
		content: `<${url}>`,
		embed: {
			...embedDefaults,
			title: `\`${docsClass.name}\``,
			url,
			description: docsClass.description,
			fields: [
				{
					name: 'Constructor Params',
					value: paramList(docsClass.params)
				},
				...['properties', 'methods', 'events'].map(category => {
					const categoryData = docsClass[category];
					return categoryData && {
						name: `${categoryData.length} ${category}`,
						value: categoryData.slice(0, 5).map(item => item.name).join('\n') || '\\*dust*',
						inline: true
					};
				})
			].filter(f => f && f.value) // Remove undefined/valueless fields
		}
	};
}
function formatMethodOrEvent (doclet) {
	const classname = doclet.display.replace(/#.*/, '');
	const url = linkTo(classname, doclet);
	const message = {
		content: `Docs: <${url}>`,
		embed: {
			title: `\`${doclet.display}\``,
			description: doclet.description,
			url,
			color: 2274004,
			author: {
				name: 'Eris docs'
			},
			fields: [
				{
					name: 'Parameters',
					value: paramList(doclet.params)
				}
			],
			footer: {
				text: `Docs generated from eris@${erisPackage.version}`
			}
		}
	};
	if (doclet.kind === 'function') {
		message.embed.fields.push({
			name: 'Return Type',
			value: doclet.returns
		});
	}
	return message;
}
function formatProperty (classname, property) {
	const url = linkTo(classname);
	return {
		content: `Docs: <${url}>`,
		embed: {
			title: `${classname}#${property.name}`,
			url,
			description: property.description,
			fields: [
				{
					name: 'Type',
					value: property.type
				}
			]
		}
	};
}

// Readability - .catch(pass) instead of .catch(() => {}) or something else
function pass () {}