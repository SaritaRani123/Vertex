import { NextResponse } from "next/server";
import type { ValidationErrorResponse, ApiErrorResponse } from "@/lib/api-types";
import type { ZodError } from "zod";

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function validationError(
  message: string,
  details?: ValidationErrorResponse["details"]
): NextResponse<ValidationErrorResponse> {
  return NextResponse.json(
    { error: message, code: "VALIDATION_ERROR", details } satisfies ValidationErrorResponse,
    { status: 400 }
  );
}

export function fromZodError(zodError: ZodError): NextResponse<ValidationErrorResponse> {
  const details = zodError.errors.map((e) => ({
    path: e.path,
    message: e.message,
  }));
  return validationError("Validation failed", details);
}

export function notFound(message = "Resource not found"): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { error: message, code: "NOT_FOUND" } satisfies ApiErrorResponse,
    { status: 404 }
  );
}

export function internalError(
  message = "Internal server error"
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { error: message, code: "INTERNAL_ERROR" } satisfies ApiErrorResponse,
    { status: 500 }
  );
}

export function unauthorized(message = "Unauthorized"): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { error: message, code: "UNAUTHORIZED" } as ApiErrorResponse,
    { status: 401 }
  );
}

export function forbidden(message = "Forbidden"): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { error: message, code: "FORBIDDEN" } as ApiErrorResponse,
    { status: 403 }
  );
}
