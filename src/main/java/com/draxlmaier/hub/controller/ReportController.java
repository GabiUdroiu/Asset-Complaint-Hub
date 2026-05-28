package com.draxlmaier.hub.controller;

// REST API endpoints for generating reports in PDF and CSV formats
import com.draxlmaier.hub.dto.ApiResponse;
import com.draxlmaier.hub.model.Employee;
import com.draxlmaier.hub.model.RoleEnum;
import com.draxlmaier.hub.service.ReportService;
import com.draxlmaier.hub.security.AuthorizationUtils;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/reports")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Reports", description = "Report generation")
public class ReportController {

    @Inject
    private ReportService reportService;

    @Inject
    private AuthorizationUtils authorizationUtils;

    @Context
    private HttpHeaders httpHeaders;

    @GET
    @Path("/complaints")
    @Produces("application/pdf")
    @Operation(summary = "Generate complaints report as PDF")
    public Response generateComplaintsReport(
            @QueryParam("exportAll") Boolean exportAll,
            @QueryParam("status") String status,
            @QueryParam("search") String search,
            @QueryParam("departmentId") Long departmentId,
            @QueryParam("employeeId") Long employeeId) {
        try {
            Employee currentUser = authorizationUtils.extractUserFromToken(httpHeaders);
            if (currentUser == null) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ApiResponse<>("Authentication required", null))
                    .build();
            }

            Long effectiveDepartmentId = departmentId;
            Long effectiveEmployeeId = employeeId;
            boolean actuallyExportAll = false;

            if (currentUser.getRole() != null) {
                String roleName = currentUser.getRole().getName();
                // Admin can export all data
                if (RoleEnum.isEqual(roleName, RoleEnum.ADMIN)) {
                    actuallyExportAll = exportAll != null && exportAll;
                }
                // Dept responsible can only export their department
                else if (RoleEnum.isEqual(roleName, RoleEnum.DEPT_RESPONSIBLE)) {
                    if (currentUser.getDepartment() != null) {
                        effectiveDepartmentId = currentUser.getDepartment().getId();
                    }
                    actuallyExportAll = false;
                }
                // Regular users can only export their own data
                else {
                    effectiveEmployeeId = currentUser.getId();
                }
            }

            byte[] pdfContent = reportService.generateComplaintsReport(
                actuallyExportAll, status, search, effectiveDepartmentId, effectiveEmployeeId);
            return Response.ok(pdfContent)
                .header("Content-Disposition", "attachment; filename=\"complaints_report.pdf\"")
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error generating report: " + e.getMessage())
                .build();
        }
    }

    @GET
    @Path("/complaints/csv")
    @Produces("text/csv")
    @Operation(summary = "Generate complaints report as CSV")
    public Response generateComplaintsReportCsv(
            @QueryParam("exportAll") Boolean exportAll,
            @QueryParam("status") String status,
            @QueryParam("search") String search,
            @QueryParam("departmentId") Long departmentId,
            @QueryParam("employeeId") Long employeeId) {
        try {
            Employee currentUser = authorizationUtils.extractUserFromToken(httpHeaders);
            if (currentUser == null) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ApiResponse<>("Authentication required", null))
                    .build();
            }

            Long effectiveDepartmentId = departmentId;
            Long effectiveEmployeeId = employeeId;
            boolean actuallyExportAll = false;

            if (currentUser.getRole() != null) {
                String roleName = currentUser.getRole().getName();
                if (RoleEnum.isEqual(roleName, RoleEnum.ADMIN)) {
                    actuallyExportAll = exportAll != null && exportAll;
                }
                else if (RoleEnum.isEqual(roleName, RoleEnum.DEPT_RESPONSIBLE)) {
                    if (currentUser.getDepartment() != null) {
                        effectiveDepartmentId = currentUser.getDepartment().getId();
                    }
                    actuallyExportAll = false;
                }
                else {
                    effectiveEmployeeId = currentUser.getId();
                }
            }

            byte[] csvContent = reportService.generateComplaintsReportCsv(
                actuallyExportAll, status, search, effectiveDepartmentId, effectiveEmployeeId);
            return Response.ok(csvContent)
                .header("Content-Disposition", "attachment; filename=\"complaints_report.csv\"")
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error generating report: " + e.getMessage())
                .build();
        }
    }

    @GET
    @Path("/assets")
    @Produces("application/pdf")
    @Operation(summary = "Generate assets report as PDF")
    public Response generateAssetsReport(
            @QueryParam("exportAll") Boolean exportAll,
            @QueryParam("status") String status,
            @QueryParam("search") String search,
            @QueryParam("category") String category,
            @QueryParam("departmentId") Long departmentId,
            @QueryParam("employeeId") Long employeeId) {
        try {
            Employee currentUser = authorizationUtils.extractUserFromToken(httpHeaders);
            if (currentUser == null) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ApiResponse<>("Authentication required", null))
                    .build();
            }

            Long effectiveDepartmentId = departmentId;
            Long effectiveEmployeeId = employeeId;
            boolean actuallyExportAll = false;

            if (currentUser.getRole() != null) {
                String roleName = currentUser.getRole().getName();
                if (RoleEnum.isEqual(roleName, RoleEnum.ADMIN)) {
                    actuallyExportAll = exportAll != null && exportAll;
                }
                else if (RoleEnum.isEqual(roleName, RoleEnum.DEPT_RESPONSIBLE)) {
                    if (currentUser.getDepartment() != null) {
                        effectiveDepartmentId = currentUser.getDepartment().getId();
                    }
                    actuallyExportAll = false;
                }
                else {
                    effectiveEmployeeId = currentUser.getId();
                }
            }

            byte[] pdfContent = reportService.generateAssetsReport(
                actuallyExportAll, status, search, category, effectiveDepartmentId, effectiveEmployeeId);
            return Response.ok(pdfContent)
                .header("Content-Disposition", "attachment; filename=\"assets_report.pdf\"")
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error generating report: " + e.getMessage())
                .build();
        }
    }

    @GET
    @Path("/assets/csv")
    @Produces("text/csv")
    @Operation(summary = "Generate assets report as CSV")
    public Response generateAssetsReportCsv(
            @QueryParam("exportAll") Boolean exportAll,
            @QueryParam("status") String status,
            @QueryParam("search") String search,
            @QueryParam("category") String category,
            @QueryParam("departmentId") Long departmentId,
            @QueryParam("employeeId") Long employeeId) {
        try {
            Employee currentUser = authorizationUtils.extractUserFromToken(httpHeaders);
            if (currentUser == null) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ApiResponse<>("Authentication required", null))
                    .build();
            }

            Long effectiveDepartmentId = departmentId;
            Long effectiveEmployeeId = employeeId;
            boolean actuallyExportAll = false;

            if (currentUser.getRole() != null) {
                String roleName = currentUser.getRole().getName();
                if (RoleEnum.isEqual(roleName, RoleEnum.ADMIN)) {
                    actuallyExportAll = exportAll != null && exportAll;
                }
                else if (RoleEnum.isEqual(roleName, RoleEnum.DEPT_RESPONSIBLE)) {
                    if (currentUser.getDepartment() != null) {
                        effectiveDepartmentId = currentUser.getDepartment().getId();
                    }
                    actuallyExportAll = false;
                }
                else {
                    return Response.status(Response.Status.FORBIDDEN)
                        .entity(new ApiResponse<>("You do not have permission to export reports", null))
                        .build();
                }
            }

            byte[] csvContent = reportService.generateAssetsReportCsv(
                actuallyExportAll, status, search, category, effectiveDepartmentId, effectiveEmployeeId);
            return Response.ok(csvContent)
                .header("Content-Disposition", "attachment; filename=\"assets_report.csv\"")
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error generating report: " + e.getMessage())
                .build();
        }
    }

    @GET
    @Path("/requests")
    @Produces("application/pdf")
    @Operation(summary = "Generate requests report as PDF")
    public Response generateRequestsReport(
            @QueryParam("exportAll") Boolean exportAll,
            @QueryParam("status") String status,
            @QueryParam("search") String search,
            @QueryParam("departmentId") Long departmentId,
            @QueryParam("employeeId") Long employeeId) {
        try {
            Employee currentUser = authorizationUtils.extractUserFromToken(httpHeaders);
            if (currentUser == null) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ApiResponse<>("Authentication required", null))
                    .build();
            }

            Long effectiveDepartmentId = departmentId;
            Long effectiveEmployeeId = employeeId;
            boolean actuallyExportAll = false;

            if (currentUser.getRole() != null) {
                String roleName = currentUser.getRole().getName();
                if (RoleEnum.isEqual(roleName, RoleEnum.ADMIN)) {
                    actuallyExportAll = exportAll != null && exportAll;
                }
                else if (RoleEnum.isEqual(roleName, RoleEnum.DEPT_RESPONSIBLE)) {
                    if (currentUser.getDepartment() != null) {
                        effectiveDepartmentId = currentUser.getDepartment().getId();
                    }
                    actuallyExportAll = false;
                }
                else {
                    return Response.status(Response.Status.FORBIDDEN)
                        .entity(new ApiResponse<>("You do not have permission to export reports", null))
                        .build();
                }
            }

            byte[] pdfContent = reportService.generateRequestsReport(
                actuallyExportAll, status, search, effectiveDepartmentId, effectiveEmployeeId);
            return Response.ok(pdfContent)
                .header("Content-Disposition", "attachment; filename=\"requests_report.pdf\"")
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error generating report: " + e.getMessage())
                .build();
        }
    }

    @GET
    @Path("/requests/csv")
    @Produces("text/csv")
    @Operation(summary = "Generate requests report as CSV")
    public Response generateRequestsReportCsv(
            @QueryParam("exportAll") Boolean exportAll,
            @QueryParam("status") String status,
            @QueryParam("search") String search,
            @QueryParam("departmentId") Long departmentId,
            @QueryParam("employeeId") Long employeeId) {
        try {
            Employee currentUser = authorizationUtils.extractUserFromToken(httpHeaders);
            if (currentUser == null) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ApiResponse<>("Authentication required", null))
                    .build();
            }

            Long effectiveDepartmentId = departmentId;
            Long effectiveEmployeeId = employeeId;
            boolean actuallyExportAll = false;

            if (currentUser.getRole() != null) {
                String roleName = currentUser.getRole().getName();
                if (RoleEnum.isEqual(roleName, RoleEnum.ADMIN)) {
                    actuallyExportAll = exportAll != null && exportAll;
                }
                else if (RoleEnum.isEqual(roleName, RoleEnum.DEPT_RESPONSIBLE)) {
                    if (currentUser.getDepartment() != null) {
                        effectiveDepartmentId = currentUser.getDepartment().getId();
                    }
                    actuallyExportAll = false;
                }
                else {
                    return Response.status(Response.Status.FORBIDDEN)
                        .entity(new ApiResponse<>("You do not have permission to export reports", null))
                        .build();
                }
            }

            byte[] csvContent = reportService.generateRequestsReportCsv(
                actuallyExportAll, status, search, effectiveDepartmentId, effectiveEmployeeId);
            return Response.ok(csvContent)
                .header("Content-Disposition", "attachment; filename=\"requests_report.csv\"")
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error generating report: " + e.getMessage())
                .build();
        }
    }

    @GET
    @Path("/activity")
    @Operation(summary = "Get activity report")
    public Response getActivityReport() {
        try {
            return Response.ok(reportService.getActivitySummary()).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error generating activity report: " + e.getMessage())
                .build();
        }
    }

    @GET
    @Path("/employees/csv")
    @Produces("text/csv")
    @Operation(summary = "Generate employees report as CSV")
    public Response generateEmployeesReportCsv(
            @QueryParam("search") String search) {
        try {
            byte[] csvContent = reportService.generateEmployeesReportCsv(search);
            return Response.ok(csvContent)
                .header("Content-Disposition", "attachment; filename=\"employees_report.csv\"")
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error generating report: " + e.getMessage())
                .build();
        }
    }

    @GET
    @Path("/departments/csv")
    @Produces("text/csv")
    @Operation(summary = "Generate departments report as CSV")
    public Response generateDepartmentsReportCsv(
            @QueryParam("search") String search) {
        try {
            byte[] csvContent = reportService.generateDepartmentsReportCsv(search);
            return Response.ok(csvContent)
                .header("Content-Disposition", "attachment; filename=\"departments_report.csv\"")
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error generating report: " + e.getMessage())
                .build();
        }
    }

    @GET
    @Path("/activity/csv")
    @Produces("text/csv")
    @Operation(summary = "Generate activity report as CSV")
    public Response generateActivityReportCsv(
            @QueryParam("search") String search) {
        try {
            byte[] csvContent = reportService.generateActivityReportCsv(search);
            return Response.ok(csvContent)
                .header("Content-Disposition", "attachment; filename=\"activity_report.csv\"")
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error generating report: " + e.getMessage())
                .build();
        }
    }
}
