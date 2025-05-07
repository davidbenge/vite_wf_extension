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
exports.sleepCscRequest = exports.getFireflyServicesServiceAccountToken = exports.getPhotoshopManifestForPresignedUrl = exports.getFireflyServicesAuth = void 0;
/* This file exposes some common CSC related utilities for your actions */
var utils_1 = require("./utils");
var aio_lib_state_1 = __importDefault(require("@adobe/aio-lib-state"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var axios_1 = __importDefault(require("axios"));
/**
 * Get Firefly services service account token
 *
 * @param {ActionParams} params action input parameters.
 * @param {Logger} logger logger object
 *
 * @returns {Promise<string>} fireflyApiAuthToken
 */
function getFireflyServicesServiceAccountToken(params, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var authToken, state, stateAuth, formBody, fetchUrl, rec, responseContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    //ff auth key from cache
                    logger.debug("getFireflyServicesServiceAccountToken getting token from state");
                    return [4 /*yield*/, aio_lib_state_1.default.init()];
                case 1:
                    state = _a.sent();
                    return [4 /*yield*/, state.get("firefly-service-auth-key")];
                case 2:
                    stateAuth = (_a.sent());
                    if (!(typeof stateAuth === "undefined" ||
                        typeof stateAuth.value === "undefined" ||
                        stateAuth.value === null)) return [3 /*break*/, 8];
                    formBody = new URLSearchParams({
                        client_id: params.FIREFLY_SERVICES_CLIENT_ID,
                        client_secret: params.FIREFLY_SERVICES_CLIENT_SECRET,
                        grant_type: "client_credentials",
                        scope: params.FIREFLY_SERVICES_SCOPES,
                    });
                    logger.debug("getFireflyServicesServiceAccountToken no existing token in state");
                    fetchUrl = "https://ims-na1.adobelogin.com/ims/token/v3";
                    return [4 /*yield*/, (0, node_fetch_1.default)(fetchUrl, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                                Accept: "application/json",
                            },
                            body: formBody,
                        })];
                case 3:
                    rec = _a.sent();
                    logger.debug("getFireflyServicesServiceAccountToken made call to service ".concat(fetchUrl, " ").concat(JSON.stringify(rec, null, 2)));
                    if (!rec.ok) return [3 /*break*/, 6];
                    return [4 /*yield*/, rec.json()];
                case 4:
                    responseContent = (_a.sent());
                    // if not reqeust a new one and put it in the store
                    logger.debug("getFireflyServicesServiceAccountToken got new one from service and saving to state ".concat(JSON.stringify(responseContent, null, 2)));
                    authToken = responseContent.access_token;
                    return [4 /*yield*/, state.put("firefly-service-auth-key", authToken, { ttl: 79200 })];
                case 5:
                    _a.sent(); // -1 for max expiry (365 days), defaults to 86400 (24 hours) 79200 is 22 hours
                    return [2 /*return*/, authToken];
                case 6:
                    logger.debug("getFireflyServicesServiceAccountToken no new token from service error");
                    logger.debug(JSON.stringify(rec, null, 2));
                    logger.error("Failed to get firefly services auth token");
                    throw new Error("request to " + fetchUrl + " failed with status code " + rec.status);
                case 7: return [3 /*break*/, 9];
                case 8:
                    logger.debug("getFireflyServicesServiceAccountToken GOOD existing token from state");
                    return [2 /*return*/, stateAuth.value];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.getFireflyServicesServiceAccountToken = getFireflyServicesServiceAccountToken;
/****
 * Get Firefly services auth from right place
 *
 * @param {ActionParams} params action input parameters
 * @param {Logger} logger logger object
 *
 * @returns {Promise<string>} fireflyApiAuthToken
 */
function getFireflyServicesAuth(params, logger) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.debug("getFireflyServicesAuth");
                    if (!(params.FIREFLY_SERVICES_USE_PASSED_AUTH === "true")) return [3 /*break*/, 1];
                    logger.debug("getFireflyServicesAuth Bearer Token");
                    return [2 /*return*/, (0, utils_1.getBearerToken)(params)];
                case 1:
                    logger.debug("getFireflyServicesAuth getting new token from state or service");
                    return [4 /*yield*/, getFireflyServicesServiceAccountToken(params, logger)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getFireflyServicesAuth = getFireflyServicesAuth;
/***
 * Get photoshop manifest
 * will fire IO Event when complete
 *
 * @param {string} targetAssetPresignedUrl presigned url to the photoshop file
 * @param {ActionParams} params action input parameters
 * @param {Logger} logger logger object
 *
 * @returns {Promise<PhotoshopManifestResponse>} manifest data
 */
function getPhotoshopManifestForPresignedUrl(targetAssetPresignedUrl, params, logger) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var fetchUrl, fireflyApiAuth, psApiManifestBody, callHeaders, config, response, error_1, axiosError, axiosError;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    logger.debug("in getPhotoshopManifestForPresignedUrl");
                    logger.debug(JSON.stringify(params, null, 2));
                    logger.debug("in getPhotoshopManifestForPresignedUrl before getFireflyServicesAuth ");
                    fetchUrl = "https://image.adobe.io/pie/psdService/documentManifest";
                    return [4 /*yield*/, getFireflyServicesAuth(params, logger)];
                case 1:
                    fireflyApiAuth = _d.sent();
                    psApiManifestBody = {
                        inputs: [
                            {
                                href: targetAssetPresignedUrl,
                                storage: "external",
                            },
                        ],
                    };
                    callHeaders = {
                        Authorization: "Bearer ".concat(fireflyApiAuth),
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "x-api-key": params.FIREFLY_SERVICES_CLIENT_ID,
                    };
                    if (typeof params.throwIoEvent !== "undefined" &&
                        (params.throwIoEvent === "true" || params.throwIoEvent === true)) {
                        callHeaders["x-gw-ims-org-id"] = params.FIREFLY_SERVICES_ORG_ID;
                    }
                    config = {
                        method: "POST",
                        url: fetchUrl,
                        headers: callHeaders,
                        data: psApiManifestBody,
                    };
                    logger.debug("fireflyCscUtils:getPhotoshopManifest before fetch with this call config");
                    logger.debug(JSON.stringify(config, null, 2));
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, axios_1.default.request(config)];
                case 3:
                    response = _d.sent();
                    logger.debug("in getPhotoshopManifestForPresignedUrl was successful ".concat(JSON.stringify(response.data, null, 2)));
                    return [2 /*return*/, response.data];
                case 4:
                    error_1 = _d.sent();
                    logger.error("request to ".concat(fetchUrl, " failed ").concat(JSON.stringify(error_1, null, 2)));
                    if (error_1 && typeof error_1 === 'object' && 'response' in error_1) {
                        axiosError = error_1;
                        logger.error("error.response.data ".concat((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.data));
                        logger.error("error.response.status ".concat((_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.status));
                        logger.error("error.response.headers ".concat((_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.headers));
                    }
                    else if (error_1 && typeof error_1 === 'object' && 'request' in error_1) {
                        axiosError = error_1;
                        logger.error("error.request ".concat(axiosError.request));
                    }
                    else {
                        logger.error("request to ".concat(fetchUrl, " failed ").concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    }
                    throw new Error("request to ".concat(fetchUrl, " failed ").concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getPhotoshopManifestForPresignedUrl = getPhotoshopManifestForPresignedUrl;
function sleepCscRequest(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}
exports.sleepCscRequest = sleepCscRequest;
