/*
 * <license header>
 */

interface ActionWebInvokeOptions {
  method?: "GET" | "POST";
}

type ActionWebInvokeHeaders = Record<string, string>;

interface ActionWebInvokeParams {
  [key: string]: any;
}

/**
 * Checks if the current window is running inside an iframe
 * @returns boolean indicating if we're in an iframe
 */
export const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    // If we can't access window.top due to security restrictions,
    // we're definitely in an iframe
    return true;
  }
};

/**
 * Checks if the application is running on localhost
 * @returns boolean indicating if we're on localhost
 */
export const isLocalhost = (): boolean => {
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
};

/**
 * Invokes a web action
 * @param actionUrl - The URL of the web action to invoke
 * @param headers - Optional headers to include in the request
 * @param params - Optional parameters to include in the request
 * @param options - Optional configuration options
 * @returns Promise containing the response data
 */
async function actionWebInvoke(
  actionUrl: string,
  headers: ActionWebInvokeHeaders = {},
  params: ActionWebInvokeParams = {},
  options: ActionWebInvokeOptions = { method: "POST" },
): Promise<any> {
  const actionHeaders: ActionWebInvokeHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  const fetchConfig: RequestInit = {
    headers: actionHeaders,
  };

  if (window.location.hostname === "localhost") {
    actionHeaders["x-ow-extra-logging"] = "on";
  }

  fetchConfig.method = options.method?.toUpperCase();

  if (fetchConfig.method === "GET") {
    const url = new URL(actionUrl);
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key]),
    );
    actionUrl = url.toString();
  } else if (fetchConfig.method === "POST") {
    fetchConfig.body = JSON.stringify(params);
  }

  const response = await fetch(actionUrl, fetchConfig);
  let content = await response.text();

  if (!response.ok) {
    return JSON.parse(content);
  }
  try {
    content = JSON.parse(content);
  } catch (e) {
    // response is not json
  }
  return content;
}

export default actionWebInvoke;

export const callMyRuntimeAction = async (payload: any): Promise<any> => {
  try {
    const response = await fetch("/api/runtime/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (error) {
    console.error("Error calling runtime action:", error);
    throw error;
  }
};

export const someValidation = (data: any): boolean => {
  return data && typeof data === "object";
};
