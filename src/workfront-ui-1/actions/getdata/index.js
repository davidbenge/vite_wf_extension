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
exports.main = void 0;
var utils_1 = require("../utils");
var aio_lib_core_logging_1 = __importDefault(require("@adobe/aio-lib-core-logging"));
// main function that will be executed by Adobe I/O Runtime
function main(params) {
    return __awaiter(this, void 0, void 0, function () {
        var logger, actionName, requiredParams, requiredHeaders, errorMessage, content, response;
        return __generator(this, function (_a) {
            logger = (0, aio_lib_core_logging_1.default)("main", { level: params.LOG_LEVEL || "info" });
            actionName = "getData";
            try {
                // 'info' is the default level if not set
                logger.info("Calling the main action getAemAssetData");
                // log parameters, only if params.LOG_LEVEL === 'debug'
                logger.debug((0, utils_1.stringParameters)(params));
                requiredParams = [];
                requiredHeaders = [];
                errorMessage = (0, utils_1.checkMissingRequestInputs)(params, requiredParams, requiredHeaders);
                if (errorMessage) {
                    // return and log client errors
                    return [2 /*return*/, (0, utils_1.errorResponse)(400, errorMessage, logger)];
                }
                content = (0, utils_1.contentInit)(params);
                response = {
                    statusCode: 200,
                    body: content,
                };
                return [2 /*return*/, response];
            }
            catch (error) {
                // log any server errors
                logger.error(error instanceof Error ? error.message : String(error));
                // return with 500
                return [2 /*return*/, (0, utils_1.errorResponse)(500, "server error", logger)];
            }
            return [2 /*return*/];
        });
    });
}
exports.main = main;
