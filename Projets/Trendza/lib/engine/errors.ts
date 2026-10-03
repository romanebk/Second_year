export class TrendzaError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "TrendzaError";
    this.code = code;
  }
}

export class SourceUnavailableError extends TrendzaError {
  constructor(source: string, message: string) {
    super(`source_unavailable:${source}`, message);
    this.name = "SourceUnavailableError";
  }
}

export class SourceQuotaError extends TrendzaError {
  constructor(source: string) {
    super(`source_quota:${source}`, `Quota de la source ${source} dépassé.`);
    this.name = "SourceQuotaError";
  }
}

export class SourceAuthError extends TrendzaError {
  constructor(source: string) {
    super(`source_auth:${source}`, `Clé API manquante ou invalide pour ${source}.`);
    this.name = "SourceAuthError";
  }
}

export class InvalidAnalysisRequestError extends TrendzaError {
  constructor(message: string) {
    super("invalid_request", message);
    this.name = "InvalidAnalysisRequestError";
  }
}
