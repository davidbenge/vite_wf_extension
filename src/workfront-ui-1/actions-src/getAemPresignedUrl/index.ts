/*
 * <license header>
 */

/**
 * This will expose a presigned url to map to an aem file
 */

import { errorResponse, checkMissingRequestInputs } from "../utils";
import { getAemAssetPresignedDownloadUrl } from "../aemCscUtils";
//import AioLogger from "@adobe/aio-lib-core-logging";

interface ActionParams {
  AEM_SERVICE_TECH_ACCOUNT_CLIENT_ID: string;
  AEM_SERVICE_TECH_ACCOUNT_ID: string;
  AEM_SERVICE_TECH_ACCOUNT_ORG_ID: string;
  AEM_SERVICE_TECH_ACCOUNT_CLIENT_SECRET: string;
  AEM_SERVICE_TECH_ACCOUNT_PRIVATE_KEY: string;
  AEM_SERVICE_TECH_ACCOUNT_META_SCOPES: string;
  LOG_LEVEL?: string;
  aemHost: string;
  aemAssetPath: string;
  [key: string]: any;
}


interface OutputContent {
  presignedUrl: string;
  aemHost: string;
  aemAssetPath: string;
}

interface ActionResponse {
  statusCode: number;
  body: OutputContent;
}

// main function that will be executed by Adobe I/O Runtime
async function main(params: ActionParams): Promise<ActionResponse> {
  // create a Logger
  const logger = require('@adobe/aio-lib-core-logging')("main", {
    level: params.LOG_LEVEL || "info",
  });

  try {
    // 'info' is the default level if not set
    logger.info("Calling the main action get-presigned-url");

    // log parameters, only if params.LOG_LEVEL === 'debug'
    //logger.debug(stringParameters(params))

    const outputContent: OutputContent = {
      presignedUrl: "",
      aemHost: "",
      aemAssetPath: "",
    };

    // check for missing request input parameters and headers
    const requiredParams = ["aemHost", "aemAssetPath"];
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

    // get presigned url
    const presignedUrl = await getAemAssetPresignedDownloadUrl(
      params.aemHost,
      params.aemAssetPath,
      params,
      logger,
    );

    outputContent.presignedUrl = presignedUrl;
    outputContent.aemHost = params.aemHost;
    outputContent.aemAssetPath = params.aemAssetPath;

    const response: ActionResponse = {
      statusCode: 200,
      body: outputContent,
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
