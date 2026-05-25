package com.draxlmaier.hub.controller;

import com.draxlmaier.hub.dto.ApiResponse;
import com.draxlmaier.hub.dto.RequestDTO;
import com.draxlmaier.hub.dto.PaginatedResponse;
import com.draxlmaier.hub.model.Request;
import com.draxlmaier.hub.service.IService;
import com.draxlmaier.hub.service.JwtTokenProvider;
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
    private JwtTokenProvider jwtTokenProvider;

    @Context
    private HttpHeaders httpHeaders;

    @POST
    @Operation(summary = "Create request")
    public Response createRequest(RequestDTO requestDTO) {
        if (!isAuthorized()) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(new ApiResponse<>("You are not authorized to create requests", null))
                .build();
        }
        RequestDTO created = requestService.create(requestDTO);
        return Response.status(Response.Status.CREATED)
            .entity(new ApiResponse<>("Request created successfully", created))
            .build();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get request by ID")
    public Response getRequest(@PathParam("id") Long id) {
        return requestService.get(id)
            .map(dto -> Response.ok(new ApiResponse<>("Request found", dto)).build())
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
            @QueryParam("employeeId") Long employeeId) {

        PaginatedResponse<RequestDTO> result = employeeId != null
            ? requestService.getAllByEmployee(page, size, status, search, employeeId)
            : requestService.getAll(page, size, status, search);
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
        if (!isAuthorized()) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(new ApiResponse<>("You are not authorized to update requests", null))
                .build();
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
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete request")
    public Response deleteRequest(@PathParam("id") Long id) {
        if (!isAuthorized()) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(new ApiResponse<>("You are not authorized to delete requests", null))
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
