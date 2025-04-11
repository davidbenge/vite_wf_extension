"use strict";
/*
* <license header>
*/
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentInit = exports.checkMissingRequestInputs = exports.stringParameters = exports.getBearerToken = exports.errorResponse = void 0;
/**
 * Returns a log ready string of the action input parameters.
 * The `Authorization` header content will be replaced by '<hidden>'.
 *
 * @param {ActionParams} params action input parameters.
 *
 * @returns {string}
 */
function stringParameters(params) {
    // hide authorization token without overriding params
    var headers = params.__ow_headers || {};
    if (headers.authorization) {
        headers = __assign(__assign({}, headers), { authorization: '<hidden>' });
    }
    return JSON.stringify(__assign(__assign({}, params), { __ow_headers: headers }));
}
exports.stringParameters = stringParameters;
/**
 * Returns the list of missing keys giving an object and its required keys.
 * A parameter is missing if its value is undefined or ''.
 * A value of 0 or null is not considered as missing.
 *
 * @param {object} obj object to check.
 * @param {string[]} required list of required keys.
 *        Each element can be multi level deep using a '.' separator e.g. 'myRequiredObj.myRequiredKey'
 *
 * @returns {string[]}
 * @private
 */
function getMissingKeys(obj, required) {
    return required.filter(function (r) {
        var splits = r.split('.');
        var last = splits[splits.length - 1];
        var traverse = splits.slice(0, -1).reduce(function (tObj, split) {
            tObj = (tObj[split] || {});
            return tObj;
        }, obj);
        return traverse[last] === undefined || traverse[last] === ''; // missing default params are empty string
    });
}
/**
 * Returns the list of missing keys giving an object and its required keys.
 * A parameter is missing if its value is undefined or ''.
 * A value of 0 or null is not considered as missing.
 *
 * @param {ActionParams} params action input parameters.
 * @param {string[]} requiredHeaders list of required input headers.
 * @param {string[]} requiredParams list of required input parameters.
 *        Each element can be multi level deep using a '.' separator e.g. 'myRequiredObj.myRequiredKey'.
 *
 * @returns {string | null} if the return value is not null, then it holds an error message describing the missing inputs.
 */
function checkMissingRequestInputs(params, requiredParams, requiredHeaders) {
    if (requiredParams === void 0) { requiredParams = []; }
    if (requiredHeaders === void 0) { requiredHeaders = []; }
    var errorMessage = null;
    // input headers are always lowercase
    requiredHeaders = requiredHeaders.map(function (h) { return h.toLowerCase(); });
    // check for missing headers
    var missingHeaders = getMissingKeys(params.__ow_headers || {}, requiredHeaders);
    if (missingHeaders.length > 0) {
        errorMessage = "missing header(s) '".concat(missingHeaders, "'");
    }
    // check for missing parameters
    var missingParams = getMissingKeys(params, requiredParams);
    if (missingParams.length > 0) {
        if (errorMessage) {
            errorMessage += ' and ';
        }
        else {
            errorMessage = '';
        }
        errorMessage += "missing parameter(s) '".concat(missingParams, "'");
    }
    return errorMessage;
}
exports.checkMissingRequestInputs = checkMissingRequestInputs;
/**
 * Extracts the bearer token string from the Authorization header in the request parameters.
 *
 * @param {ActionParams} params action input parameters.
 *
 * @returns {string | undefined} the token string or undefined if not set in request headers.
 */
function getBearerToken(params) {
    if (params.__ow_headers &&
        params.__ow_headers.authorization &&
        params.__ow_headers.authorization.startsWith('Bearer ')) {
        return params.__ow_headers.authorization.substring('Bearer '.length);
    }
    return undefined;
}
exports.getBearerToken = getBearerToken;
/**
 * Returns an error response object and attempts to log.info the status code and error message
 *
 * @param {number} statusCode the error status code.
 *        e.g. 400
 * @param {string} message the error message.
 *        e.g. 'missing xyz parameter'
 * @param {Logger} [logger] an optional logger instance object with an `info` method
 *        e.g. `new require('@adobe/aio-sdk').Core.Logger('name')`
 *
 * @returns {ActionResponse} the error object, ready to be returned from the action main's function.
 */
function errorResponse(statusCode, message, logger) {
    if (logger && typeof logger.info === 'function') {
        logger.info("".concat(statusCode, ": ").concat(message));
    }
    return {
        statusCode: statusCode,
        body: {
            error: message
        }
    };
}
exports.errorResponse = errorResponse;
/**
 * Set default content
 */
function contentInit(params) {
    var content = {
        message: "success",
        status: "ok"
    };
    return content;
}
exports.contentInit = contentInit;
