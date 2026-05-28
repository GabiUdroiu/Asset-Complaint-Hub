package com.draxlmaier.hub.util;

import com.draxlmaier.hub.dto.ApiResponse;
import jakarta.ws.rs.core.Response;

/**
 * Utility class to standardize API response building across controllers.
 */
public class ResponseBuilder {

  /**
   * Build a 200 OK response
   */
  public static <T> Response ok(String message, T data) {
    return Response.ok(new ApiResponse<>(message, data)).build();
  }

  /**
   * Build a 201 CREATED response
   */
  public static <T> Response created(String message, T data) {
    return Response.status(Response.Status.CREATED)
        .entity(new ApiResponse<>(message, data))
        .build();
  }

  /**
   * Build a 404 NOT FOUND response
   */
  public static Response notFound(String message) {
    return Response.status(Response.Status.NOT_FOUND)
        .entity(new ApiResponse<>(message, null))
        .build();
  }

  /**
   * Build a 409 CONFLICT response (e.g., item locked)
   */
  public static Response conflict(String message) {
    return Response.status(Response.Status.CONFLICT)
        .entity(new ApiResponse<>(message, null))
        .build();
  }

  /**
   * Build a 409 CONFLICT response with data
   */
  public static <T> Response conflict(String message, T data) {
    return Response.status(Response.Status.CONFLICT)
        .entity(new ApiResponse<>(message, data))
        .build();
  }

  /**
   * Build a 403 FORBIDDEN response (insufficient permissions)
   */
  public static Response forbidden(String message) {
    return Response.status(Response.Status.FORBIDDEN)
        .entity(new ApiResponse<>(message, null))
        .build();
  }

  /**
   * Build a 204 NO CONTENT response
   */
  public static Response noContent() {
    return Response.noContent().build();
  }

  /**
   * Build a 204 NO CONTENT response with message
   */
  public static Response noContent(String message) {
    return Response.noContent().entity(new ApiResponse<>(message, null)).build();
  }

  /**
   * Build a 401 UNAUTHORIZED response (missing authentication)
   */
  public static Response unauthorized() {
    return forbidden("Authentication required");
  }

  /**
   * Build a 400 BAD REQUEST response
   */
  public static Response badRequest(String message) {
    return Response.status(Response.Status.BAD_REQUEST)
        .entity(new ApiResponse<>(message, null))
        .build();
  }

  /**
   * Build an INTERNAL SERVER ERROR (500) response
   */
  public static Response internalServerError(String message) {
    return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
        .entity(new ApiResponse<>(message, null))
        .build();
  }
}
