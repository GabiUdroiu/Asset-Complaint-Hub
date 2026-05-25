package com.draxlmaier.hub.util;

import com.draxlmaier.hub.service.JwtTokenProvider;
import jakarta.ws.rs.core.HttpHeaders;

public class AuthUtils {

    private static JwtTokenProvider jwtTokenProvider;

    public AuthUtils(JwtTokenProvider jwtTokenProvider) {
        AuthUtils.jwtTokenProvider = jwtTokenProvider;
    }

    public static Long getCurrentUserId(HttpHeaders headers) {
        String token = extractToken(headers);
        if (token == null) return null;
        try {
            return jwtTokenProvider.getUserIdFromToken(token);
        } catch (Exception e) {
            return null;
        }
    }

    public static String getCurrentUserRole(HttpHeaders headers) {
        String token = extractToken(headers);
        if (token == null) return null;
        try {
            return jwtTokenProvider.getRoleFromToken(token);
        } catch (Exception e) {
            return null;
        }
    }

    public static boolean isAuthorized(HttpHeaders headers) {
        String role = getCurrentUserRole(headers);
        return role != null && ("ADMIN".equals(role) || "DEPT_RESPONSIBLE".equals(role));
    }

    private static String extractToken(HttpHeaders headers) {
        String authHeader = headers.getHeaderString("Authorization");
        if (authHeader == null || authHeader.isEmpty()) {
            return null;
        }
        return authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
    }
}
