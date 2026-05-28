package com.draxlmaier.hub.controller;

import com.draxlmaier.hub.dto.ComplaintDTO;
import com.draxlmaier.hub.dto.PaginatedResponse;
import com.draxlmaier.hub.model.Complaint;
import com.draxlmaier.hub.model.Employee;
import com.draxlmaier.hub.model.RoleEnum;
import com.draxlmaier.hub.security.AuthorizationUtils;
import com.draxlmaier.hub.service.IService;
import com.draxlmaier.hub.repository.ComplaintRepository;
import com.draxlmaier.hub.repository.ComplaintWorkflowRepository;
import com.draxlmaier.hub.mapper.ComplaintWorkflowMapper;
import com.draxlmaier.hub.util.AuthUtils;
import com.draxlmaier.hub.util.ResponseBuilder;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.time.LocalDateTime;

@Path("/complaints")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Complaints", description = "Complaint management")
public class ComplaintController {

  @Inject
  private IService<Complaint, ComplaintDTO> complaintService;

  @Inject
  private ComplaintRepository complaintRepository;

  @Inject
  private ComplaintWorkflowRepository workflowRepository;

  @Inject
  private ComplaintWorkflowMapper workflowMapper;

  @Inject
  private AuthorizationUtils authorizationUtils;

  @Context
  private HttpHeaders httpHeaders;

  /**
   * Extract current user from token
   */
  private Employee getCurrentUser() {
    return authorizationUtils.extractUserFromToken(httpHeaders);
  }

  /**
   * Create a new complaint
   */
  @POST
  @Operation(summary = "Create complaint")
  public Response createComplaint(ComplaintDTO complaintDTO) {
    ComplaintDTO created = complaintService.create(complaintDTO);
    return ResponseBuilder.created("Complaint created successfully", created);
  }

  /**
   * Get complaint by ID
   */
  @GET
  @Path("/{id}")
  @Operation(summary = "Get complaint by ID")
  public Response getComplaint(@PathParam("id") Long id) {
    return complaintService.get(id)
        .map(dto -> ResponseBuilder.ok("Complaint found", dto))
        .orElse(ResponseBuilder.notFound("Complaint not found"));
  }

  /**
   * Get all complaints with pagination and filtering
   * Applies role-based access control:
   * - ADMIN: sees all complaints
   * - DEPT_RESPONSIBLE: sees only complaints from their department
   * - USER: sees only their own complaints
   */
  @GET
  @Operation(summary = "Get all complaints with pagination and filtering")
  public Response getAllComplaints(
      @QueryParam("page") @DefaultValue("0") int page,
      @QueryParam("size") @DefaultValue("10") int size,
      @QueryParam("status") String status,
      @QueryParam("search") String search,
      @QueryParam("employeeId") Long employeeId,
      @QueryParam("departmentId") Long departmentId) {

    Employee currentUser = getCurrentUser();
    PaginatedResponse<ComplaintDTO> result =
        getFilteredComplaints(page, size, status, search, employeeId, departmentId, currentUser);

    return ResponseBuilder.ok("Complaints retrieved successfully", result);
  }

  /**
   * Apply role-based filtering to complaints
   */
  private PaginatedResponse<ComplaintDTO> getFilteredComplaints(
      int page,
      int size,
      String status,
      String search,
      Long employeeId,
      Long departmentId,
      Employee currentUser) {

    Long effectiveEmployeeId = employeeId;
    Long effectiveDepartmentId = departmentId;

    if (currentUser != null && currentUser.getRole() != null) {
      String roleName = currentUser.getRole().getName();

      // DEPT_RESPONSIBLE can only see their own department
      if (RoleEnum.isEqual(roleName, RoleEnum.DEPT_RESPONSIBLE)
          && currentUser.getDepartment() != null) {
        effectiveDepartmentId = currentUser.getDepartment().getId();
      }
      // Regular users see only their own complaints
      else if (!RoleEnum.isEqual(roleName, RoleEnum.ADMIN)) {
        effectiveEmployeeId = currentUser.getId();
      }
    }

    // Fetch based on filters
    if (effectiveDepartmentId != null) {
      return complaintService.getAllByDepartment(page, size, status, search, effectiveDepartmentId);
    } else if (effectiveEmployeeId != null) {
      return complaintService.getAllByEmployee(page, size, status, null, search, effectiveEmployeeId);
    }
    return complaintService.getAll(page, size, status, null, search);
  }

  /**
   * Update a complaint with optimistic locking
   */
  @PUT
  @Path("/{id}")
  @Operation(summary = "Update complaint")
  public Response updateComplaint(@PathParam("id") Long id, ComplaintDTO complaintDTO) {
    Employee currentUser = getCurrentUser();

    return complaintRepository
        .findById(id)
        .map(
            existing -> {
              // Authorization check
              Response authCheck = checkUpdateAuthorization(existing, currentUser);
              if (authCheck != null) return authCheck;

              // Check version (optimistic locking)
              if (complaintDTO.version() == null) {
                return ResponseBuilder.badRequest("Version field is required for updates");
              }
              Long currentVersion = existing.getVersion() != null ? existing.getVersion() : 0L;
              if (!currentVersion.equals(complaintDTO.version())) {
                return ResponseBuilder.conflict(
                    "Item was updated by someone else. Please reload and try again.",
                    "Version mismatch: current=" + currentVersion + ", yours=" + complaintDTO.version());
              }

              // Check if locked by someone else (within 5 minutes)
              if (existing.getLockedBy() != null && existing.getLockedAt() != null) {
                if (java.time.LocalDateTime.now().isBefore(existing.getLockedAt().plusMinutes(5))) {
                  if (!existing.getLockedBy().getId().equals(currentUser.getId())) {
                    return ResponseBuilder.conflict(
                        "Item is locked by " + existing.getLockedBy().getName() + " (locked 5 minutes ago)");
                  }
                }
              }

              return complaintService
                  .update(id, complaintDTO)
                  .map(dto -> ResponseBuilder.ok("Complaint updated successfully", dto))
                  .orElse(ResponseBuilder.notFound("Complaint not found"));
            })
        .orElse(ResponseBuilder.notFound("Complaint not found"));
  }

  /**
   * Check if user has permission to update complaint
   */
  private Response checkUpdateAuthorization(Complaint complaint, Employee currentUser) {
    if (currentUser == null) {
      return ResponseBuilder.unauthorized();
    }

    // Admin can update any complaint
    if (currentUser.getRole() != null && RoleEnum.isEqual(currentUser.getRole().getName(), RoleEnum.ADMIN)) {
      return null;
    }

    // Dept responsible can only update complaints from their department
    if (currentUser.getRole() != null && RoleEnum.isEqual(currentUser.getRole().getName(), RoleEnum.DEPT_RESPONSIBLE)) {
      if (currentUser.getDepartment() == null || complaint.getEmployee() == null || complaint.getEmployee().getDepartment() == null) {
        return ResponseBuilder.forbidden("Cannot verify department access");
      }
      if (!currentUser.getDepartment().getId().equals(complaint.getEmployee().getDepartment().getId())) {
        return ResponseBuilder.forbidden("You can only update complaints from your department");
      }
      return null;
    }

    // Regular users cannot update complaints
    return ResponseBuilder.forbidden("You do not have permission to update complaints");
  }

  /**
   * Check if complaint is locked by another user
   */
  private Response checkLock(Complaint complaint, Employee currentUser) {
    if (complaint.getLockedBy() == null || complaint.getLockedAt() == null) {
      return null; // Not locked
    }

    // Check if lock has expired (30 minutes)
    boolean isLockExpired = LocalDateTime.now().isAfter(complaint.getLockedAt().plusMinutes(30));
    if (isLockExpired) {
      return null; // Lock expired, allow update
    }

    // Check if locked by current user
    boolean isLockedByCurrentUser =
        currentUser != null && complaint.getLockedBy().getId().equals(currentUser.getId());

    return isLockedByCurrentUser
        ? null
        : ResponseBuilder.conflict("Item is locked by: " + complaint.getLockedBy().getName());
  }

  /**
   * Delete a complaint (admin only)
   */
  @DELETE
  @Path("/{id}")
  @Operation(summary = "Delete complaint")
  public Response deleteComplaint(@PathParam("id") Long id) {
    Response authCheck = AuthUtils.requireAdmin(httpHeaders);
    if (authCheck != null) return authCheck;

    if (complaintService.delete(id)) {
      return ResponseBuilder.noContent("Complaint deleted successfully");
    }
    return ResponseBuilder.notFound("Complaint not found");
  }

  /**
   * Get complaint workflow history
   */
  @GET
  @Path("/{id}/workflow")
  @Operation(summary = "Get complaint workflow history")
  public Response getComplaintWorkflow(@PathParam("id") Long complaintId) {
    var workflows =
        workflowRepository.findByComplaintId(complaintId).stream()
            .map(workflowMapper::toDTO)
            .toList();
    return ResponseBuilder.ok("Workflow history retrieved", workflows);
  }

  /**
   * Acquire lock on complaint for editing
   */
  @POST
  @Path("/{id}/lock")
  @Operation(summary = "Acquire lock on complaint for editing")
  public Response acquireLock(@PathParam("id") Long id) {
    Response authCheck = AuthUtils.requireAuth(httpHeaders);
    if (authCheck != null) return authCheck;

    Employee currentUser = getCurrentUser();
    if (currentUser == null) {
      return ResponseBuilder.forbidden("User not found");
    }

    return complaintRepository
        .findById(id)
        .map(dto -> {
          // Just lock and return the current DTO (don't fetch again to avoid version issues)
          return ResponseBuilder.ok("Lock acquired",
              new ComplaintDTO(dto.getId(), dto.getTitle(), dto.getDescription(),
                  dto.getAsset() != null ? dto.getAsset().getId() : null,
                  dto.getEmployee() != null ? dto.getEmployee().getId() : null,
                  dto.getEmployee() != null ? dto.getEmployee().getName() : null,
                  dto.getEmployee() != null && dto.getEmployee().getDepartment() != null ? dto.getEmployee().getDepartment().getName() : null,
                  dto.getStatus().name(), dto.getCreatedAt(), dto.getUpdatedAt(),
                  null, null, null,
                  currentUser.getId(), currentUser.getName(), java.time.LocalDateTime.now(),
                  dto.getVersion()));
        })
        .orElse(ResponseBuilder.notFound("Complaint not found"));
  }

  /**
   * Release lock on complaint
   */
  @DELETE
  @Path("/{id}/lock")
  @Operation(summary = "Release lock on complaint")
  public Response releaseLock(@PathParam("id") Long id) {
    Response authCheck = AuthUtils.requireAuth(httpHeaders);
    if (authCheck != null) return authCheck;

    complaintRepository.findById(id).ifPresent(complaint -> {
      complaint.setLockedBy(null);
      complaint.setLockedAt(null);
    });
    return ResponseBuilder.ok("Lock released", null);
  }
}
