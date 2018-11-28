const childProcess = require('child_process');

// Execute jsdoc, get the JSON output, parse it, and store it.
const command = './node_modules/.bin/jsdoc node_modules/eris -r -X -d console';
console.log(`> ${command}`);
const rawDocsData = JSON.parse(childProcess.execSync(command, 'utf8'));
const classes = []; // We'll clean up the info and write what we want here

// Helper: converts the prop/param format from jsdoc to an easier to work with
// format, broken out because it's used in a bunch of places
function paramPropMapper (param) {
	return {
		name: param.name,
		type: param.type.names.join(' | '),
		optional: param.optional,
		nullable: param.nullable,
		defaultvalue: param.defaultvalue,
		description: param.description
	};
}

// Loop over all the doclets
for (const doclet of rawDocsData) {
	// Discard undocumented things to get rid of duplicate info
	if (doclet.undocumented) continue;

	switch (doclet.kind) {
		case 'class': {
			const classObject = {
				name: doclet.name,
				display: doclet.longname,
				description: doclet.classdesc,
				augments: doclet.augments,
				params: doclet.params && doclet.params.map(paramPropMapper),
				properties: doclet.properties && doclet.properties.map(paramPropMapper),
				methods: [],
				events: []
			};
			// If we encountered methods/events for this class before the main
			// class info, merge those into the new object
			const existing = classes.find(c => c.name === classObject.name);
			if (existing) {
				// Create a copy of the existing peoperties and write them into
				// the class info we just added, then write it all to the
				// original object (this may be too clever)
				Object.assign(existing, classObject, {...existing});
			} else {
				classes.push(classObject);
			}
			break;
		}
		// Things that go on classes (properties come with the class itself)
		case 'function':
		case 'event': {
			// For some reason events have 'properties' not 'params' in jsdoc,
			// this is stupid and we do not follow this
			const params = doclet.params || doclet.properties;
			const obj = {
				name: doclet.name,
				kind: doclet.kind,
				display: doclet.longname,
				description: doclet.description,
				params: params && params.map(paramPropMapper),
				// I'm pretty sure this will always be an array of 1, but join
				// twice just to be safe. Also this will always be undefined
				// on events but DRY and it doesn't matter that much.
				returns: doclet.returns && doclet.returns.map(r => r.type.names.join(' | ')).join(', ')
			};
			// Find the class this method is attached to
			const classObj = classes.find(c => c.name === doclet.memberof);
			// Convert jsdoc reported kind to the appropriate method names defined above
			const category = (doclet.kind === 'function' ? 'methods' : 'events');
			if (classObj) {
				// Simply insert the new thing where it belongs
				classObj[category].push(obj);
			} else {
				// Create a placeholder classes object that will be merged
				// into the rest of the info when it's picked up (see above,
				// this may be too clever)
				classes.push({
					name: doclet.memberof,
					[category]: [obj]
				});
			}
			break;
		}
		// Other things we expicitly want to ignore
		case 'package': {
			break;
		}
		// If it's not identified, log a warning but ignore it
		default: {
			console.log('Warning: Unknown doclet kind:', doclet.kind);
		}
	}
}

console.log(`Loaded documentation for ${classes.length} classes`);
// debugging
// require('fs').writeFileSync('debug.json', JSON.stringify(classes, null, '\t'), 'utf8');

module.exports = classes;
