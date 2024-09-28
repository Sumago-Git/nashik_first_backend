exports.successResponse = function (res, msg) {
	var resData = {
		result: true,
		message: msg
	};
	return res.status(200).json(resData);
};

exports.successResponseWithData = function (res, msg, data) {
	var resData = {
		result: true,
		message: msg,
		responseData: data
	};
	return res.status(200).json(resData);
};

exports.ErrorResponse = function (res, msg) {
	var resData = {
		result: false,
		message: msg,
	};
	return res.status(500).json(resData);
};
exports.ErrorResponseWithData = function (res, msg,data) {
	var resData = {
		result: false,
		message: msg,
		responseData: data
	};
	return res.status(500).json(resData);
};
exports.ErrorBadRequestResponseWithData = function (res, msg,data) {
	var resData = {
		result: false,
		message: msg,
		responseData: data
	};
	return res.status(400).json(resData);
};
exports.notFoundResponse = function (res, msg) {
	var resData = {
		result: false,
		message: msg,
	};
	return res.status(404).json(resData);
};

exports.validationErrorWithData = function (res, msg, data) {
	var resData = {
		result: false,
		message: msg,
		responseData: data
	};
	return res.status(400).json(resData);
};

exports.unauthorizedResponse = function (res, msg) {
	var data = {
		result: false,
		message: msg,
	};
	return res.status(401).json(data);
};