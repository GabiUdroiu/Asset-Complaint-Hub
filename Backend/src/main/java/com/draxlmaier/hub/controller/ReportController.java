package com.draxlmaier.hub.controller;

// REST API endpoints for generating reports in PDF and CSV formats
import com.draxlmaier.hub.service.ReportService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
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

    @GET
    @Path("/complaints")
    @Produces("application/pdf")
    @Operation(summary = "Generate complaints report as PDF")
    public Response generateComplaintsReport(@QueryParam("exportAll") Boolean exportAll) {
        try {
            byte[] pdfContent = reportService.generateComplaintsReport(exportAll != null && exportAll);
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
    public Response generateComplaintsReportCsv(@QueryParam("exportAll") Boolean exportAll) {
        try {
            byte[] csvContent = reportService.generateComplaintsReportCsv(exportAll != null && exportAll);
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
    public Response generateAssetsReport(@QueryParam("exportAll") Boolean exportAll) {
        try {
            byte[] pdfContent = reportService.generateAssetsReport(exportAll != null && exportAll);
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
    public Response generateAssetsReportCsv(@QueryParam("exportAll") Boolean exportAll) {
        try {
            byte[] csvContent = reportService.generateAssetsReportCsv(exportAll != null && exportAll);
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
    public Response generateRequestsReport(@QueryParam("exportAll") Boolean exportAll) {
        try {
            byte[] pdfContent = reportService.generateRequestsReport(exportAll != null && exportAll);
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
    public Response generateRequestsReportCsv(@QueryParam("exportAll") Boolean exportAll) {
        try {
            byte[] csvContent = reportService.generateRequestsReportCsv(exportAll != null && exportAll);
            return Response.ok(csvContent)
                .header("Content-Disposition", "attachment; filename=\"requests_report.csv\"")
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("Error generating report: " + e.getMessage())
                .build();
        }
    }
}
