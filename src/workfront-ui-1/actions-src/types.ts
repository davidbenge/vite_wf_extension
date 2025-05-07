/*
 * <license header>
 */

/**
 * Common interfaces used across multiple action files
 */

// Logger interface for consistent logging across actions
export interface Logger {
  debug: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

// Standard action response interface
export interface ActionResponse {
  statusCode: number;
  body: any;
}

// Standard content response interface
export interface ContentResponse {
  message: string;
  status: string;
}

// State authentication interface
export interface StateAuth {
  value: string | null;
}

// Base ActionParams interface that can be extended by specific implementations
export interface BaseActionParams {
  LOG_LEVEL?: string;
  __ow_headers?: {
    [key: string]: string | undefined;
    authorization?: string;
  };
  [key: string]: any;
}

// AEM specific ActionParams
export interface AemActionParams extends BaseActionParams {
  AEM_SERVICE_TECH_ACCOUNT_CLIENT_ID: string;
  AEM_SERVICE_TECH_ACCOUNT_ID: string;
  AEM_SERVICE_TECH_ACCOUNT_ORG_ID: string;
  AEM_SERVICE_TECH_ACCOUNT_CLIENT_SECRET: string;
  AEM_SERVICE_TECH_ACCOUNT_PRIVATE_KEY: string;
  AEM_SERVICE_TECH_ACCOUNT_META_SCOPES: string;
}

// Firefly specific ActionParams
export interface FireflyActionParams extends BaseActionParams {
  FIREFLY_SERVICES_CLIENT_ID: string;
  FIREFLY_SERVICES_CLIENT_SECRET: string;
  FIREFLY_SERVICES_SCOPES: string;
  FIREFLY_SERVICES_USE_PASSED_AUTH?: string;
  FIREFLY_SERVICES_ORG_ID?: string;
  throwIoEvent?: string | boolean;
}

// Combined ActionParams for actions that need both AEM and Firefly
export interface CombinedActionParams
  extends AemActionParams,
    FireflyActionParams {}

// Repository metadata interface
export interface RepositoryMetadata {
  "dc:format"?: string;
  "repo:path"?: string;
  "repo:repositoryId"?: string;
  "repo:size"?: number;
  "repo:assetId"?: string;
  "repo:name"?: string;
  [key: string]: any;
}

// Job secondary data interface
export interface JobSecondaryData {
  aemHost: string;
  aemAssetPath: string;
  aemAssetPresignedDownloadPath: string;
  aemAssetSize: number;
  aemAssetUuid: string;
  aemAssetName: string;
  aemAssetMetaData: Record<string, any>;
  processPassCount: number;
  processingComplete: boolean;
  psApiJobId: string;
}

// Response content interface
export interface ResponseContent {
  challenge?: string;
  debug?: {
    [key: string]: Array<{
      debugMessage?: string;
      [key: string]: any;
    }>;
  };
  jobData?: JobSecondaryData;
  jobId?: string;
  status?: string;
}

export interface TokenResponse {
  access_token: string;
  [key: string]: any;
}

export interface ActionParams {
  FIREFLY_SERVICES_CLIENT_ID: string;
  FIREFLY_SERVICES_CLIENT_SECRET: string;
  FIREFLY_SERVICES_SCOPES: string;
  FIREFLY_SERVICES_USE_PASSED_AUTH?: string;
  FIREFLY_SERVICES_ORG_ID?: string;
  throwIoEvent?: string | boolean;
  [key: string]: any;
}

export interface PhotoshopManifestBody {
  inputs: Array<{
    href: string;
    storage: string;
  }>;
}

export interface PhotoshopManifestResponse {
  [key: string]: any;
}
