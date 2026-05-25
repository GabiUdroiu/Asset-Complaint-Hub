package com.draxlmaier.hub.controller;

import com.draxlmaier.hub.dto.ApiResponse;
import com.draxlmaier.hub.dto.ComplaintDTO;
import com.draxlmaier.hub.dto.PaginatedResponse;
import com.draxlmaier.hub.model.Complaint;
import com.draxlmaier.hub.service.IService;
import com.draxlmaier.hub.repository.ComplaintWorkflowRepository;
import com.draxlmaier.hub.mapper.ComplaintWorkflowMapper;
import com.draxlmaier.hub.service.JwtTokenProvider;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/complaints")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Complaints", description = "Complaint management")
public class ComplaintController {

    @Inject
    private IService<Complaint, ComplaintDTO> complaintService;

    @Inject
    private ComplaintWorkflowRepository workflowRepository;

    @Inject
    private ComplaintWorkflowMapper workflowMapper;

    @Inject
    private JwtTokenProvider jwtTokenProvider;

    @Context
    private HttpHeaders httpHeaders;

    @POST
    @Operation(summary = "Create complaint")
    public Response createComplaint(ComplaintDTO complaintDTO) {
        if (!isAuthorized()) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(new ApiResponse<>("You are not authorized to create complaints", null))
                .build();
        }
        ComplaintDTO created = complaintService.create(complaintDTO);
        return Response.status(Response.Status.CREATED)
            .entity(new ApiResponse<>("Complaint created successfully", created))
            .build();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get complaint by ID")
    public Response getComplaint(@PathParam("id") Long id) {
        return complaintService.get(id)
            .map(dto -> Response.ok(new ApiResponse<>("Complaint found", dto)).build())
            .orElse(Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiResponse<>("Complaint not found", null))
                .build());
    }

    @GET
    @Operation(summary = "Get all complaints with pagination and filtering")
    public Response getAllComplaints(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size,
            @QueryParam("status") String status,
            @QueryParam("search") String search,
            @QueryParam("employeeId") Long employeeId) {

        PaginatedResponse<ComplaintDTO> result = employeeId != null
            ? complaintService.getAllByEmployee(page, size, status, search, employeeId)
            : complaintService.getAll(page, size, status, search);
        return Response.ok(
            new ApiResponse<>(
                "Complaints retrieved successfully",
                result
            )
        ).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update complaint")
    public Response updateComplaint(@PathParam("id") Long id, ComplaintDTO complaintDTO) {
        if (!isAuthorized()) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(new ApiResponse<>("You are not authorized to update complaints", null))
                .build();
        }
        return complaintService.update(id, complaintDTO)
            .map(dto -> Response.ok(
                new ApiResponse<>(
                    "Complaint updated successfully",
                    dto)
                )
                .build()
            ).orElse(Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiResponse<>("Complaint not found", null))
                .build());
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete complaint")
    public Response deleteComplaint(@PathParam("id") Long id) {
        if (complaintService.delete(id)) {
            return Response.noContent()
                .entity(new ApiResponse<>("Complaint deleted successfully", null))
                .build();
        }
        return Response.status(Response.Status.NOT_FOUND)
            .entity(new ApiResponse<>("Complaint not found", null))
            .build();
    }

    @GET
    @Path("/{id}/workflow")
    @Operation(summary = "Get complaint workflow history")
    public Response getComplaintWorkflow(@PathParam("id") Long complaintId) {
        var workflows = workflowRepository.findByComplaintId(complaintId)
            .stream()
            .map(workflowMapper::toDTO)
            .toList();
        return Response.ok(new ApiResponse<>("Workflow history retrieved", workflows)).build();
    }

    private boolean isAuthorized() {
        String authHeader = httpHeaders.getHeaderString("Authorization");
        if (authHeader == null || authHeader.isEmpty()) {
            return false;
        }
        try {
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            String role = jwtTokenProvider.getRoleFromToken(token);
            return "ADMIN".equals(role) || "DEPT_RESPONSIBLE".equals(role);
        } catch (Exception e) {
            return false;
        }
    }
}
