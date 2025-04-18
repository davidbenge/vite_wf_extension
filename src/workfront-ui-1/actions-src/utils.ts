/* 
* <license header>
*/

/* This file exposes some common utilities for your actions */

import { Core } from '@adobe/aio-sdk'

interface ActionParams {
  __ow_headers?: {
    [key: string]: string | undefined;
    authorization?: string;
  };
  [key: string]: any;
}

interface Logger {
  info: (message: string) => void;
  error: (message: string) => void;
  debug: (message: string) => void;
}

interface ActionResponse {
  statusCode: number;
  body: any;
}

interface ContentResponse {
  message: string;
  status: string;
}

/**
 * Returns a log ready string of the action input parameters.
 * The `Authorization` header content will be replaced by '<hidden>'.
 *
 * @param {ActionParams} params action input parameters.
 *
 * @returns {string}
 */
function stringParameters(params: ActionParams): string {
  // hide authorization token without overriding params
  let headers = params.__ow_headers || {}
  if (headers.authorization) {
    headers = { ...headers, authorization: '<hidden>' }
  }
  return JSON.stringify({ ...params, __ow_headers: headers })
}

/**
 * Returns the list of missing keys giving an object and its required keys.
 * A parameter is missing if its value is undefined or ''.
 * A value of 0 or null is not considered as missing.
 *
 * @param {object} obj object to check.
 * @param {string[]} required list of required keys.
 *        Each element can be multi level deep using a '.' separator e.g. 'myRequiredObj.myRequiredKey'
 *
 * @returns {string[]}
 * @private
 */
function getMissingKeys(obj: Record<string, any>, required: string[]): string[] {
  return required.filter(r => {
    const splits = r.split('.')
    const last = splits[splits.length - 1]
    const traverse = splits.slice(0, -1).reduce((tObj, split) => { 
      tObj = (tObj[split] || {}); 
      return tObj 
    }, obj)
    return traverse[last] === undefined || traverse[last] === '' // missing default params are empty string
  })
}

/**
 * Returns the list of missing keys giving an object and its required keys.
 * A parameter is missing if its value is undefined or ''.
 * A value of 0 or null is not considered as missing.
 *
 * @param {ActionParams} params action input parameters.
 * @param {string[]} requiredHeaders list of required input headers.
 * @param {string[]} requiredParams list of required input parameters.
 *        Each element can be multi level deep using a '.' separator e.g. 'myRequiredObj.myRequiredKey'.
 *
 * @returns {string | null} if the return value is not null, then it holds an error message describing the missing inputs.
 */
function checkMissingRequestInputs(
  params: ActionParams, 
  requiredParams: string[] = [], 
  requiredHeaders: string[] = []
): string | null {
  let errorMessage: string | null = null

  // input headers are always lowercase
  requiredHeaders = requiredHeaders.map(h => h.toLowerCase())
  // check for missing headers
  const missingHeaders = getMissingKeys(params.__ow_headers || {}, requiredHeaders)
  if (missingHeaders.length > 0) {
    errorMessage = `missing header(s) '${missingHeaders}'`
  }

  // check for missing parameters
  const missingParams = getMissingKeys(params, requiredParams)
  if (missingParams.length > 0) {
    if (errorMessage) {
      errorMessage += ' and '
    } else {
      errorMessage = ''
    }
    errorMessage += `missing parameter(s) '${missingParams}'`
  }

  return errorMessage
}

/**
 * Extracts the bearer token string from the Authorization header in the request parameters.
 *
 * @param {ActionParams} params action input parameters.
 *
 * @returns {string | undefined} the token string or undefined if not set in request headers.
 */
function getBearerToken(params: ActionParams): string | undefined {
  if (params.__ow_headers &&
      params.__ow_headers.authorization &&
      params.__ow_headers.authorization.startsWith('Bearer ')) {
    return params.__ow_headers.authorization.substring('Bearer '.length)
  }
  return undefined
}

/**
 * Returns an error response object and attempts to log.info the status code and error message
 *
 * @param {number} statusCode the error status code.
 *        e.g. 400
 * @param {string} message the error message.
 *        e.g. 'missing xyz parameter'
 * @param {Logger} [logger] an optional logger instance object with an `info` method
 *        e.g. `new require('@adobe/aio-sdk').Core.Logger('name')`
 *
 * @returns {ActionResponse} the error object, ready to be returned from the action main's function.
 */
function errorResponse(statusCode: number, message: string, logger?: Logger): ActionResponse {
  if (logger && typeof logger.info === 'function') {
    logger.info(`${statusCode}: ${message}`)
  }
  return {
    statusCode,
    body: {
      error: message
    }
  }
}

/**
 * Set default content
 */
function contentInit(params: ActionParams): ContentResponse {
  const content: ContentResponse = {
    message: "success",
    status: "ok"
  }

  return content
}

export {
  errorResponse,
  getBearerToken,
  stringParameters,
  checkMissingRequestInputs,
  contentInit,
  ActionParams,
  Logger,
  ActionResponse,
  ContentResponse
} 