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
exports.contentInit = exports.errorResponse = exports.getBearerToken = exports.checkMissingRequestInputs = exports.getMissingKeys = exports.stringParameters = void 0;
/**
 * Returns a log ready string of the action input parameters.
 * The `Authorization` header content will be replaced by '<hidden>'.
 *
 * @param {BaseActionParams} params action input parameters.
 *
 * @returns {string}
 */
function stringParameters(params) {
    // hide authorization token without overriding params
    var headers = params.__ow_headers || {};
    if (headers.authorization) {
        headers = __assign(__assign({}, headers), { authorization: "<hidden>" });
    }
    return JSON.stringify(__assign(__assign({}, params), { __ow_headers: headers }));
}
exports.stringParameters = stringParameters;
/**
 * Returns an array of missing keys from an object
 *
 * @param {Record<string, any>} obj The object to check
 * @param {string[]} required The required keys
 *
 * @returns {string[]} Array of missing keys
 */
function getMissingKeys(obj, required) {
    return required.filter(function (key) { return !(key in obj); });
}
exports.getMissingKeys = getMissingKeys;
/**
 * Checks for missing request input parameters and headers
 *
 * @param {BaseActionParams} params action input parameters
 * @param {string[]} requiredParams required parameters
 * @param {string[]} requiredHeaders required headers
 *
 * @returns {string | null} error message if missing, null if all present
 */
function checkMissingRequestInputs(params, requiredParams, requiredHeaders) {
    if (requiredParams === void 0) { requiredParams = []; }
    if (requiredHeaders === void 0) { requiredHeaders = []; }
    var missingParams = getMissingKeys(params, requiredParams);
    var missingHeaders = getMissingKeys(params.__ow_headers || {}, requiredHeaders);
    if (missingParams.length > 0 || missingHeaders.length > 0) {
        var missing = [];
        if (missingParams.length > 0) {
            missing.push("missing parameters: ".concat(missingParams.join(", ")));
        }
        if (missingHeaders.length > 0) {
            missing.push("missing headers: ".concat(missingHeaders.join(", ")));
        }
        return missing.join(" and ");
    }
    return null;
}
exports.checkMissingRequestInputs = checkMissingRequestInputs;
/**
 * Gets the bearer token from the request headers
 *
 * @param {BaseActionParams} params action input parameters
 *
 * @returns {string | undefined} bearer token or undefined if not found
 */
function getBearerToken(params) {
    var _a;
    var authHeader = (_a = params.__ow_headers) === null || _a === void 0 ? void 0 : _a.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7);
    }
    return undefined;
}
exports.getBearerToken = getBearerToken;
/**
 * Returns an error response
 *
 * @param {number} statusCode HTTP status code
 * @param {string} message Error message
 * @param {Logger} [logger] Optional logger
 *
 * @returns {ActionResponse} Error response
 */
function errorResponse(statusCode, message, logger) {
    if (logger) {
        logger.error(message);
    }
    return {
        statusCode: statusCode,
        body: { error: message },
    };
}
exports.errorResponse = errorResponse;
/**
 * Initializes content response
 *
 * @param {BaseActionParams} params action input parameters
 *
 * @returns {ContentResponse} Initialized content response
 */
function contentInit(params) {
    return {
        message: "success",
        status: "ok",
    };
}
exports.contentInit = contentInit;
