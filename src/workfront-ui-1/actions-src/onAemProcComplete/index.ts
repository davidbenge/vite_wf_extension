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

import aioLogger from "@adobe/aio-lib-core-logging";
import stateLib from "@adobe/aio-lib-state";
import { errorResponse, checkMissingRequestInputs } from "../utils";
import { getAemAssetPresignedDownloadUrl } from "../aemCscUtils";
import {
  getPhotoshopManifestForPresignedUrl,
  sleepCscRequest,
} from "../fireflyCscUtils";
import {
  CombinedActionParams,
  JobSecondaryData,
  ResponseContent,
  ActionResponse,
  RepositoryMetadata
} from "../types";

// main function that will be executed by Adobe I/O Runtime
async function main(params: CombinedActionParams): Promise<ActionResponse> {
  // create a Logger
  const logger = aioLogger("main", {level: params.LOG_LEVEL || "info"});

  try {
    // 'info' is the default level if not set
    logger.info("Calling the on AEM proc complete action");
    const actionName = "onAemProcComplete";

    // handle IO webhook challenge
    if (params.challenge) {
      const response: ActionResponse = {
        statusCode: 200,
        body: { challenge: params.challenge },
      };
      return response;
    }

    let content: ResponseContent = {};
    if (params.LOG_LEVEL === "debug") {
      if (typeof content.debug === "undefined") {
        content.debug = {};
        content.debug[actionName] = [];
      }
    }

    const debuggerOutput = (message: string | Record<string, any>) => {
      const messageStr =
        typeof message === "string" ? message : JSON.stringify(message);
      logger.debug(messageStr);
      if (params.LOG_LEVEL === "debug") {
        if (typeof message === "string") {
          content.debug![actionName].push({ debugMessage: message });
        } else {
          content.debug![actionName].push(message);
        }
      }
    };

    // check for missing request input parameters and headers
    const requiredParams: string[] = [];
    const requiredHeaders: string[] = [];
    const errorMessage = checkMissingRequestInputs(
      params,
      requiredParams,
      requiredHeaders,
    );
    if (errorMessage) {
      return errorResponse(400, errorMessage, logger);
    }

    //IF not PSD skip
    if (
      typeof params.data?.repositoryMetadata !== "undefined" &&
      params.data.repositoryMetadata["dc:format"] ===
        "image/vnd.adobe.photoshop"
    ) {
      const aemImageMetadata = params.data
        .repositoryMetadata as RepositoryMetadata;

      // get the aem asset path and repo id for next steps
      const aemAssetPath = aemImageMetadata["repo:path"];
      const aemRepoId = aemImageMetadata["repo:repositoryId"];

      if (
        typeof aemAssetPath === "undefined" ||
        typeof aemRepoId === "undefined"
      ) {
        logger.error(`aemAssetPath or aemRepoId not found in metadata`);
        logger.debug(JSON.stringify(aemImageMetadata, null, 2));
        return errorResponse(
          404,
          "asset repo or path not found in metadata",
          logger,
        );
      }

      // Put in request to kick off metadat processing
      let assetPresignedUrl: string;
      try {
        debuggerOutput(
          `getting presigned url for https://${aemRepoId}${aemAssetPath}`,
        );
        // Get presigned url for the image from AEM
        assetPresignedUrl = await getAemAssetPresignedDownloadUrl(
          `https://${aemRepoId}`,
          aemAssetPath,
          params,
          logger,
        );
        debuggerOutput(`GOT presigned url ${assetPresignedUrl}`);

        if (typeof assetPresignedUrl === "undefined") {
          logger.error("presigned url pull failure");
          return errorResponse(500, "presigned url generation failure", logger);
        }
      } catch (error: unknown) {
        logger.error(`presigned url pull failure ${error instanceof Error ? error.message : String(error)}`);
        return errorResponse(
          500,
          `presigned url generation failure ${error instanceof Error ? error.message : String(error)}`,
          logger,
        );
      }

      let submitManifestRequestCallResults: Record<string, any>;
      try {
        debuggerOutput(
          `onAemProcComplete:getPhotoshopManifestForPresignedUrl ${assetPresignedUrl}`,
        );
        params.throwIoEvent = true; //throw an IO event for the manifest job completion
        await sleepCscRequest(5000); //sleep for 5 seconds to allow the presigned url to be active
        submitManifestRequestCallResults =
          await getPhotoshopManifestForPresignedUrl(
            assetPresignedUrl,
            params,
            logger,
          );

        if (
          submitManifestRequestCallResults === undefined ||
          submitManifestRequestCallResults === null
        ) {
          logger.error(
            "onAemProcComplete:getPhotoshopManifestForPresignedUrl failure",
          );
          return errorResponse(
            500,
            "onAemProcComplete:getPhotoshopManifestForPresignedUrl ",
            logger,
          );
        }
        debuggerOutput(
          `onAemProcComplete:getPhotoshopManifestForPresignedUrl complete ${submitManifestRequestCallResults["_links"].self.href}`,
        );
        debuggerOutput(
          JSON.stringify(submitManifestRequestCallResults, null, 2),
        );
      } catch (error) {
        logger.error("getPhotoshopManifestForPresignedUrl failure");
        logger.error(JSON.stringify(error));
        return errorResponse(
          500,
          "getPhotoshopManifestForPresignedUrl failure",
          logger,
        );
      }

      let psApiJobId: string;
      try {
        debuggerOutput(
          `getting ps api job id from the submit for manifest ${JSON.stringify(submitManifestRequestCallResults, null, 2)}`,
        );
        psApiJobId = submitManifestRequestCallResults["_links"].self.href
          .split("/")
          .pop();
        debuggerOutput(
          `onAemProcComplete:submitManifestRequestCallResults complete psApiJobId = ${psApiJobId}`,
        );
      } catch (error) {
        logger.error("preSignedCallResults failure");
        return errorResponse(500, "preSignedCallResults failure", logger);
      }

      try {
        debuggerOutput(`Setting state for the jobid ${psApiJobId}`);
        const jobSecondaryData: JobSecondaryData = {
          aemHost: `https://${aemRepoId}`,
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
        const stateJob = await stateLib.init();
        const stateSave = await stateJob.put(psApiJobId, JSON.stringify(jobSecondaryData), {
          ttl: 18000,
        }); //saved for 18 hours ish
        debuggerOutput(
          `SET the state for the jobid ${psApiJobId} ${stateSave}`,
        );

        content.jobData = jobSecondaryData;
        content.jobId = psApiJobId;
      } catch (error) {
        logger.error("state save failure");
        return errorResponse(500, "state save failure", logger);
      }
    } else {
      if (typeof params.data?.repositoryMetadata === "undefined") {
        debuggerOutput("No repository metadata found");
        content.status = "skipped - no metadata found";
      } else if (
        params.data.repositoryMetadata["dc:format"] !==
        "image/vnd.adobe.photoshop"
      ) {
        debuggerOutput(
          `Not a psd file, skipping processing ${params.data.repositoryMetadata["dc:format"]}`,
        );
        content.status = `skipped - not a PSD file: ${params.data.repositoryMetadata["dc:format"]}`;
      }
    }

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
