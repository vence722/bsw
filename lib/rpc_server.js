'use strict';

const _ = require('lodash');
const Consumer = require('./consumer');
const isAsyncFunc = require('is-async-func');

class RpcServer extends Consumer {
	constructor(config) {
		// due to limitation of JS class constructor, need to mock the handler here
		_.set(config, 'handler', async function () {
			return 0;
		});
		super(config);
		// set RPC handler which is an async function
		if (!config.rpc_handler || !isAsyncFunc(config.rpc_handler)) {
			throw new Error('config.rpc_handler must be specified as an async function!');
		}
		// wrap RPC handler as Consumer's handler
		_.set(this, 'handler', this._wrapRpcHandler(config.rpc_handler));
	}

	_wrapRpcHandler(rpc_handler) {
		const _this = this;
		return async function (payload, job_info) {
			let response;
			const {func_name, params, res_tube} = payload;
			try {
				const result = await rpc_handler(func_name, params, job_info);
				// wrap rpc result to response
				response = RpcServer._wrapRpcResponse(result);
			} catch (e) {
				// wrap error to response
				response = RpcServer._wrapRpcResponse(e, true);
			} finally {
				// use the response tube
				await _this.client.useAsync(res_tube);

				// put result to the response tube
				await _this.client.putAsync(0, 0, 300, JSON.stringify(response));
			}
		};
	}

	static _wrapRpcResponse(result, is_error) {
		const response = {};
		if (is_error) {
			response.error = result.toString();
		} else {
			response.result = result;
		}
		return response;
	}
}

module.exports = RpcServer;
