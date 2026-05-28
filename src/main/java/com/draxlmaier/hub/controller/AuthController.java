package com.draxlmaier.hub.controller;

import com.draxlmaier.hub.dto.*;
import com.draxlmaier.hub.model.Employee;
import com.draxlmaier.hub.repository.EmployeeRepository;
import com.draxlmaier.hub.util.JwtTokenProvider;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.mindrot.jbcrypt.BCrypt;

import java.time.LocalDateTime;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthController {

    @Inject
    private EmployeeRepository employeeRepository;

    @Inject
    private JwtTokenProvider jwtTokenProvider;

    @Inject
    private com.draxlmaier.hub.repository.RoleRepository roleRepository;

    @Inject
    private com.draxlmaier.hub.repository.DepartmentRepository departmentRepository;

    @POST
    @Path("/login")
    @Operation(summary = "Login with email and password")
    public Response login(LoginRequest request) {
        try {
            // Validate input
            if (request.email() == null || request.email().isEmpty() ||
                request.password() == null || request.password().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Email and password are required", "INVALID_INPUT"))
                    .build();
            }

            // Find employee by email
            var userOptional = employeeRepository.findByEmail(request.email());
            if (userOptional.isEmpty()) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("Invalid email or password", "INVALID_CREDENTIALS"))
                    .build();
            }

            Employee user = userOptional.get();

            // Verify password
            if (!BCrypt.checkpw(request.password(), user.getPasswordHash())) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("Invalid email or password", "INVALID_CREDENTIALS"))
                    .build();
            }

            // Check if user is active
            if (!user.getActive()) {
                return Response.status(Response.Status.FORBIDDEN)
                    .entity(new ErrorResponse("User account is inactive", "ACCOUNT_INACTIVE"))
                    .build();
            }

            // Update last login
            user.setLastLogin(LocalDateTime.now());
            employeeRepository.save(user);

            // Create UserDTO for token
            UserDTO userDTO = new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getDepartment() != null ? user.getDepartment().getId() : null,
                user.getDepartment() != null ? user.getDepartment().getName() : "",
                user.getRole().getName()
            );

            // Generate tokens
            String accessToken = jwtTokenProvider.generateToken(userDTO);
            String refreshToken = jwtTokenProvider.generateRefreshToken(userDTO);

            // Create response
            AuthResponse authResponse = new AuthResponse(
                accessToken,
                refreshToken,
                userDTO,
                86400000L // 24 hours in milliseconds
            );

            return Response.ok(new ApiResponse<>("Login successful", authResponse)).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("An error occurred during login: " + e.getMessage(), "LOGIN_ERROR"))
                .build();
        }
    }

    @POST
    @Path("/register")
    @Operation(summary = "Register new user")
    public Response register(RegisterRequest request) {
        try {
            // Validate input
            if (request.email() == null || request.email().isEmpty() ||
                request.password() == null || request.password().isEmpty() ||
                request.name() == null || request.name().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Email, password, and name are required", "INVALID_INPUT"))
                    .build();
            }

            // Check if email already exists
            if (employeeRepository.findByEmail(request.email()).isPresent()) {
                return Response.status(Response.Status.CONFLICT)
                    .entity(new ErrorResponse("Email already registered", "EMAIL_EXISTS"))
                    .build();
            }

            // Get EMPLOYEE role from database
            var employeeRole = roleRepository.findByName("USER");
            if (employeeRole == null) {
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("EMPLOYEE role not found", "ROLE_NOT_FOUND"))
                    .build();
            }

            // Get department if provided
            com.draxlmaier.hub.model.Department dept = null;
            if (request.department() != null && !request.department().isEmpty()) {
                var deptOpt = departmentRepository.findByName(request.department());
                if (deptOpt.isEmpty()) {
                    return Response.status(Response.Status.BAD_REQUEST)
                        .entity(new ErrorResponse("Department not found", "DEPT_NOT_FOUND"))
                        .build();
                }
                dept = deptOpt.get();
            }

            // Create new employee
            Employee newEmployee = Employee.builder()
                .email(request.email())
                .name(request.name())
                .passwordHash(BCrypt.hashpw(request.password(), BCrypt.gensalt(12)))
                .role(employeeRole)
                .department(dept)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

            // Save employee
            Employee savedEmployee = employeeRepository.save(newEmployee);

            // Create UserDTO
            UserDTO userDTO = new UserDTO(
                savedEmployee.getId(),
                savedEmployee.getEmail(),
                savedEmployee.getName(),
                savedEmployee.getDepartment() != null ? savedEmployee.getDepartment().getId() : null,
                savedEmployee.getDepartment() != null ? savedEmployee.getDepartment().getName() : "",
                savedEmployee.getRole().getName()
            );

            // Generate tokens
            String accessToken = jwtTokenProvider.generateToken(userDTO);

            // Create response
            AuthResponse authResponse = new AuthResponse(
                accessToken,
                null,
                userDTO,
                86400000L // 24 hours in milliseconds
            );

            return Response.status(Response.Status.CREATED)
                .entity(new ApiResponse<>("Registration successful", authResponse))
                .build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("An error occurred during registration", "REGISTER_ERROR"))
                .build();
        }
    }

    /**
     * Refresh access token
     */
    @POST
    @Path("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public Response refreshToken(RefreshTokenRequest request) {
        try {
            if (request.refreshToken() == null || request.refreshToken().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Refresh token is required", "INVALID_INPUT"))
                    .build();
            }

            // Validate refresh token
            String email = jwtTokenProvider.getEmailFromToken(request.refreshToken());
            var userOptional = employeeRepository.findByEmail(email);

            if (userOptional.isEmpty()) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("Invalid refresh token", "INVALID_TOKEN"))
                    .build();
            }

            Employee user = userOptional.get();

            // Create UserDTO
            UserDTO userDTO = new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getDepartment() != null ? user.getDepartment().getId() : null,
                user.getDepartment() != null ? user.getDepartment().getName() : "",
                user.getRole().getName()
            );

            // Generate new access token
            String newAccessToken = jwtTokenProvider.generateToken(userDTO);

            // Create response
            AuthResponse authResponse = new AuthResponse(
                newAccessToken,
                request.refreshToken(),
                userDTO,
                86400000L // 24 hours in milliseconds
            );

            return Response.ok(new ApiResponse<>("Token refreshed", authResponse)).build();

        } catch (Exception e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new ErrorResponse("Invalid or expired refresh token", "INVALID_TOKEN"))
                .build();
        }
    }
}
