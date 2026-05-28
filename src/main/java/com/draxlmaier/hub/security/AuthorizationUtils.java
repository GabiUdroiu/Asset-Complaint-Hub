package com.draxlmaier.hub.security;

import com.draxlmaier.hub.model.Employee;
import com.draxlmaier.hub.repository.EmployeeRepository;
import jakarta.ejb.Singleton;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.HttpHeaders;
import com.draxlmaier.hub.util.JwtTokenProvider;
import io.jsonwebtoken.JwtException;

@Singleton
public class AuthorizationUtils {

    @Inject
    private JwtTokenProvider jwtTokenProvider;

    @Inject
    private EmployeeRepository employeeRepository;

    /**
     * Check if user can access support view (requires ADMIN or DEPT_RESPONSIBLE role)
     */
    public boolean canAccessSupportView(Employee user) {
        if (user == null || user.getRole() == null) {
            return false;
        }
        String roleName = user.getRole().getName();
        return "ADMIN".equals(roleName) || "DEPT_RESPONSIBLE".equals(roleName);
    }

    /**
     * Check if user can manage a request/complaint (accept, change status)
     * Allowed if:
     * - User is ADMIN, OR
     * - User is the creator AND is DEPT_RESPONSIBLE/ADMIN, OR
     * - User is DEPT_RESPONSIBLE from the same department as the item creator
     */
    public boolean canManageItem(Employee user, Employee itemCreator, Long itemDeptId) {
        if (user == null || user.getRole() == null) {
            return false;
        }

        String roleName = user.getRole().getName();

        // Admin has access to everything
        if ("ADMIN".equals(roleName)) {
            return true;
        }

        if (itemCreator == null) {
            return false;
        }

        // Creator can manage their own item if they're dept responsible
        if (user.getId() != null && user.getId().equals(itemCreator.getId())) {
            return "DEPT_RESPONSIBLE".equals(roleName);
        }

        // Dept responsible from the same department can manage
        if ("DEPT_RESPONSIBLE".equals(roleName)) {
            Long userDeptId = user.getDepartment() != null ? user.getDepartment().getId() : null;
            return userDeptId != null && itemDeptId != null && userDeptId.equals(itemDeptId);
        }

        return false;
    }

    /**
     * Check if user can export PDF (only DEPT_RESPONSIBLE and ADMIN)
     */
    public boolean canExportPdf(Employee user) {
        if (user == null || user.getRole() == null) {
            return false;
        }
        String roleName = user.getRole().getName();
        return "ADMIN".equals(roleName) || "DEPT_RESPONSIBLE".equals(roleName);
    }

    /**
     * Extract employee from JWT token in headers
     */
    public Employee extractUserFromToken(HttpHeaders headers) {
        if (headers == null) {
            return null;
        }

        String authHeader = headers.getHeaderString("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        String token = authHeader.substring(7);
        try {
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            if (userId == null) {
                return null;
            }
            return employeeRepository.findById(userId).orElse(null);
        } catch (JwtException e) {
            return null;
        }
    }
}
