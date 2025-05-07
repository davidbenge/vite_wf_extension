/*
 * <license header>
 */

/* This file exposes some common CSC related utilities for your actions */
import { getBearerToken } from "./utils";
import stateLib from "@adobe/aio-lib-state";
import openwhisk from "openwhisk";
import fetch from "node-fetch";
import FormData from "form-data";
import axios from "axios";
import { AemActionParams, Logger, StateAuth, ActionResponse } from "./types";

interface ActionParams {
  AEM_SERVICE_TECH_ACCOUNT_CLIENT_ID: string;
  AEM_SERVICE_TECH_ACCOUNT_ID: string;
  AEM_SERVICE_TECH_ACCOUNT_ORG_ID: string;
  AEM_SERVICE_TECH_ACCOUNT_CLIENT_SECRET: string;
  AEM_SERVICE_TECH_ACCOUNT_PRIVATE_KEY: string;
  AEM_SERVICE_TECH_ACCOUNT_META_SCOPES: string;
  [key: string]: any;
}

interface InvokeParams {
  client_id: string;
  technical_account_id: string;
  org_id: string;
  client_secret: string;
  private_key: string;
  meta_scopes: string;
  private_key_base64: boolean;
}

interface InvokeResult {
  body?: {
    access_token?: string;
  };
}

interface AssetRepoData {
  _links: {
    "http://ns.adobe.com/adobecloud/rel/download": {
      href: string;
    };
  };
}

/***
 * Get aem service account token
 *
 * @param {ActionParams} params action input parameters.
 * @param {Logger} logger logger object
 *
 * @returns {Promise<string>} aemAuthToken
 */
async function getAemServiceAccountToken(
  params: ActionParams,
  logger: Logger,
): Promise<string> {
  const ow = openwhisk();

  //AEM auth key from cache
  let aemAuthToken: string;
  const state = await stateLib.init();
  const stateAuth = (await state.get("aem-auth-key")) as StateAuth;

  logger.debug("getAemServiceAccountToken passed state key");
  //get from store if it exists
  if (
    typeof stateAuth === "undefined" ||
    typeof stateAuth.value === "undefined" ||
    stateAuth.value === null
  ) {
    const invokeParams: InvokeParams = {
      client_id: params.AEM_SERVICE_TECH_ACCOUNT_CLIENT_ID,
      technical_account_id: params.AEM_SERVICE_TECH_ACCOUNT_ID,
      org_id: params.AEM_SERVICE_TECH_ACCOUNT_ORG_ID,
      client_secret: params.AEM_SERVICE_TECH_ACCOUNT_CLIENT_SECRET,
      private_key: params.AEM_SERVICE_TECH_ACCOUNT_PRIVATE_KEY,
      meta_scopes: params.AEM_SERVICE_TECH_ACCOUNT_META_SCOPES,
      private_key_base64: true,
    };

    logger.debug("dx-excshell-1/get-auth invoke");

    // call the other get-auth app builder action
    const invokeResult = (await ow.actions.invoke({
      name: "dx-excshell-1/get-auth",
      blocking: true,
      result: true,
      params: invokeParams,
    })) as InvokeResult;

    logger.debug(
      "dx-excshell-1/get-auth invokeResult: " + JSON.stringify(invokeResult),
    );

    if (
      typeof invokeResult.body !== "undefined" &&
      typeof invokeResult.body.access_token !== "undefined"
    ) {
      // if not reqeust a new one and put it in the store
      aemAuthToken = invokeResult.body.access_token;
      await state.put("aem-auth-key", aemAuthToken, { ttl: 79200 }); // -1 for max expiry (365 days), defaults to 86400 (24 hours) 79200 is 22 hours
    } else {
      logger.error("Failed to get AEM auth token");
      throw new Error("Failed to get AEM auth token");
    }
  } else {
    logger.debug("getAemServiceAccountToken found a GOOD state key");
    aemAuthToken = stateAuth.value;
  }

  return aemAuthToken;
}

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
async function getAemAssetData(
  aemHost: string,
  aemAssetPath: string,
  params: ActionParams,
  logger: Logger,
): Promise<any> {
  // fetch content from external api endpoint
  const fetchUrl = aemHost + aemAssetPath + ".3.json";
  const aemAuthToken = await getAemAuth(params, logger);

  const res = await fetch(fetchUrl, {
    method: "get",
    headers: {
      Authorization: "Bearer " + aemAuthToken,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(
      "request to " + fetchUrl + " failed with status code " + res.status,
    );
  } else {
    return await res.json();
  }
}

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
async function getAemAssetDataRapi(
  aemHost: string,
  aemAssetPath: string,
  params: ActionParams,
  logger: Logger,
): Promise<any> {
  const fetchUrl = `${aemHost}/adobe/repository?path=${aemAssetPath}`;
  const aemAuthToken = await getAemAuth(params, logger);

  const res = await fetch(fetchUrl, {
    method: "get",
    headers: {
      Authorization: "Bearer " + aemAuthToken,
      "Content-Type": "application/json",
      "x-api-key": params.AEM_SERVICE_TECH_ACCOUNT_CLIENT_ID,
    },
  });

  if (!res.ok) {
    throw new Error(
      "getAemAssetDataRapi request to " +
        fetchUrl +
        " failed with status code " +
        res.status,
    );
  } else {
    return await res.json();
  }
}

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
async function getAemAssetPresignedDownloadUrl(
  aemHost: string,
  aemAssetPath: string,
  params: ActionParams,
  logger: Logger,
): Promise<string> {
  // get repo data
  let assetRepoData: AssetRepoData;
  try {
    logger.debug(
      `getAemAssetPresignedDownloadUrl:getAemAssetDataRapi ${aemHost}${aemAssetPath}`,
    );
    assetRepoData = await getAemAssetDataRapi(
      aemHost,
      aemAssetPath,
      params,
      logger,
    );
  } catch (error: unknown) {
    logger.error(
      `getAemAssetPresignedDownloadUrl:getAemAssetDataRapi request to ${aemHost}${aemAssetPath} failed with error ${error instanceof Error ? error.message : String(error)}`,
    );
    throw new Error(
      `getAemAssetPresignedDownloadUrl:getAemAssetDataRapi request to ${aemHost}${aemAssetPath} failed with error ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  //get download link
  const fetchUrl =
    assetRepoData["_links"]["http://ns.adobe.com/adobecloud/rel/download"].href;
  const aemAuthToken = await getAemAuth(params, logger);

  try {
    const res = await fetch(fetchUrl, {
      method: "get",
      headers: {
        Authorization: "Bearer " + aemAuthToken,
        "Content-Type": "application/json",
        "x-api-key": params.AEM_SERVICE_TECH_ACCOUNT_CLIENT_ID,
      },
    });

    if (!res.ok) {
      throw new Error(
        "getAemAssetPresignedDownloadUrl:getAemAssetDataRapi request to " +
          fetchUrl +
          " failed with status code " +
          res.status,
      );
    } else {
      const jsonResponse = await res.json();
      logger.debug(
        `getAemAssetPresignedDownloadUrl:getAemAssetDataRapi ${JSON.stringify(jsonResponse, null, 2)}`,
      );
      return jsonResponse.href;
    }
  } catch (error: unknown) {
    logger.error(
      `getAemAssetPresignedDownloadUrl:fetch presigned request to ${aemHost}${aemAssetPath} failed with error ${error instanceof Error ? error.message : String(error)}`,
    );
    throw new Error(
      `getAemAssetPresignedDownloadUrl:fetch presigned request to ${aemHost}${aemAssetPath} failed with error ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/****
 * Write rendition to asset
 */
async function writeRenditionToAsset(
  aemHost: string,
  aemAssetPath: string,
  fileBinary: Buffer,
  fileMimeType: string,
  params: ActionParams,
  logger: Logger,
): Promise<any> {
  aemAssetPath = aemAssetPath.replace("/content/dam", "/api/assets");
  if (aemAssetPath.indexOf("/api/assets") < 0) {
    aemAssetPath = "/api/assets" + aemAssetPath;
  }
  logger.debug("writeRenditionToAsset aemAssetPath: " + aemAssetPath);

  const fetchUrl = aemHost + aemAssetPath;
  const aemAuthToken = await getAemAuth(params, logger);

  const res = await fetch(fetchUrl, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + aemAuthToken,
      "Content-Type": fileMimeType,
    },
    body: fileBinary,
  });

  if (!res.ok) {
    throw new Error(
      "request to " + fetchUrl + " failed with status code " + res.status,
    );
  } else {
    return await res.json();
  }
}

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
async function writeCommentToAsset(
  aemHost: string,
  aemAssetPath: string,
  comment: string,
  annotations: Record<string, any>,
  params: ActionParams,
  logger: Logger,
): Promise<any> {
  aemAssetPath = aemAssetPath.replace("/content/dam", "/api/assets");
  if (aemAssetPath.indexOf("/api/assets") < 0) {
    aemAssetPath = "/api/assets" + aemAssetPath;
  }
  aemAssetPath = aemAssetPath + "/comments/*";

  logger.debug(
    "writeCommentToAsset aemAssetPath path is : " +
      aemAssetPath +
      " we are starting the form build",
  );
  const form = new FormData();
  form.append("message", comment);

  const fetchUrl = aemHost + aemAssetPath;
  logger.debug("writeCommentToAsset fetchUrl: " + fetchUrl);

  const aemAuthToken = await getAemAuth(params, logger);

  const res = await fetch(fetchUrl, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + aemAuthToken,
    },
    body: form,
  });
  logger.debug("writeCommentToAsset res: " + JSON.stringify(res));

  if (!res.ok) {
    throw new Error(
      "request to " +
        fetchUrl +
        " writeCommentToAsset failed with status code " +
        res.status,
    );
  } else {
    return await res.json();
  }
}

/***
 * Get AEM auth token
 *
 * @param {ActionParams} params action input parameters.
 * @param {Logger} logger logger object
 *
 * @returns {Promise<string>} aemAuthToken
 */
async function getAemAuth(
  params: ActionParams,
  logger: Logger,
): Promise<string> {
  let aemAuthToken = getBearerToken(params);
  if (!aemAuthToken) {
    aemAuthToken = await getAemServiceAccountToken(params, logger);
  }
  return aemAuthToken;
}

export {
  getAemServiceAccountToken,
  getAemAssetData,
  getAemAssetDataRapi,
  getAemAssetPresignedDownloadUrl,
  writeRenditionToAsset,
  writeCommentToAsset,
  getAemAuth
};
