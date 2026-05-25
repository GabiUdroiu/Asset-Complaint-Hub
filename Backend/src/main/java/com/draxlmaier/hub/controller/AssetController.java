package com.draxlmaier.hub.controller;

import com.draxlmaier.hub.dto.ApiResponse;
import com.draxlmaier.hub.dto.AssetDTO;
import com.draxlmaier.hub.dto.PaginatedResponse;
import com.draxlmaier.hub.model.Asset;
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

@Path("/assets")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Assets", description = "Asset management")
public class AssetController {

    @Inject
    private IService<Asset, AssetDTO> assetService;

    @Inject
    private JwtTokenProvider jwtTokenProvider;

    @Context
    private HttpHeaders httpHeaders;

    @POST
    @Operation(summary = "Create asset")
    public Response createAsset(AssetDTO assetDTO) {
        if (!isAuthorized()) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(new ApiResponse<>("You are not authorized to create assets", null))
                .build();
        }
        AssetDTO created = assetService.create(assetDTO);
        return Response.status(Response.Status.CREATED)
            .entity(new ApiResponse<>("Asset created successfully", created))
            .build();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get asset by ID")
    public Response getAsset(@PathParam("id") Long id) {
        return assetService.get(id)
            .map(dto -> Response.ok(new ApiResponse<>("Asset found", dto)).build())
            .orElse(Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiResponse<>("Asset not found", null))
                .build());
    }

    @GET
    @Operation(summary = "Get all assets with pagination and filtering")
    public Response getAllAssets(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size,
            @QueryParam("status") String status,
            @QueryParam("category") String category,
            @QueryParam("search") String search,
            @QueryParam("employeeId") Long employeeId) {

        PaginatedResponse<AssetDTO> result = employeeId != null
            ? assetService.getAllByEmployee(page, size, status, search, employeeId)
            : assetService.getAll(page, size, status, search);
        return Response.ok(
            new ApiResponse<>(
                "Assets retrieved successfully",
                result
            )
        ).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update asset")
    public Response updateAsset(@PathParam("id") Long id, AssetDTO assetDTO) {
        if (!isAuthorized()) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(new ApiResponse<>("You are not authorized to update assets", null))
                .build();
        }
        return assetService.update(id, assetDTO)
            .map(dto -> Response.ok(
                new ApiResponse<AssetDTO>(
                    "Asset updated successfully",
                     dto)
                    )
                .build()
            ).orElse(Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiResponse<>("Asset not found", null))
                .build());
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete asset")
    public Response deleteAsset(@PathParam("id") Long id) {
        if (!isAuthorized()) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(new ApiResponse<>("You are not authorized to delete assets", null))
                .build();
        }
        if (assetService.delete(id)) {
            return Response.noContent()
                .entity(new ApiResponse<>("Asset deleted successfully", null))
                .build();
        }
        return Response.status(Response.Status.NOT_FOUND)
            .entity(new ApiResponse<>("Asset not found", null))
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
