package com.draxlmaier.hub.controller;

import com.draxlmaier.hub.dto.ApiResponse;
import com.draxlmaier.hub.dto.RequestDTO;
import com.draxlmaier.hub.dto.PaginatedResponse;
import com.draxlmaier.hub.model.Request;
import com.draxlmaier.hub.model.Employee;
import com.draxlmaier.hub.model.RoleEnum;
import com.draxlmaier.hub.security.AuthorizationUtils;
import com.draxlmaier.hub.service.IService;
import com.draxlmaier.hub.repository.RequestRepository;
import com.draxlmaier.hub.repository.EmployeeRepository;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/requests")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Requests", description = "Asset request management")
public class RequestController {

    @Inject
    private IService<Request, RequestDTO> requestService;

    @Inject
    private RequestRepository requestRepository;

    @Inject
    private EmployeeRepository employeeRepository;

    @Inject
    private AuthorizationUtils authorizationUtils;

    @Context
    private HttpHeaders httpHeaders;

    @POST
    @Operation(summary = "Create request")
    public Response createRequest(RequestDTO requestDTO) {
        RequestDTO created = requestService.create(requestDTO);
        return Response.status(Response.Status.CREATED)
            .entity(new ApiResponse<>("Request created successfully", created))
            .build();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get request by ID")
    public Response getRequest(@PathParam("id") Long id) {
        Employee currentUser = authorizationUtils.extractUserFromToken(httpHeaders);

        return requestService.get(id)
            .map(request -> {
                // Check if user can access this request
                if (currentUser != null) {
                    String roleName = currentUser.getRole() != null ? currentUser.getRole().getName() : null;
                    // Admin can see all, regular users see only their own
                    if (!"ADMIN".equals(roleName) && !"DEPT_RESPONSIBLE".equals(roleName) &&
                        !request.employeeId().equals(currentUser.getId())) {
                        return Response.status(Response.Status.FORBIDDEN)
                            .entity(new ApiResponse<>("Not authorized to view this request", null))
                            .build();
                    }
                }
                return Response.ok(new ApiResponse<>("Request found", request)).build();
            })
            .orElse(Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiResponse<>("Request not found", null))
                .build());
    }

    @GET
    @Operation(summary = "Get all requests with pagination and filtering")
    public Response getAllRequests(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size,
            @QueryParam("status") String status,
            @QueryParam("search") String search,
            @QueryParam("employeeId") Long employeeId,
            @QueryParam("departmentId") Long departmentId) {

        Employee currentUser = authorizationUtils.extractUserFromToken(httpHeaders);

        // If employeeId is not provided, filter by current user's role
        Long effectiveEmployeeId = employeeId;
        Long effectiveDepartmentId = departmentId;

        if (currentUser != null) {
            String roleName = currentUser.getRole() != null ? currentUser.getRole().getName() : null;

            // DEPT_RESPONSIBLE can only see their own department
            if ("DEPT_RESPONSIBLE".equals(roleName) && currentUser.getDepartment() != null) {
                effectiveDepartmentId = currentUser.getDepartment().getId();
            }
            // Regular users see only their own requests
            else if (!"ADMIN".equals(roleName)) {
                effectiveEmployeeId = currentUser.getId();
            }
        }

        PaginatedResponse<RequestDTO> result;
        if (effectiveDepartmentId != null) {
            result = requestService.getAllByDepartment(page, size, status, search, effectiveDepartmentId);
        } else if (effectiveEmployeeId != null) {
            result = requestService.getAllByEmployee(page, size, status, null, search, effectiveEmployeeId);
        } else {
            result = requestService.getAll(page, size, status, null, search);
        }
        return Response.ok(
            new ApiResponse<>(
                "Requests retrieved successfully",
                result
            )
        ).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update request")
    public Response updateRequest(@PathParam("id") Long id, RequestDTO requestDTO) {
        Employee currentUser = authorizationUtils.extractUserFromToken(httpHeaders);

        // Check authorization before updating
        return requestRepository.findById(id)
            .map(existing -> {
                // Authorization check
                if (currentUser == null) {
                    return Response.status(Response.Status.UNAUTHORIZED)
                        .entity(new ApiResponse<>("Authentication required", null))
                        .build();
                }

                // Admin can update any request
                if (currentUser.getRole() != null && RoleEnum.isEqual(currentUser.getRole().getName(), RoleEnum.ADMIN)) {
                    // Proceed to version and update check
                } else if (currentUser.getRole() != null && RoleEnum.isEqual(currentUser.getRole().getName(), RoleEnum.DEPT_RESPONSIBLE)) {
                    // Dept responsible can only update requests from their department
                    if (currentUser.getDepartment() == null || existing.getEmployee() == null || existing.getEmployee().getDepartment() == null) {
                        return Response.status(Response.Status.FORBIDDEN)
                            .entity(new ApiResponse<>("Cannot verify department access", null))
                            .build();
                    }
                    if (!currentUser.getDepartment().getId().equals(existing.getEmployee().getDepartment().getId())) {
                        return Response.status(Response.Status.FORBIDDEN)
                            .entity(new ApiResponse<>("You can only update requests from your department", null))
                            .build();
                    }
                } else {
                    // Regular users can only update their own requests
                    if (existing.getEmployee() == null || !existing.getEmployee().getId().equals(currentUser.getId())) {
                        return Response.status(Response.Status.FORBIDDEN)
                            .entity(new ApiResponse<>("You can only update your own requests", null))
                            .build();
                    }
                }

                // Check version (optimistic locking)
                if (requestDTO.version() == null) {
                    return Response.status(Response.Status.BAD_REQUEST)
                        .entity(new ApiResponse<>("Version field is required for updates", null))
                        .build();
                }
                Long currentVersion = existing.getVersion() != null ? existing.getVersion() : 0L;
                if (!currentVersion.equals(requestDTO.version())) {
                    return Response.status(Response.Status.CONFLICT)
                        .entity(new ApiResponse<>(
                            "Item was updated by someone else. Please reload and try again.",
                            "Version mismatch: current=" + currentVersion + ", yours=" + requestDTO.version()))
                        .build();
                }

                // Check if locked by someone else (within 5 minutes)
                if (existing.getLockedBy() != null && existing.getLockedAt() != null) {
                    if (java.time.LocalDateTime.now().isBefore(existing.getLockedAt().plusMinutes(5))) {
                        if (!existing.getLockedBy().getId().equals(currentUser.getId())) {
                            return Response.status(Response.Status.CONFLICT)
                                .entity(new ApiResponse<>("Item is locked by " + existing.getLockedBy().getName() + " (locked 5 minutes ago)", null))
                                .build();
                        }
                    }
                }

                return requestService.update(id, requestDTO)
                    .map(dto -> Response.ok(
                        new ApiResponse<>(
                            "Request updated successfully",
                            dto)
                        )
                        .build()
                    ).orElse(Response.status(Response.Status.NOT_FOUND)
                        .entity(new ApiResponse<>("Request not found", null))
                        .build());
            })
            .orElse(Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiResponse<>("Request not found", null))
                .build());
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete request")
    public Response deleteRequest(@PathParam("id") Long id) {
        Employee currentUser = authorizationUtils.extractUserFromToken(httpHeaders);
        if (currentUser == null) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(new ApiResponse<>("Authentication required", null))
                .build();
        }

        String roleName = currentUser.getRole().getName();
        if (!"ADMIN".equals(roleName)) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(new ApiResponse<>("Only admins can delete requests", null))
                .build();
        }

        if (requestService.delete(id)) {
            return Response.noContent()
                .entity(new ApiResponse<>("Request deleted successfully", null))
                .build();
        }
        return Response.status(Response.Status.NOT_FOUND)
            .entity(new ApiResponse<>("Request not found", null))
            .build();
    }

    @POST
    @Path("/{id}/lock")
    @Operation(summary = "Acquire lock on request for editing")
    public Response acquireLock(@PathParam("id") Long id) {
        Employee currentUser = authorizationUtils.extractUserFromToken(httpHeaders);
        if (currentUser == null) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(new ApiResponse<>("Authentication required", null))
                .build();
        }

        return requestRepository
            .findById(id)
            .map(request -> {
                return requestService.get(id)
                    .map(dto -> Response.ok(new ApiResponse<>("Lock acquired",
                        new RequestDTO(dto.id(), dto.title(), dto.description(),
                            dto.status(), dto.createdAt(), dto.updatedAt(),
                            dto.employeeId(), dto.employeeName(), dto.departmentName(),
                            dto.assetId(), dto.acceptedBy(), dto.acceptedByName(), dto.acceptedAt(),
                            currentUser.getId(), currentUser.getName(), java.time.LocalDateTime.now(),
                            dto.version())))
                        .build())
                    .orElse(Response.status(Response.Status.NOT_FOUND)
                        .entity(new ApiResponse<>("Request not found", null))
                        .build());
            })
            .orElse(Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiResponse<>("Request not found", null))
                .build());
    }

    @DELETE
    @Path("/{id}/lock")
    @Operation(summary = "Release lock on request")
    public Response releaseLock(@PathParam("id") Long id) {
        Employee currentUser = authorizationUtils.extractUserFromToken(httpHeaders);
        if (currentUser == null) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(new ApiResponse<>("Authentication required", null))
                .build();
        }

        return requestRepository
            .findById(id)
            .map(request -> Response.ok(new ApiResponse<>("Lock released", null)).build())
            .orElse(Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiResponse<>("Request not found", null))
                .build());
    }
}

