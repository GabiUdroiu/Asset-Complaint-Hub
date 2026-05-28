package com.draxlmaier.hub.controller;

import com.draxlmaier.hub.dto.ApiResponse;
import com.draxlmaier.hub.dto.AssetDTO;
import com.draxlmaier.hub.dto.PaginatedResponse;
import com.draxlmaier.hub.model.Asset;
import com.draxlmaier.hub.model.Employee;
import com.draxlmaier.hub.repository.EmployeeRepository;
import com.draxlmaier.hub.security.AuthorizationUtils;
import com.draxlmaier.hub.service.IService;
import com.draxlmaier.hub.util.JwtTokenProvider;
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

    @Inject
    private AuthorizationUtils authorizationUtils;

    @Inject
    private EmployeeRepository employeeRepository;

    @Context
    private HttpHeaders httpHeaders;

    @POST
    @Operation(summary = "Create asset")
    public Response createAsset(AssetDTO assetDTO) {
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
            @QueryParam("employeeId") Long employeeId,
            @QueryParam("departmentId") Long departmentId,
            @QueryParam("unfiltered") @DefaultValue("false") boolean unfiltered) {

        Employee currentUser = authorizationUtils.extractUserFromToken(httpHeaders);

        Long effectiveEmployeeId = employeeId;
        Long effectiveDepartmentId = departmentId;

        if (!unfiltered && currentUser != null) {
            String roleName = currentUser.getRole() != null ? currentUser.getRole().getName() : null;

            // DEPT_RESPONSIBLE can only see their own department
            if ("DEPT_RESPONSIBLE".equals(roleName) && currentUser.getDepartment() != null) {
                effectiveDepartmentId = currentUser.getDepartment().getId();
            }
            // Regular users see only their own assets
            else if (!"ADMIN".equals(roleName)) {
                effectiveEmployeeId = currentUser.getId();
            }
        }

        PaginatedResponse<AssetDTO> result;
        if (effectiveDepartmentId != null) {
            result = assetService.getAllByDepartment(page, size, status, search, effectiveDepartmentId);
        } else if (effectiveEmployeeId != null) {
            result = assetService.getAllByEmployee(page, size, status, category, search, effectiveEmployeeId);
        } else {
            result = assetService.getAll(page, size, status, category, search);
        }
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
        return assetService.update(id, assetDTO)
            .map(dto -> Response.ok(
                new ApiResponse<>(
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
        Employee currentUser = authorizationUtils.extractUserFromToken(httpHeaders);
        if (currentUser == null) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(new ApiResponse<>("Authentication required", null))
                .build();
        }

        String roleName = currentUser.getRole().getName();
        if (!"ADMIN".equals(roleName)) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(new ApiResponse<>("Only admins can delete assets", null))
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
}
