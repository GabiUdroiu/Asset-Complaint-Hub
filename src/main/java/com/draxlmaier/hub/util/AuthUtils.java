package com.draxlmaier.hub.util;

import com.draxlmaier.hub.model.RoleEnum;
import com.draxlmaier.hub.util.JwtTokenProvider;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.Response;

/**
 * Utility class for authorization and authentication checks.
 * Provides methods to check user permissions and roles.
 */
public class AuthUtils {

  private static JwtTokenProvider jwtTokenProvider;

  public AuthUtils(JwtTokenProvider jwtTokenProvider) {
    AuthUtils.jwtTokenProvider = jwtTokenProvider;
  }

  /**
   * Extract bearer token from Authorization header
   */
  private static String extractToken(HttpHeaders headers) {
    String authHeader = headers.getHeaderString("Authorization");
    if (authHeader == null || authHeader.isBlank()) {
      return null;
    }
    return authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
  }

  /**
   * Get current user ID from token
   */
  public static Long getCurrentUserId(HttpHeaders headers) {
    String token = extractToken(headers);
    if (token == null) return null;
    try {
      return jwtTokenProvider.getUserIdFromToken(token);
    } catch (Exception e) {
      return null;
    }
  }

  /**
   * Get current user role from token
   */
  public static String getCurrentUserRole(HttpHeaders headers) {
    String token = extractToken(headers);
    if (token == null) return null;
    try {
      return jwtTokenProvider.getRoleFromToken(token);
    } catch (Exception e) {
      return null;
    }
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  public static boolean isAuthenticated(HttpHeaders headers) {
    return extractToken(headers) != null;
  }

  /**
   * Check if user has ADMIN role
   */
  public static boolean isAdmin(HttpHeaders headers) {
    String role = getCurrentUserRole(headers);
    return RoleEnum.isEqual(role, RoleEnum.ADMIN);
  }

  /**
   * Check if user has DEPT_RESPONSIBLE role
   */
  public static boolean isDeptResponsible(HttpHeaders headers) {
    String role = getCurrentUserRole(headers);
    return RoleEnum.isEqual(role, RoleEnum.DEPT_RESPONSIBLE);
  }

  /**
   * Check if user has USER role
   */
  public static boolean isRegularUser(HttpHeaders headers) {
    String role = getCurrentUserRole(headers);
    return RoleEnum.isEqual(role, RoleEnum.USER);
  }

  /**
   * Check if user is admin or department responsible (managerial role)
   */
  public static boolean isManagerial(HttpHeaders headers) {
    return isAdmin(headers) || isDeptResponsible(headers);
  }

  /**
   * Verify authentication - throws exception if not authenticated
   * @return Response if unauthorized, null if authorized
   */
  public static Response requireAuth(HttpHeaders headers) {
    if (!isAuthenticated(headers)) {
      return ResponseBuilder.unauthorized();
    }
    return null;
  }

  /**
   * Verify admin access - throws exception if not admin
   * @return Response if unauthorized, null if authorized
   */
  public static Response requireAdmin(HttpHeaders headers) {
    Response authCheck = requireAuth(headers);
    if (authCheck != null) return authCheck;

    if (!isAdmin(headers)) {
      return ResponseBuilder.forbidden("Admin access required");
    }
    return null;
  }

  /**
   * Verify admin or department responsible access
   * @return Response if unauthorized, null if authorized
   */
  public static Response requireManagerial(HttpHeaders headers) {
    Response authCheck = requireAuth(headers);
    if (authCheck != null) return authCheck;

    if (!isManagerial(headers)) {
      return ResponseBuilder.forbidden("Admin or Department Responsible access required");
    }
    return null;
  }

  /**
   * Legacy method - kept for backward compatibility
   * @deprecated Use isManagerial() instead
   */
  @Deprecated
  public static boolean isAuthorized(HttpHeaders headers) {
    return isManagerial(headers);
  }
}
