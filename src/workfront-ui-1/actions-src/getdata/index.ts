/*
 * <license header>
 */

/**
 * This is a sample action showcasing how to access an external API
 *
 * Note:
 * You might want to disable authentication and authorization checks against Adobe Identity Management System for a generic action. In that case:
 *   - Remove the require-adobe-auth annotation for this action in the manifest.yml of your application
 *   - Remove the Authorization header from the array passed in checkMissingRequestInputs
 *   - The two steps above imply that every client knowing the URL to this deployed action will be able to invoke it without any authentication and authorization checks against Adobe Identity Management System
 *   - Make sure to validate these changes against your security requirements before deploying the action
 *   - you can find the url to this action with command `aio app get-url
 */

import fetch from "node-fetch";
import {
  errorResponse,
  getBearerToken,
  stringParameters,
  checkMissingRequestInputs,
  contentInit,
} from "../utils";
import AioLogger from "@adobe/aio-lib-core-logging";

interface ActionParams {
  LOG_LEVEL?: string;
  [key: string]: any;
}

interface ActionResponse {
  statusCode: number;
  body: any;
}

// main function that will be executed by Adobe I/O Runtime
async function main(params: ActionParams): Promise<ActionResponse> {
  // create a Logger
  const logger = AioLogger("main", { level: params.LOG_LEVEL || "info" });

  const actionName = "getData";
  try {
    // 'info' is the default level if not set
    logger.info("Calling the main action getAemAssetData");

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params));

    // check for missing request input parameters and headers
    const requiredParams: string[] = [];
    const requiredHeaders: string[] = [];
    const errorMessage = checkMissingRequestInputs(
      params,
      requiredParams,
      requiredHeaders,
    );
    if (errorMessage) {
      // return and log client errors
      return errorResponse(400, errorMessage, logger);
    }
    const content = contentInit(params);

    // TODO: get data from somewhere

    const response: ActionResponse = {
      statusCode: 200,
      body: content,
    };

    return response;
  } catch (error: unknown) {
    // log any server errors
    logger.error(error instanceof Error ? error.message : String(error));
    // return with 500
    return errorResponse(500, "server error", logger);
  }
}

export { main };
