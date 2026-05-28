package com.draxlmaier.hub.controller;

import com.draxlmaier.hub.dto.ApiResponse;
import com.draxlmaier.hub.dto.AssignmentTaskDTO;
import com.draxlmaier.hub.dto.PaginatedResponse;
import com.draxlmaier.hub.service.AssignmentTaskService;
import com.draxlmaier.hub.util.JwtTokenProvider;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Optional;

@Path("/assignment-tasks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AssignmentTaskController {

    @Inject
    private AssignmentTaskService assignmentTaskService;

    @Inject
    private JwtTokenProvider jwtTokenProvider;

    @Context
    private HttpHeaders httpHeaders;

    @POST
    public Response create(AssignmentTaskDTO dto) {
        try {
            AssignmentTaskDTO created = assignmentTaskService.create(dto);
            return Response.status(Response.Status.CREATED).entity(created).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error creating assignment task: " + e.getMessage()).build();
        }
    }

    @GET
    @Path("/{id}")
    public Response get(@PathParam("id") Long id) {
        Optional<AssignmentTaskDTO> task = assignmentTaskService.get(id);
        if (task.isPresent()) {
            return Response.ok(task.get()).build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }

    @GET
    public Response getAll(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size,
            @QueryParam("sortBy") @DefaultValue("acceptedAt") String sortBy,
            @QueryParam("sortOrder") @DefaultValue("DESC") String sortOrder) {
        PaginatedResponse<AssignmentTaskDTO> response = assignmentTaskService.getAll(page, size, sortBy, sortOrder);
        return Response.ok(new ApiResponse<>("Tasks retrieved", response)).build();
    }

    @GET
    @Path("/item/{itemType}/{itemId}")
    public Response getByItemTypeAndItemId(
            @PathParam("itemType") String itemType,
            @PathParam("itemId") Long itemId) {
        Optional<AssignmentTaskDTO> task = assignmentTaskService.getByItemTypeAndItemId(itemType, itemId);
        return Response.ok(task.orElse(null)).build();
    }

    @GET
    @Path("/by-type/{itemType}")
    public Response getByItemType(
            @PathParam("itemType") String itemType,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size) {
        PaginatedResponse<AssignmentTaskDTO> response = assignmentTaskService.getByItemType(itemType, page, size);
        return Response.ok(response).build();
    }

    @GET
    @Path("/by-user/{acceptedBy}")
    public Response getByAcceptedBy(
            @PathParam("acceptedBy") Long acceptedBy,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size) {
        PaginatedResponse<AssignmentTaskDTO> response = assignmentTaskService.getByAcceptedBy(acceptedBy, page, size);
        return Response.ok(response).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, AssignmentTaskDTO dto) {
        Optional<AssignmentTaskDTO> updated = assignmentTaskService.update(id, dto);
        if (updated.isPresent()) {
            return Response.ok(updated.get()).build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        if (!isAuthorizedToAssignTask()) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("You are not authorized to delete assignment tasks").build();
        }

        if (assignmentTaskService.delete(id)) {
            return Response.noContent().build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }

    private boolean isAuthorizedToAssignTask() {
        String authHeader = httpHeaders.getHeaderString("Authorization");
        if (authHeader == null || authHeader.isEmpty()) {
            return false;
        }

        try {
            String token = authHeader.startsWith("Bearer ")
                ? authHeader.substring(7)
                : authHeader;
            String role = jwtTokenProvider.getRoleFromToken(token);
            String roleUpper = role != null ? role.toUpperCase() : "";
            return roleUpper.contains("ADMIN") || roleUpper.contains("DEPT_RESPONSIBLE") || roleUpper.contains("RESPONSIBLE");
        } catch (Exception e) {
            return false;
        }
    }
}
