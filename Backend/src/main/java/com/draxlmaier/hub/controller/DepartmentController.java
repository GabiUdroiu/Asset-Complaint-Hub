package com.draxlmaier.hub.controller;

import com.draxlmaier.hub.dto.ApiResponse;
import com.draxlmaier.hub.dto.DepartmentDTO;
import com.draxlmaier.hub.dto.PaginatedResponse;
import com.draxlmaier.hub.model.Department;
import com.draxlmaier.hub.service.IService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/departments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Departments", description = "Department management")
public class DepartmentController {

    @Inject
    private IService<Department, DepartmentDTO> departmentService;

    @POST
    @Operation(summary = "Create department")
    public Response createDepartment(DepartmentDTO departmentDTO) {
        DepartmentDTO created = departmentService.create(departmentDTO);
        return Response.status(Response.Status.CREATED)
            .entity(new ApiResponse<>("Department created successfully", created))
            .build();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get department by ID")
    public Response getDepartment(@PathParam("id") Long id) {
        return departmentService.get(id)
            .map(dto -> Response.ok(new ApiResponse<>("Department found", dto)).build())
            .orElse(Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiResponse<>("Department not found", null))
                .build());
    }

    @GET
    @Operation(summary = "Get all departments with pagination and filtering")
    public Response getAllDepartments(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size,
            @QueryParam("search") String search) {

        PaginatedResponse<DepartmentDTO> result = departmentService.getAll(page, size, null, search);
        return Response.ok(
            new ApiResponse<>(
                "Departments retrieved successfully",
                result
            )
        ).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update department")
    public Response updateDepartment(@PathParam("id") Long id, DepartmentDTO departmentDTO) {
        return departmentService.update(id, departmentDTO)
            .map(dto -> Response.ok(
                new ApiResponse<>(
                    "Department updated successfully",
                    dto)
                )
                .build()
            ).orElse(Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiResponse<>("Department not found", null))
                .build());
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete department")
    public Response deleteDepartment(@PathParam("id") Long id) {
        if (departmentService.delete(id)) {
            return Response.noContent()
                .entity(new ApiResponse<>("Department deleted successfully", null))
                .build();
        }
        return Response.status(Response.Status.NOT_FOUND)
            .entity(new ApiResponse<>("Department not found", null))
            .build();
    }
}
