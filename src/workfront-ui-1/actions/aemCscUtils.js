"use strict";
/*
 * <license header>
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAemAuth = exports.writeCommentToAsset = exports.writeRenditionToAsset = exports.getAemAssetPresignedDownloadUrl = exports.getAemAssetDataRapi = exports.getAemAssetData = exports.getAemServiceAccountToken = void 0;
/* This file exposes some common CSC related utilities for your actions */
var utils_1 = require("./utils");
var aio_lib_state_1 = __importDefault(require("@adobe/aio-lib-state"));
var openwhisk_1 = __importDefault(require("openwhisk"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var form_data_1 = __importDefault(require("form-data"));
/***
 * Get aem service account token
 *
 * @param {ActionParams} params action input parameters.
 * @param {Logger} logger logger object
 *
 * @returns {Promise<string>} aemAuthToken
 */
function getAemServiceAccountToken(params, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var ow, aemAuthToken, state, stateAuth, invokeParams, invokeResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ow = (0, openwhisk_1.default)();
                    return [4 /*yield*/, aio_lib_state_1.default.init()];
                case 1:
                    state = _a.sent();
                    return [4 /*yield*/, state.get("aem-auth-key")];
                case 2:
                    stateAuth = (_a.sent());
                    logger.debug("getAemServiceAccountToken passed state key");
                    if (!(typeof stateAuth === "undefined" ||
                        typeof stateAuth.value === "undefined" ||
                        stateAuth.value === null)) return [3 /*break*/, 7];
                    invokeParams = {
                        client_id: params.AEM_SERVICE_TECH_ACCOUNT_CLIENT_ID,
                        technical_account_id: params.AEM_SERVICE_TECH_ACCOUNT_ID,
                        org_id: params.AEM_SERVICE_TECH_ACCOUNT_ORG_ID,
                        client_secret: params.AEM_SERVICE_TECH_ACCOUNT_CLIENT_SECRET,
                        private_key: params.AEM_SERVICE_TECH_ACCOUNT_PRIVATE_KEY,
                        meta_scopes: params.AEM_SERVICE_TECH_ACCOUNT_META_SCOPES,
                        private_key_base64: true,
                    };
                    logger.debug("dx-excshell-1/get-auth invoke");
                    return [4 /*yield*/, ow.actions.invoke({
                            name: "dx-excshell-1/get-auth",
                            blocking: true,
                            result: true,
                            params: invokeParams,
                        })];
                case 3:
                    invokeResult = (_a.sent());
                    logger.debug("dx-excshell-1/get-auth invokeResult: " + JSON.stringify(invokeResult));
                    if (!(typeof invokeResult.body !== "undefined" &&
                        typeof invokeResult.body.access_token !== "undefined")) return [3 /*break*/, 5];
                    // if not reqeust a new one and put it in the store
                    aemAuthToken = invokeResult.body.access_token;
                    return [4 /*yield*/, state.put("aem-auth-key", aemAuthToken, { ttl: 79200 })];
                case 4:
                    _a.sent(); // -1 for max expiry (365 days), defaults to 86400 (24 hours) 79200 is 22 hours
                    return [3 /*break*/, 6];
                case 5:
                    logger.error("Failed to get AEM auth token");
                    throw new Error("Failed to get AEM auth token");
                case 6: return [3 /*break*/, 8];
                case 7:
                    logger.debug("getAemServiceAccountToken found a GOOD state key");
                    aemAuthToken = stateAuth.value;
                    _a.label = 8;
                case 8: return [2 /*return*/, aemAuthToken];
            }
        });
    });
}
exports.getAemServiceAccountToken = getAemServiceAccountToken;
/***
 * Get aem asset data
 *
 * @param {string} aemHost aem host
 * @param {string} aemAssetPath aem asset path
 * @param {ActionParams} params action input parameters.
 * @param {Logger} logger logger object
 *
 * @returns {Promise<any>} resultData
 */
function getAemAssetData(aemHost, aemAssetPath, params, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var fetchUrl, aemAuthToken, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchUrl = aemHost + aemAssetPath + ".3.json";
                    return [4 /*yield*/, getAemAuth(params, logger)];
                case 1:
                    aemAuthToken = _a.sent();
                    return [4 /*yield*/, (0, node_fetch_1.default)(fetchUrl, {
                            method: "get",
                            headers: {
                                Authorization: "Bearer " + aemAuthToken,
                                "Content-Type": "application/json",
                            },
                        })];
                case 2:
                    res = _a.sent();
                    if (!!res.ok) return [3 /*break*/, 3];
                    throw new Error("request to " + fetchUrl + " failed with status code " + res.status);
                case 3: return [4 /*yield*/, res.json()];
                case 4: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getAemAssetData = getAemAssetData;
/***
 * Get AEM Asset data from repo
 *
 * @param {string} aemHost aem host
 * @param {string} aemAssetPath aem asset path
 * @param {ActionParams} params action input parameters.
 * @param {Logger} logger logger object
 *
 * @returns {Promise<any>} resultData
 */
function getAemAssetDataRapi(aemHost, aemAssetPath, params, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var fetchUrl, aemAuthToken, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchUrl = "".concat(aemHost, "/adobe/repository?path=").concat(aemAssetPath);
                    return [4 /*yield*/, getAemAuth(params, logger)];
                case 1:
                    aemAuthToken = _a.sent();
                    return [4 /*yield*/, (0, node_fetch_1.default)(fetchUrl, {
                            method: "get",
                            headers: {
                                Authorization: "Bearer " + aemAuthToken,
                                "Content-Type": "application/json",
                                "x-api-key": params.AEM_SERVICE_TECH_ACCOUNT_CLIENT_ID,
                            },
                        })];
                case 2:
                    res = _a.sent();
                    if (!!res.ok) return [3 /*break*/, 3];
                    throw new Error("getAemAssetDataRapi request to " +
                        fetchUrl +
                        " failed with status code " +
                        res.status);
                case 3: return [4 /*yield*/, res.json()];
                case 4: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getAemAssetDataRapi = getAemAssetDataRapi;
/***
 * Get AEM Asset presigned url
 *
 * @param {string} aemHost aem host
 * @param {string} aemAssetPath aem asset path
 * @param {ActionParams} params action input parameters.
 * @param {Logger} logger logger object
 *
 * @returns {Promise<string>} presigned dowload url
 */
function getAemAssetPresignedDownloadUrl(aemHost, aemAssetPath, params, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var assetRepoData, error_1, fetchUrl, aemAuthToken, res, jsonResponse, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    logger.debug("getAemAssetPresignedDownloadUrl:getAemAssetDataRapi ".concat(aemHost).concat(aemAssetPath));
                    return [4 /*yield*/, getAemAssetDataRapi(aemHost, aemAssetPath, params, logger)];
                case 1:
                    assetRepoData = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    logger.error("getAemAssetPresignedDownloadUrl:getAemAssetDataRapi request to ".concat(aemHost).concat(aemAssetPath, " failed with error ").concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    throw new Error("getAemAssetPresignedDownloadUrl:getAemAssetDataRapi request to ".concat(aemHost).concat(aemAssetPath, " failed with error ").concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                case 3:
                    fetchUrl = assetRepoData["_links"]["http://ns.adobe.com/adobecloud/rel/download"].href;
                    return [4 /*yield*/, getAemAuth(params, logger)];
                case 4:
                    aemAuthToken = _a.sent();
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 10, , 11]);
                    return [4 /*yield*/, (0, node_fetch_1.default)(fetchUrl, {
                            method: "get",
                            headers: {
                                Authorization: "Bearer " + aemAuthToken,
                                "Content-Type": "application/json",
                                "x-api-key": params.AEM_SERVICE_TECH_ACCOUNT_CLIENT_ID,
                            },
                        })];
                case 6:
                    res = _a.sent();
                    if (!!res.ok) return [3 /*break*/, 7];
                    throw new Error("getAemAssetPresignedDownloadUrl:getAemAssetDataRapi request to " +
                        fetchUrl +
                        " failed with status code " +
                        res.status);
                case 7: return [4 /*yield*/, res.json()];
                case 8:
                    jsonResponse = _a.sent();
                    logger.debug("getAemAssetPresignedDownloadUrl:getAemAssetDataRapi ".concat(JSON.stringify(jsonResponse, null, 2)));
                    return [2 /*return*/, jsonResponse.href];
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_2 = _a.sent();
                    logger.error("getAemAssetPresignedDownloadUrl:fetch presigned request to ".concat(aemHost).concat(aemAssetPath, " failed with error ").concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                    throw new Error("getAemAssetPresignedDownloadUrl:fetch presigned request to ".concat(aemHost).concat(aemAssetPath, " failed with error ").concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                case 11: return [2 /*return*/];
            }
        });
    });
}
exports.getAemAssetPresignedDownloadUrl = getAemAssetPresignedDownloadUrl;
/****
 * Write rendition to asset
 */
function writeRenditionToAsset(aemHost, aemAssetPath, fileBinary, fileMimeType, params, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var fetchUrl, aemAuthToken, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    aemAssetPath = aemAssetPath.replace("/content/dam", "/api/assets");
                    if (aemAssetPath.indexOf("/api/assets") < 0) {
                        aemAssetPath = "/api/assets" + aemAssetPath;
                    }
                    logger.debug("writeRenditionToAsset aemAssetPath: " + aemAssetPath);
                    fetchUrl = aemHost + aemAssetPath;
                    return [4 /*yield*/, getAemAuth(params, logger)];
                case 1:
                    aemAuthToken = _a.sent();
                    return [4 /*yield*/, (0, node_fetch_1.default)(fetchUrl, {
                            method: "POST",
                            headers: {
                                Authorization: "Bearer " + aemAuthToken,
                                "Content-Type": fileMimeType,
                            },
                            body: fileBinary,
                        })];
                case 2:
                    res = _a.sent();
                    if (!!res.ok) return [3 /*break*/, 3];
                    throw new Error("request to " + fetchUrl + " failed with status code " + res.status);
                case 3: return [4 /*yield*/, res.json()];
                case 4: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.writeRenditionToAsset = writeRenditionToAsset;
/***
 * Write comment to asset
 *
 * @param {string} aemHost aem host
 * @param {string} aemAssetPath aem asset path
 * @param {string} comment comment to write
 * @param {object} annotations annotations to write or empty object {} if none
 * @param {ActionParams} params action input parameters.
 * @param {Logger} logger logger object
 *
 * @returns {Promise<any>} resultData
 */
function writeCommentToAsset(aemHost, aemAssetPath, comment, annotations, params, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var form, fetchUrl, aemAuthToken, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    aemAssetPath = aemAssetPath.replace("/content/dam", "/api/assets");
                    if (aemAssetPath.indexOf("/api/assets") < 0) {
                        aemAssetPath = "/api/assets" + aemAssetPath;
                    }
                    aemAssetPath = aemAssetPath + "/comments/*";
                    logger.debug("writeCommentToAsset aemAssetPath path is : " +
                        aemAssetPath +
                        " we are starting the form build");
                    form = new form_data_1.default();
                    form.append("message", comment);
                    fetchUrl = aemHost + aemAssetPath;
                    logger.debug("writeCommentToAsset fetchUrl: " + fetchUrl);
                    return [4 /*yield*/, getAemAuth(params, logger)];
                case 1:
                    aemAuthToken = _a.sent();
                    return [4 /*yield*/, (0, node_fetch_1.default)(fetchUrl, {
                            method: "POST",
                            headers: {
                                Authorization: "Bearer " + aemAuthToken,
                            },
                            body: form,
                        })];
                case 2:
                    res = _a.sent();
                    logger.debug("writeCommentToAsset res: " + JSON.stringify(res));
                    if (!!res.ok) return [3 /*break*/, 3];
                    throw new Error("request to " +
                        fetchUrl +
                        " writeCommentToAsset failed with status code " +
                        res.status);
                case 3: return [4 /*yield*/, res.json()];
                case 4: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.writeCommentToAsset = writeCommentToAsset;
/***
 * Get AEM auth token
 *
 * @param {ActionParams} params action input parameters.
 * @param {Logger} logger logger object
 *
 * @returns {Promise<string>} aemAuthToken
 */
function getAemAuth(params, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var aemAuthToken;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    aemAuthToken = (0, utils_1.getBearerToken)(params);
                    if (!!aemAuthToken) return [3 /*break*/, 2];
                    return [4 /*yield*/, getAemServiceAccountToken(params, logger)];
                case 1:
                    aemAuthToken = _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, aemAuthToken];
            }
        });
    });
}
exports.getAemAuth = getAemAuth;
