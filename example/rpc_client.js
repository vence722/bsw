'use strict';

const {RpcClient} = require('../index');
const config = require('./config.json');

(async () => {
	const rpc_client = new RpcClient({
		enable_logging: true,
		host: config.host,
		port: config.port,
		tube: config.tube
	});
	await rpc_client.start();

	const res1 = await rpc_client.call('add', {op1: 3, op2: 5});
	console.log(`res1: ${res1}`);

	const res2 = await rpc_client.call('minus', {op1: 12, op2: 5});
	console.log(`res2: ${res2}`);

	const res3 = await rpc_client.call('invalid function', {op1: 12, op2: 5});
	console.log(`res2: ${res3}`);

	const res4 = await rpc_client.call('add', {key: 'invalid'});
	console.log(`res2: ${res4}`);

	await rpc_client.stop();
})().catch((e) => {
	console.log(e);
});
