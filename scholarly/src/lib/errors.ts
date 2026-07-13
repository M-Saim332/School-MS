import { ZodError, type ZodIssue } from "zod";

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please check the form and try again.";

function issueToMessage(issue: ZodIssue) {
  if (issue.message && issue.message !== "Required") return issue.message;
  const field = issue.path.at(-1);
  if (typeof field === "string" && field.length) return `${field.replaceAll("_", " ")} is required.`;
  return "Please fill in the required information.";
}

function messagesFromIssues(issues: ZodIssue[]) {
  return [...new Set(issues.map(issueToMessage))].join(" ");
}

function tryParseValidationMessage(message: string) {
  try {
    const parsed = JSON.parse(message);
    if (Array.isArray(parsed) && parsed.every((item) => item && typeof item === "object" && "message" in item)) {
      return [...new Set(parsed.map((item) => String(item.message)))].join(" ");
    }
    if (parsed && typeof parsed === "object") {
      const issues = "issues" in parsed ? parsed.issues : "errors" in parsed ? parsed.errors : null;
      if (Array.isArray(issues)) return tryParseValidationMessage(JSON.stringify(issues));
      if ("message" in parsed && typeof parsed.message === "string") return parsed.message;
    }
  } catch {
    return null;
  }

  return null;
}

function humanizeKnownTechnicalMessage(message: string) {
  const lower = message.toLowerCase();

  if (lower === "failed to fetch") {
    return "Unable to connect right now. Please check that the server is running, then try again.";
  }

  if (lower.includes("row-level security policy")) {
    return "You do not have permission to make this change.";
  }

  if (lower.includes("duplicate key value") || lower.includes("already exists")) {
    return "This record already exists. Please use a different value.";
  }

  if (lower.includes("violates foreign key constraint")) {
    return "One of the selected items is no longer available. Please refresh and choose again.";
  }

  if (lower.includes("invalid input syntax for type uuid")) {
    return "Please choose a valid option before saving.";
  }

  if (lower.includes("column") && lower.includes("does not exist")) {
    return "The database is missing a required update. Please apply the latest migrations and try again.";
  }

  if (lower.includes("invalid login credentials")) {
    return "The email or password is incorrect.";
  }

  if (lower.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }

  if (lower.includes("jwt") || lower.includes("session")) {
    return "Your session has expired. Please sign in again.";
  }

  return message;
}

export function getFriendlyErrorMessage(error: unknown, fallbackMessage = DEFAULT_ERROR_MESSAGE) {
  if (error instanceof ZodError) return messagesFromIssues(error.issues);

  if (typeof error === "string") {
    const parsed = tryParseValidationMessage(error.trim());
    return humanizeKnownTechnicalMessage(parsed ?? error) || fallbackMessage;
  }

  if (error && typeof error === "object") {
    const maybeIssues = "issues" in error ? error.issues : "errors" in error ? error.errors : null;
    if (Array.isArray(maybeIssues)) {
      const parsed = tryParseValidationMessage(JSON.stringify(maybeIssues));
      if (parsed) return humanizeKnownTechnicalMessage(parsed);
    }

    if ("message" in error && typeof error.message === "string") {
      const parsed = tryParseValidationMessage(error.message.trim());
      return humanizeKnownTechnicalMessage(parsed ?? error.message) || fallbackMessage;
    }
  }

  return fallbackMessage;
}

export function throwFriendlyError(error: unknown, fallbackMessage?: string): never {
  throw new Error(getFriendlyErrorMessage(error, fallbackMessage));
}
