"use strict";
/**
 * onAemProcComplete
 *
 * Used to filter all events down to just the asset events we want to evaluate.
 * After filtering we set state varibles to capture the AEM asset data.  We then request a presigned url for the target aem asset.
 * The last step is we kick off a asynchronous request to get the target assets psd manifest data
 *
 * we subscribe this action to the Assets processing complete event in Adobe IO developer console.
 *
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
exports.main = void 0;
var aio_lib_core_logging_1 = __importDefault(require("@adobe/aio-lib-core-logging"));
var aio_lib_state_1 = __importDefault(require("@adobe/aio-lib-state"));
var utils_1 = require("../utils");
var aemCscUtils_1 = require("../aemCscUtils");
var fireflyCscUtils_1 = require("../fireflyCscUtils");
// main function that will be executed by Adobe I/O Runtime
function main(params) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var logger, actionName_1, response_1, content_1, debuggerOutput, requiredParams, requiredHeaders, errorMessage, aemImageMetadata, aemAssetPath, aemRepoId, assetPresignedUrl, error_1, submitManifestRequestCallResults, error_2, psApiJobId, jobSecondaryData, stateJob, stateSave, error_3, response, error_4;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    logger = (0, aio_lib_core_logging_1.default)("main", { level: params.LOG_LEVEL || "info" });
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 18, , 19]);
                    // 'info' is the default level if not set
                    logger.info("Calling the on AEM proc complete action");
                    actionName_1 = "onAemProcComplete";
                    // handle IO webhook challenge
                    if (params.challenge) {
                        response_1 = {
                            statusCode: 200,
                            body: { challenge: params.challenge },
                        };
                        return [2 /*return*/, response_1];
                    }
                    content_1 = {};
                    if (params.LOG_LEVEL === "debug") {
                        if (typeof content_1.debug === "undefined") {
                            content_1.debug = {};
                            content_1.debug[actionName_1] = [];
                        }
                    }
                    debuggerOutput = function (message) {
                        var messageStr = typeof message === "string" ? message : JSON.stringify(message);
                        logger.debug(messageStr);
                        if (params.LOG_LEVEL === "debug") {
                            if (typeof message === "string") {
                                content_1.debug[actionName_1].push({ debugMessage: message });
                            }
                            else {
                                content_1.debug[actionName_1].push(message);
                            }
                        }
                    };
                    requiredParams = [];
                    requiredHeaders = [];
                    errorMessage = (0, utils_1.checkMissingRequestInputs)(params, requiredParams, requiredHeaders);
                    if (errorMessage) {
                        return [2 /*return*/, (0, utils_1.errorResponse)(400, errorMessage, logger)];
                    }
                    if (!(typeof ((_a = params.data) === null || _a === void 0 ? void 0 : _a.repositoryMetadata) !== "undefined" &&
                        params.data.repositoryMetadata["dc:format"] ===
                            "image/vnd.adobe.photoshop")) return [3 /*break*/, 16];
                    aemImageMetadata = params.data
                        .repositoryMetadata;
                    aemAssetPath = aemImageMetadata["repo:path"];
                    aemRepoId = aemImageMetadata["repo:repositoryId"];
                    if (typeof aemAssetPath === "undefined" ||
                        typeof aemRepoId === "undefined") {
                        logger.error("aemAssetPath or aemRepoId not found in metadata");
                        logger.debug(JSON.stringify(aemImageMetadata, null, 2));
                        return [2 /*return*/, (0, utils_1.errorResponse)(404, "asset repo or path not found in metadata", logger)];
                    }
                    assetPresignedUrl = void 0;
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    debuggerOutput("getting presigned url for https://".concat(aemRepoId).concat(aemAssetPath));
                    return [4 /*yield*/, (0, aemCscUtils_1.getAemAssetPresignedDownloadUrl)("https://".concat(aemRepoId), aemAssetPath, params, logger)];
                case 3:
                    // Get presigned url for the image from AEM
                    assetPresignedUrl = _c.sent();
                    debuggerOutput("GOT presigned url ".concat(assetPresignedUrl));
                    if (typeof assetPresignedUrl === "undefined") {
                        logger.error("presigned url pull failure");
                        return [2 /*return*/, (0, utils_1.errorResponse)(500, "presigned url generation failure", logger)];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _c.sent();
                    logger.error("presigned url pull failure ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    return [2 /*return*/, (0, utils_1.errorResponse)(500, "presigned url generation failure ".concat(error_1 instanceof Error ? error_1.message : String(error_1)), logger)];
                case 5:
                    submitManifestRequestCallResults = void 0;
                    _c.label = 6;
                case 6:
                    _c.trys.push([6, 9, , 10]);
                    debuggerOutput("onAemProcComplete:getPhotoshopManifestForPresignedUrl ".concat(assetPresignedUrl));
                    params.throwIoEvent = true; //throw an IO event for the manifest job completion
                    return [4 /*yield*/, (0, fireflyCscUtils_1.sleepCscRequest)(5000)];
                case 7:
                    _c.sent(); //sleep for 5 seconds to allow the presigned url to be active
                    return [4 /*yield*/, (0, fireflyCscUtils_1.getPhotoshopManifestForPresignedUrl)(assetPresignedUrl, params, logger)];
                case 8:
                    submitManifestRequestCallResults =
                        _c.sent();
                    if (submitManifestRequestCallResults === undefined ||
                        submitManifestRequestCallResults === null) {
                        logger.error("onAemProcComplete:getPhotoshopManifestForPresignedUrl failure");
                        return [2 /*return*/, (0, utils_1.errorResponse)(500, "onAemProcComplete:getPhotoshopManifestForPresignedUrl ", logger)];
                    }
                    debuggerOutput("onAemProcComplete:getPhotoshopManifestForPresignedUrl complete ".concat(submitManifestRequestCallResults["_links"].self.href));
                    debuggerOutput(JSON.stringify(submitManifestRequestCallResults, null, 2));
                    return [3 /*break*/, 10];
                case 9:
                    error_2 = _c.sent();
                    logger.error("getPhotoshopManifestForPresignedUrl failure");
                    logger.error(JSON.stringify(error_2));
                    return [2 /*return*/, (0, utils_1.errorResponse)(500, "getPhotoshopManifestForPresignedUrl failure", logger)];
                case 10:
                    psApiJobId = void 0;
                    try {
                        debuggerOutput("getting ps api job id from the submit for manifest ".concat(JSON.stringify(submitManifestRequestCallResults, null, 2)));
                        psApiJobId = submitManifestRequestCallResults["_links"].self.href
                            .split("/")
                            .pop();
                        debuggerOutput("onAemProcComplete:submitManifestRequestCallResults complete psApiJobId = ".concat(psApiJobId));
                    }
                    catch (error) {
                        logger.error("preSignedCallResults failure");
                        return [2 /*return*/, (0, utils_1.errorResponse)(500, "preSignedCallResults failure", logger)];
                    }
                    _c.label = 11;
                case 11:
                    _c.trys.push([11, 14, , 15]);
                    debuggerOutput("Setting state for the jobid ".concat(psApiJobId));
                    jobSecondaryData = {
                        aemHost: "https://".concat(aemRepoId),
                        aemAssetPath: aemAssetPath,
                        aemAssetPresignedDownloadPath: assetPresignedUrl,
                        aemAssetSize: aemImageMetadata["repo:size"] || 0,
                        aemAssetUuid: aemImageMetadata["repo:assetId"] || "",
                        aemAssetName: aemImageMetadata["repo:name"] || "",
                        aemAssetMetaData: aemImageMetadata,
                        processPassCount: 0,
                        processingComplete: false,
                        psApiJobId: psApiJobId,
                    };
                    return [4 /*yield*/, aio_lib_state_1.default.init()];
                case 12:
                    stateJob = _c.sent();
                    return [4 /*yield*/, stateJob.put(psApiJobId, JSON.stringify(jobSecondaryData), {
                            ttl: 18000,
                        })];
                case 13:
                    stateSave = _c.sent();
                    debuggerOutput("SET the state for the jobid ".concat(psApiJobId, " ").concat(stateSave));
                    content_1.jobData = jobSecondaryData;
                    content_1.jobId = psApiJobId;
                    return [3 /*break*/, 15];
                case 14:
                    error_3 = _c.sent();
                    logger.error("state save failure");
                    return [2 /*return*/, (0, utils_1.errorResponse)(500, "state save failure", logger)];
                case 15: return [3 /*break*/, 17];
                case 16:
                    if (typeof ((_b = params.data) === null || _b === void 0 ? void 0 : _b.repositoryMetadata) === "undefined") {
                        debuggerOutput("No repository metadata found");
                        content_1.status = "skipped - no metadata found";
                    }
                    else if (params.data.repositoryMetadata["dc:format"] !==
                        "image/vnd.adobe.photoshop") {
                        debuggerOutput("Not a psd file, skipping processing ".concat(params.data.repositoryMetadata["dc:format"]));
                        content_1.status = "skipped - not a PSD file: ".concat(params.data.repositoryMetadata["dc:format"]);
                    }
                    _c.label = 17;
                case 17:
                    response = {
                        statusCode: 200,
                        body: content_1,
                    };
                    return [2 /*return*/, response];
                case 18:
                    error_4 = _c.sent();
                    // log any server errors
                    logger.error(error_4 instanceof Error ? error_4.message : String(error_4));
                    // return with 500
                    return [2 /*return*/, (0, utils_1.errorResponse)(500, "server error", logger)];
                case 19: return [2 /*return*/];
            }
        });
    });
}
exports.main = main;
