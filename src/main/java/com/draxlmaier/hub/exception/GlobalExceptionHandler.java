package com.draxlmaier.hub.exception;

import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for REST API.
 * Maps exceptions to appropriate HTTP responses with JSON error bodies.
 */
@Provider
public class GlobalExceptionHandler implements ExceptionMapper<Exception> {

    @Override
    public Response toResponse(Exception exception) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", exception.getMessage());
        errorResponse.put("type", exception.getClass().getSimpleName());

        // Handle constraint violations (validation errors)
        if (exception instanceof ConstraintViolationException) {
            errorResponse.put("message", "Validation failed");
            return Response
                .status(Response.Status.BAD_REQUEST)
                .entity(errorResponse)
                .build();
        }

        // Handle entity not found
        if (exception.getMessage() != null && exception.getMessage().contains("not found")) {
            errorResponse.put("message", "Resource not found");
            return Response
                .status(Response.Status.NOT_FOUND)
                .entity(errorResponse)
                .build();
        }

        // Handle access denied / unauthorized
        if (exception.getMessage() != null && 
            (exception.getMessage().contains("401") || 
             exception.getMessage().contains("403") ||
             exception.getMessage().contains("Unauthorized") ||
             exception.getMessage().contains("Forbidden"))) {
            errorResponse.put("message", "Access denied");
            return Response
                .status(Response.Status.FORBIDDEN)
                .entity(errorResponse)
                .build();
        }

        // Handle FK constraint violations
        if (exception instanceof Exception && 
            exception.getMessage() != null &&
            (exception.getMessage().contains("foreign key") || 
             exception.getMessage().contains("constraint") ||
             exception.getMessage().contains("FK"))) {
            errorResponse.put("message", "Cannot perform operation due to data dependencies");
            return Response
                .status(Response.Status.CONFLICT)
                .entity(errorResponse)
                .build();
        }

        // Default: Internal Server Error
        errorResponse.put("message", "An unexpected error occurred");
        return Response
            .status(Response.Status.INTERNAL_SERVER_ERROR)
            .entity(errorResponse)
            .build();
    }
}
