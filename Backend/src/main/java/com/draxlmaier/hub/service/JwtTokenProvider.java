package com.draxlmaier.hub.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.enterprise.context.ApplicationScoped;
import com.draxlmaier.hub.dto.UserDTO;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@ApplicationScoped
public class JwtTokenProvider {
    
    // JWT Secret - should be loaded from environment variable in production
    private static final String SECRET_KEY = System.getenv("JWT_SECRET_KEY") != null
        ? System.getenv("JWT_SECRET_KEY")
        : "draxlmaier-complaint-hub-secret-key-at-least-32-chars-long-for-hs512";
    
    private static final long EXPIRATION_TIME = 86400000; // 24 hours in milliseconds
    private static final long REFRESH_EXPIRATION = 604800000; // 7 days in milliseconds
    
    /**
     * Generate JWT access token
     */
    public String generateToken(UserDTO user) {
        return Jwts.builder()
            .subject(user.email())
            .claim("userId", user.id())
            .claim("role", user.role().toString())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
            .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8)))
            .compact();
    }
    
    /**
     * Generate JWT refresh token
     */
    public String generateRefreshToken(UserDTO user) {
        return Jwts.builder()
            .subject(user.email())
            .claim("userId", user.id())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + REFRESH_EXPIRATION))
            .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8)))
            .compact();
    }
    
    /**
     * Validate token and return claims
     */
    public Claims validateToken(String token) {
        try {
            return Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseSignedClaims(token)
                .getPayload();
        } catch (ExpiredJwtException e) {
            throw new JwtException("Token has expired", e);
        } catch (UnsupportedJwtException e) {
            throw new JwtException("JWT is not supported", e);
        } catch (MalformedJwtException e) {
            throw new JwtException("Invalid JWT token", e);
        } catch (SignatureException e) {
            throw new JwtException("Invalid JWT signature", e);
        } catch (IllegalArgumentException e) {
            throw new JwtException("JWT claims string is empty", e);
        }
    }
    
    /**
     * Extract email from token
     */
    public String getEmailFromToken(String token) {
        return validateToken(token).getSubject();
    }
    
    /**
     * Extract user ID from token
     */
    public Long getUserIdFromToken(String token) {
        return validateToken(token).get("userId", Long.class);
    }
    
    /**
     * Extract role from token
     */
    public String getRoleFromToken(String token) {
        return validateToken(token).get("role", String.class);
    }
    
    /**
     * Check if token is expired
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = validateToken(token);
            return claims.getExpiration().before(new Date());
        } catch (JwtException e) {
            return true;
        }
    }
}
