/*
 * <license header>
 */

/* This file exposes some common utilities for your actions */

import {
  BaseActionParams,
  Logger,
  ActionResponse,
  ContentResponse,
} from "./types";

/**
 * Returns a log ready string of the action input parameters.
 * The `Authorization` header content will be replaced by '<hidden>'.
 *
 * @param {BaseActionParams} params action input parameters.
 *
 * @returns {string}
 */
function stringParameters(params: BaseActionParams): string {
  // hide authorization token without overriding params
  let headers = params.__ow_headers || {};
  if (headers.authorization) {
    headers = { ...headers, authorization: "<hidden>" };
  }
  return JSON.stringify({ ...params, __ow_headers: headers });
}

/**
 * Returns an array of missing keys from an object
 *
 * @param {Record<string, any>} obj The object to check
 * @param {string[]} required The required keys
 *
 * @returns {string[]} Array of missing keys
 */
function getMissingKeys(
  obj: Record<string, any>,
  required: string[],
): string[] {
  return required.filter((key) => !(key in obj));
}

/**
 * Checks for missing request input parameters and headers
 *
 * @param {BaseActionParams} params action input parameters
 * @param {string[]} requiredParams required parameters
 * @param {string[]} requiredHeaders required headers
 *
 * @returns {string | null} error message if missing, null if all present
 */
function checkMissingRequestInputs(
  params: BaseActionParams,
  requiredParams: string[] = [],
  requiredHeaders: string[] = [],
): string | null {
  const missingParams = getMissingKeys(params, requiredParams);
  const missingHeaders = getMissingKeys(
    params.__ow_headers || {},
    requiredHeaders,
  );

  if (missingParams.length > 0 || missingHeaders.length > 0) {
    const missing: string[] = [];
    if (missingParams.length > 0) {
      missing.push(`missing parameters: ${missingParams.join(", ")}`);
    }
    if (missingHeaders.length > 0) {
      missing.push(`missing headers: ${missingHeaders.join(", ")}`);
    }
    return missing.join(" and ");
  }
  return null;
}

/**
 * Gets the bearer token from the request headers
 *
 * @param {BaseActionParams} params action input parameters
 *
 * @returns {string | undefined} bearer token or undefined if not found
 */
function getBearerToken(params: BaseActionParams): string | undefined {
  const authHeader = params.__ow_headers?.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return undefined;
}

/**
 * Returns an error response
 *
 * @param {number} statusCode HTTP status code
 * @param {string} message Error message
 * @param {Logger} [logger] Optional logger
 *
 * @returns {ActionResponse} Error response
 */
function errorResponse(
  statusCode: number,
  message: string,
  logger?: Logger,
): ActionResponse {
  if (logger) {
    logger.error(message);
  }
  return {
    statusCode,
    body: { error: message },
  };
}

/**
 * Initializes content response
 *
 * @param {BaseActionParams} params action input parameters
 *
 * @returns {ContentResponse} Initialized content response
 */
function contentInit(params: BaseActionParams): ContentResponse {
  return {
    message: "success",
    status: "ok",
  };
}

export {
  stringParameters,
  getMissingKeys,
  checkMissingRequestInputs,
  getBearerToken,
  errorResponse,
  contentInit,
};
