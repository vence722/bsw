'use strict';

module.exports = async function (func_name, params, _job_info) {
	const {op1, op2} = params;

	if (func_name === 'add') {
		return op1 + op2;
	} else if (func_name === 'minus') {
		return op1 - op2;
	}

	return 0;
};
