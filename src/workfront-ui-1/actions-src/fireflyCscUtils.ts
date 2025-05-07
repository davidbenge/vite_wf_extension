/*
 * <license header>
 */

/* This file exposes some common CSC related utilities for your actions */
import { getBearerToken } from "./utils";
import stateLib from "@adobe/aio-lib-state";
import fetch from "node-fetch";
import axios from "axios";
import { StateAuth, TokenResponse, ActionParams, PhotoshopManifestBody, PhotoshopManifestResponse, Logger } from "./types";

/**
 * Get Firefly services service account token
 *
 * @param {ActionParams} params action input parameters.
 * @param {Logger} logger logger object
 *
 * @returns {Promise<string>} fireflyApiAuthToken
 */
async function getFireflyServicesServiceAccountToken(
  params: ActionParams,
  logger: Logger,
): Promise<string> {
  //ff auth key from cache
  logger.debug(
    "getFireflyServicesServiceAccountToken getting token from state",
  );
  let authToken: string;
  const state = await stateLib.init();
  const stateAuth = (await state.get("firefly-service-auth-key")) as StateAuth;

  //get from store if it exists
  if (
    typeof stateAuth === "undefined" ||
    typeof stateAuth.value === "undefined" ||
    stateAuth.value === null
  ) {
    // build login form for getting auth
    const formBody = new URLSearchParams({
      client_id: params.FIREFLY_SERVICES_CLIENT_ID,
      client_secret: params.FIREFLY_SERVICES_CLIENT_SECRET,
      grant_type: "client_credentials",
      scope: params.FIREFLY_SERVICES_SCOPES,
    });

    logger.debug(
      "getFireflyServicesServiceAccountToken no existing token in state",
    );
    const fetchUrl = "https://ims-na1.adobelogin.com/ims/token/v3";
    const rec = await fetch(fetchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formBody,
    });

    logger.debug(
      `getFireflyServicesServiceAccountToken made call to service ${fetchUrl} ${JSON.stringify(rec, null, 2)}`,
    );

    if (rec.ok) {
      const responseContent = (await rec.json()) as TokenResponse;
      // if not reqeust a new one and put it in the store
      logger.debug(
        `getFireflyServicesServiceAccountToken got new one from service and saving to state ${JSON.stringify(responseContent, null, 2)}`,
      );
      authToken = responseContent.access_token;

      await state.put("firefly-service-auth-key", authToken, { ttl: 79200 }); // -1 for max expiry (365 days), defaults to 86400 (24 hours) 79200 is 22 hours

      return authToken;
    } else {
      logger.debug(
        "getFireflyServicesServiceAccountToken no new token from service error",
      );
      logger.debug(JSON.stringify(rec, null, 2));
      logger.error("Failed to get firefly services auth token");
      throw new Error(
        "request to " + fetchUrl + " failed with status code " + rec.status,
      );
    }
  } else {
    logger.debug(
      `getFireflyServicesServiceAccountToken GOOD existing token from state`,
    );
    return stateAuth.value;
  }
}

/****
 * Get Firefly services auth from right place
 *
 * @param {ActionParams} params action input parameters
 * @param {Logger} logger logger object
 *
 * @returns {Promise<string>} fireflyApiAuthToken
 */
async function getFireflyServicesAuth(
  params: ActionParams,
  logger: Logger,
): Promise<string | undefined> {
  logger.debug("getFireflyServicesAuth");
  if (params.FIREFLY_SERVICES_USE_PASSED_AUTH === "true") {
    logger.debug("getFireflyServicesAuth Bearer Token");
    return getBearerToken(params);
  } else {
    logger.debug(
      "getFireflyServicesAuth getting new token from state or service",
    );
    return await getFireflyServicesServiceAccountToken(params, logger);
  }
}

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
async function getPhotoshopManifestForPresignedUrl(
  targetAssetPresignedUrl: string,
  params: ActionParams,
  logger: Logger,
): Promise<PhotoshopManifestResponse> {
  logger.debug("in getPhotoshopManifestForPresignedUrl");
  logger.debug(JSON.stringify(params, null, 2));
  logger.debug(
    "in getPhotoshopManifestForPresignedUrl before getFireflyServicesAuth ",
  );
  const fetchUrl = "https://image.adobe.io/pie/psdService/documentManifest";
  const fireflyApiAuth = await getFireflyServicesAuth(params, logger);
  const psApiManifestBody: PhotoshopManifestBody = {
    inputs: [
      {
        href: targetAssetPresignedUrl,
        storage: "external",
      },
    ],
  };

  const callHeaders: Record<string, string> = {
    Authorization: `Bearer ${fireflyApiAuth}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-api-key": params.FIREFLY_SERVICES_CLIENT_ID,
  };
  if (
    typeof params.throwIoEvent !== "undefined" &&
    (params.throwIoEvent === "true" || params.throwIoEvent === true)
  ) {
    callHeaders["x-gw-ims-org-id"] = params.FIREFLY_SERVICES_ORG_ID!;
  }

  const config = {
    method: "POST",
    url: fetchUrl,
    headers: callHeaders,
    data: psApiManifestBody,
  };

  logger.debug(
    "fireflyCscUtils:getPhotoshopManifest before fetch with this call config",
  );
  logger.debug(JSON.stringify(config, null, 2));

  try {
    const response = await axios.request(config);

    logger.debug(
      `in getPhotoshopManifestForPresignedUrl was successful ${JSON.stringify(response.data, null, 2)}`,
    );
    return response.data;
  } catch (error: unknown) {
    logger.error(
      `request to ${fetchUrl} failed ${JSON.stringify(error, null, 2)}`,
    );
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: unknown; headers?: unknown } };
      logger.error(`error.response.data ${axiosError.response?.data}`);
      logger.error(`error.response.status ${axiosError.response?.status}`);
      logger.error(`error.response.headers ${axiosError.response?.headers}`);
    } else if (error && typeof error === 'object' && 'request' in error) {
      const axiosError = error as { request?: unknown };
      logger.error(`error.request ${axiosError.request}`);
    } else {
      logger.error(`request to ${fetchUrl} failed ${error instanceof Error ? error.message : String(error)}`);
    }
    throw new Error(`request to ${fetchUrl} failed ${error instanceof Error ? error.message : String(error)}`);
  }
}

function sleepCscRequest(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export {
  getFireflyServicesAuth,
  getPhotoshopManifestForPresignedUrl,
  getFireflyServicesServiceAccountToken,
  sleepCscRequest,
};
export type { ActionParams };
