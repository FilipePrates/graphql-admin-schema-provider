const fs = require("fs");
const path = require("path");

let typeDefs = "";
let mutations = "";
let queries = "";
let subscriptions = "";
const dirname = path.join(__dirname, "./types/");

export const mergeTypeDefs = () => {
	const filenames = fs.readdirSync(dirname);

	filenames.forEach((filename) => {
		let content = fs.readFileSync(dirname + filename, "utf-8");

		concatMutations(content);
		concatQueries(content);
		concatSubscriptions(content);

		content = removeMutationsQueriesAndSubscriptions(content);
		typeDefs += content;
	});

	typeDefs += mergeMutationsQueriesAndSubscriptions(typeDefs);

	return typeDefs;
};

const concatMutations = (typeDef) => {
	const re = /(?<=Mutation\s*\{)(.*?[\s\S]*?)(?=\n\}\n|\r\n\}\r\n)/g;
	const mutationsInTypeDef = typeDef.match(re);

	if (mutationsInTypeDef && mutationsInTypeDef.length > 0) {
		mutations = mutations.concat(...mutationsInTypeDef);
	}
};

const concatQueries = (typeDef) => {
	const re = /(?<=Query\s*\{)(.*?[\s\S]*?)(?=\n\}\n|\r\n\}\r\n)/g;
	const queriesInTypeDef = typeDef.match(re);

	if (queriesInTypeDef && queriesInTypeDef.length > 0) {
		queries = queries.concat(...queriesInTypeDef);
	}
};

const concatSubscriptions = (typeDef) => {
	const re = /(?<=Subscription\s*\{)(.*?[\s\S]*?)(?=\n\}\n|\n\}\n|\r\n\}\r\n)/g;
	const subscriptionsInTypeDef = typeDef.match(re);

	if (subscriptionsInTypeDef && subscriptionsInTypeDef.length > 0) {
		subscriptions = subscriptions.concat(...subscriptionsInTypeDef);
	}
};

const removeMutationsQueriesAndSubscriptions = (typeDef) => {
	const reMutations = /type\s*Mutation\s*\{(.*?[\s\S]*?)(\n\}\n|\r\n\}\r\n)/g;
	const reQueries = /type\s*Query\s*\{(.*?[\s\S]*?)(\n\}\n|\r\n\}\r\n)/g;
	const reSubscriptions = /type\s*Subscription\s*\{(.*?[\s\S]*?)(\n\}\n|\r\n\}\r\n)/g;

	let newTypeDef = typeDef.replaceAll(reMutations, "");
	newTypeDef = newTypeDef.replaceAll(reQueries, "");
	newTypeDef = newTypeDef.replaceAll(reSubscriptions, "");
	return newTypeDef;
};

const mergeMutationsQueriesAndSubscriptions = (typeDef) => {
	if (mutations.length > 0) {
		typeDef += `\r\n\r\ntype Mutation {\r\n${mutations}\r\n}`;
	}
	if (queries.length > 0) {
		typeDef += `\r\n\r\ntype Query {\r\n${queries}\r\n}`;
	}
	if (subscriptions.length > 0) {
		typeDef += `\r\n\r\ntype Subscription {\r\n${subscriptions}\r\n}`;
	}

	return typeDef;
};
