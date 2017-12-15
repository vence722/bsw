'use strict';

const _ = require('lodash');
const moment = require('moment');
const uuid = require('uuid/v4');
const Producer = require('./producer');

/**
 * Beanstalk job producer class with RPC feature
 */
class RpcClient extends Producer {
	async call(func_name, params, options) {
		// beanstalk params
		const res_tube = _.get(options, 'response_tube', `res_${this.tube}_${uuid()}`);
		const priority = _.get(options, 'priority');
		const delay = _.get(options, 'delay');
		const ttr = _.get(options, 'ttr');
		// RPC params
		const rpc_timeout = _.get(options, 'rpc_timeout', 10 * 1000);
		const rpc_reserve_timeout = _.get(options, 'rpc_reserve_timeout', 100);

		// send RPC request
		await super.putJob({
			payload: JSON.stringify({
				func_name: func_name,
				params: params,
				res_tube: res_tube
			}),
			priority: priority,
			delay: delay,
			ttr: ttr
		});

		// watch the response tube
		await this.client.watchAsync(res_tube);
		this.log(`watched ${res_tube} tube`);

		// wait for response
		const result = await this._waitForResponse(res_tube, rpc_timeout, rpc_reserve_timeout);
		return result;
	}

	async _waitForResponse(res_tube, rpc_timeout, rpc_reserve_timeout) {
		let res_job;
		// timeout deadline
		const deadline = moment.utc().valueOf() + rpc_timeout;
		while (this.connected && moment.utc().valueOf() < deadline) {
			try {
				res_job = await this.client.reserve_with_timeoutAsync(rpc_reserve_timeout);
				break;
			} catch (reserve_error) {
				// reserve timeout
				continue;
			}
		}
		const [job_id, job_payload] = res_job;
		// delete job
		await this.client.destroyAsync(job_id);
		// set result as payload
		return job_payload;
	}
}

module.exports = RpcClient;
