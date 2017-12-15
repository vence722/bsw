'use strict';

const {RpcServer} = require('../index');
const config = require('./config.json');
const rpc_handler = require('./rpc_handler');

(async () => {
	const rpc_server = new RpcServer({
		enable_logging: true,
		host: config.host,
		port: config.port,
		tube: config.tube,
		rpc_handler: rpc_handler
	});

	await rpc_server.start();
})().catch((e) => {
	console.log(e);
});
