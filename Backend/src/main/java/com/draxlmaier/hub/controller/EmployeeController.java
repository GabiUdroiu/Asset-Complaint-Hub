package com.draxlmaier.hub.controller;

import com.draxlmaier.hub.dto.ApiResponse;
import com.draxlmaier.hub.dto.EmployeeDTO;
import com.draxlmaier.hub.dto.PaginatedResponse;
import com.draxlmaier.hub.model.Employee;
import com.draxlmaier.hub.service.IService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/employees")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Employees", description = "Employee management")
public class EmployeeController {

    @Inject
    private IService<Employee, EmployeeDTO> employeeService;

    @POST
    @Operation(summary = "Create employee")
    public Response createEmployee(EmployeeDTO employeeDTO) {
        EmployeeDTO created = employeeService.create(employeeDTO);
        return Response.status(Response.Status.CREATED)
            .entity(new ApiResponse<>("Employee created successfully", created))
            .build();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get employee by ID")
    public Response getEmployee(@PathParam("id") Long id) {
        return employeeService.get(id)
            .map(dto -> Response.ok(new ApiResponse<>("Employee found", dto)).build())
            .orElse(Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiResponse<>("Employee not found", null))
                .build());
    }

    @GET
    @Operation(summary = "Get all employees with pagination and filtering")
    public Response getAllEmployees(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size,
            @QueryParam("role") String role,
            @QueryParam("search") String search) {

        PaginatedResponse<EmployeeDTO> result = employeeService.getAll(page, size, role, search);
        return Response.ok(
            new ApiResponse<>(
                "Employees retrieved successfully",
                result
            )
        ).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update employee")
    public Response updateEmployee(@PathParam("id") Long id, EmployeeDTO employeeDTO) {
        return employeeService.update(id, employeeDTO)
            .map(dto -> Response.ok(
                new ApiResponse<>(
                    "Employee updated successfully",
                    dto)
                )
                .build()
            ).orElse(Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiResponse<>("Employee not found", null))
                .build());
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete employee")
    public Response deleteEmployee(@PathParam("id") Long id) {
        if (employeeService.delete(id)) {
            return Response.noContent()
                .entity(new ApiResponse<>("Employee deleted successfully", null))
                .build();
        }
        return Response.status(Response.Status.NOT_FOUND)
            .entity(new ApiResponse<>("Employee not found", null))
            .build();
    }
}
