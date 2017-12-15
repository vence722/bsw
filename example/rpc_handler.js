'use strict';

module.exports = async function (func_name, params, _job_info) {
	const {op1, op2} = params;

	if (!Number.isFinite(op1) || !Number.isFinite(op2)) {
		throw new Error('both operators should be numbers');
	}

	if (func_name === 'add') {
		return op1 + op2;
	} else if (func_name === 'minus') {
		return op1 - op2;
	}

	throw new Error('function not supported');
};
