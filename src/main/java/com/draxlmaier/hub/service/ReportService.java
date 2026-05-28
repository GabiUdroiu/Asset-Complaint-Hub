package com.draxlmaier.hub.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.TextAlignment;
import com.draxlmaier.hub.model.Complaint;
import com.draxlmaier.hub.model.Asset;
import com.draxlmaier.hub.model.Request;
import com.draxlmaier.hub.model.Employee;
import com.draxlmaier.hub.model.Department;
import com.draxlmaier.hub.model.AssignmentTask;
import com.draxlmaier.hub.repository.ComplaintRepository;
import com.draxlmaier.hub.repository.AssetRepository;
import com.draxlmaier.hub.repository.RequestRepository;
import com.draxlmaier.hub.repository.EmployeeRepository;
import com.draxlmaier.hub.repository.DepartmentRepository;
import com.draxlmaier.hub.repository.AssignmentTaskRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Stateless
public class ReportService {

    @Inject
    private ComplaintRepository complaintRepository;

    @Inject
    private AssetRepository assetRepository;

    @Inject
    private RequestRepository requestRepository;

    @Inject
    private EmployeeRepository employeeRepository;

    @Inject
    private DepartmentRepository departmentRepository;

    @Inject
    private AssignmentTaskRepository assignmentTaskRepository;

    public byte[] generateComplaintsReport(boolean exportAll, String status, String search, Long departmentId, Long employeeId) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Title
            document.add(new Paragraph("Complaints Report")
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("\n"));

            // Get complaints with filters
            List<Complaint> complaints;
            if (departmentId != null) {
                complaints = complaintRepository.findAllByDepartmentPaginated(0, Integer.MAX_VALUE, status, search, departmentId);
            } else if (employeeId != null) {
                complaints = complaintRepository.findAllByEmployeePaginated(0, Integer.MAX_VALUE, status, search, employeeId);
            } else {
                complaints = complaintRepository.findAllPaginated(0, Integer.MAX_VALUE, status, search);
            }

            if (complaints.isEmpty()) {
                document.add(new Paragraph("No complaints found."));
            } else {
                // Create table
                Table table = new Table(new float[]{1, 2, 2, 1.5f, 1.5f});
                table.setWidth(500);

                // Header row
                table.addCell(new Cell().add(new Paragraph("ID").setBold()));
                table.addCell(new Cell().add(new Paragraph("Title").setBold()));
                table.addCell(new Cell().add(new Paragraph("Description").setBold()));
                table.addCell(new Cell().add(new Paragraph("Status").setBold()));
                table.addCell(new Cell().add(new Paragraph("Created").setBold()));

                // Data rows
                for (Complaint complaint : complaints) {
                    table.addCell(new Cell().add(new Paragraph(complaint.getId().toString())));
                    table.addCell(new Cell().add(new Paragraph(complaint.getTitle())));
                    table.addCell(new Cell().add(new Paragraph(complaint.getDescription())));
                    table.addCell(new Cell().add(new Paragraph(complaint.getStatus().toString())));
                    table.addCell(new Cell().add(new Paragraph(complaint.getCreatedAt() != null ? complaint.getCreatedAt().toString() : "N/A")));
                }

                document.add(table);
            }

            // Summary
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Total Complaints: " + complaints.size()));

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating report", e);
        }
    }

    public byte[] generateAssetsReport(boolean exportAll, String status, String search, String category, Long departmentId, Long employeeId) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Title
            document.add(new Paragraph("Assets Report")
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("\n"));

            // Get assets with filters
            List<Asset> assets;
            if (departmentId != null) {
                assets = assetRepository.findAllByDepartment(0, Integer.MAX_VALUE, status, search, departmentId);
            } else if (employeeId != null) {
                assets = assetRepository.findAllPaginated(0, Integer.MAX_VALUE, status, category, search, employeeId);
            } else {
                assets = assetRepository.findAllPaginated(0, Integer.MAX_VALUE, status, category, search, null);
            }

            if (assets.isEmpty()) {
                document.add(new Paragraph("No assets found."));
            } else {
                // Create table
                Table table = new Table(new float[]{1, 2, 1.5f, 1.5f, 1.5f, 1.5f});
                table.setWidth(500);

                // Header row
                table.addCell(new Cell().add(new Paragraph("ID").setBold()));
                table.addCell(new Cell().add(new Paragraph("Name").setBold()));
                table.addCell(new Cell().add(new Paragraph("Category").setBold()));
                table.addCell(new Cell().add(new Paragraph("Status").setBold()));
                table.addCell(new Cell().add(new Paragraph("Owner").setBold()));
                table.addCell(new Cell().add(new Paragraph("Updated").setBold()));

                // Data rows
                for (Asset asset : assets) {
                    table.addCell(new Cell().add(new Paragraph(asset.getId().toString())));
                    table.addCell(new Cell().add(new Paragraph(asset.getName())));
                    table.addCell(new Cell().add(new Paragraph(asset.getCategory())));
                    table.addCell(new Cell().add(new Paragraph(asset.getStatus().toString())));
                    table.addCell(new Cell().add(new Paragraph(asset.getEmployee() != null ? asset.getEmployee().getName() : "N/A")));
                    table.addCell(new Cell().add(new Paragraph(asset.getLastUpdated() != null ? asset.getLastUpdated().toString() : "N/A")));
                }

                document.add(table);
            }

            // Summary
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Total Assets: " + assets.size()));

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating report", e);
        }
    }

    public byte[] generateRequestsReport(boolean exportAll, String status, String search, Long departmentId, Long employeeId) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Title
            document.add(new Paragraph("Requests Report")
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("\n"));

            // Get requests with filters
            List<Request> requests;
            if (departmentId != null) {
                requests = requestRepository.findAllByDepartmentPaginated(0, Integer.MAX_VALUE, status, search, departmentId);
            } else if (employeeId != null) {
                requests = requestRepository.findAllByEmployeePaginated(0, Integer.MAX_VALUE, status, search, employeeId);
            } else {
                requests = requestRepository.findAllPaginated(0, Integer.MAX_VALUE, status, search);
            }

            if (requests.isEmpty()) {
                document.add(new Paragraph("No requests found."));
            } else {
                // Create table
                Table table = new Table(new float[]{1, 2, 3, 1.5f});
                table.setWidth(500);

                // Header row
                table.addCell(new Cell().add(new Paragraph("ID").setBold()));
                table.addCell(new Cell().add(new Paragraph("Title").setBold()));
                table.addCell(new Cell().add(new Paragraph("Description").setBold()));
                table.addCell(new Cell().add(new Paragraph("Status").setBold()));

                // Data rows
                for (Request request : requests) {
                    table.addCell(new Cell().add(new Paragraph(request.getId().toString())));
                    table.addCell(new Cell().add(new Paragraph(request.getTitle())));
                    table.addCell(new Cell().add(new Paragraph(request.getDescription())));
                    table.addCell(new Cell().add(new Paragraph(request.getStatus().toString())));
                }

                document.add(table);
            }

            // Summary
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Total Requests: " + requests.size()));

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating report", e);
        }
    }

    public byte[] generateComplaintsReportCsv(boolean exportAll, String status, String search, Long departmentId, Long employeeId) {
        try {
            List<Complaint> complaints;
            if (departmentId != null) {
                complaints = complaintRepository.findAllByDepartmentPaginated(0, Integer.MAX_VALUE, status, search, departmentId);
            } else if (employeeId != null) {
                complaints = complaintRepository.findAllByEmployeePaginated(0, Integer.MAX_VALUE, status, search, employeeId);
            } else {
                complaints = complaintRepository.findAllPaginated(0, Integer.MAX_VALUE, status, search);
            }

            StringBuilder csv = new StringBuilder();
            csv.append("ID,Title,Description,Status,Created\n");

            for (Complaint complaint : complaints) {
                csv.append(complaint.getId()).append(",");
                csv.append(escapeCsv(complaint.getTitle())).append(",");
                csv.append(escapeCsv(complaint.getDescription())).append(",");
                csv.append(complaint.getStatus()).append(",");
                csv.append(complaint.getCreatedAt() != null ? complaint.getCreatedAt() : "N/A").append("\n");
            }

            return csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Error generating CSV report", e);
        }
    }

    public byte[] generateAssetsReportCsv(boolean exportAll, String status, String search, String category, Long departmentId, Long employeeId) {
        try {
            List<Asset> assets;
            if (departmentId != null) {
                assets = assetRepository.findAllByDepartment(0, Integer.MAX_VALUE, status, search, departmentId);
            } else if (employeeId != null) {
                assets = assetRepository.findAllPaginated(0, Integer.MAX_VALUE, status, category, search, employeeId);
            } else {
                assets = assetRepository.findAllPaginated(0, Integer.MAX_VALUE, status, category, search, null);
            }

            StringBuilder csv = new StringBuilder();
            csv.append("ID,Name,Category,Status,Owner,Updated\n");

            for (Asset asset : assets) {
                csv.append(asset.getId()).append(",");
                csv.append(escapeCsv(asset.getName())).append(",");
                csv.append(asset.getCategory()).append(",");
                csv.append(asset.getStatus()).append(",");
                csv.append(asset.getEmployee() != null ? asset.getEmployee().getName() : "N/A").append(",");
                csv.append(asset.getLastUpdated() != null ? asset.getLastUpdated() : "N/A").append("\n");
            }

            return csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Error generating CSV report", e);
        }
    }

    public byte[] generateRequestsReportCsv(boolean exportAll, String status, String search, Long departmentId, Long employeeId) {
        try {
            List<Request> requests;
            if (departmentId != null) {
                requests = requestRepository.findAllByDepartmentPaginated(0, Integer.MAX_VALUE, status, search, departmentId);
            } else if (employeeId != null) {
                requests = requestRepository.findAllByEmployeePaginated(0, Integer.MAX_VALUE, status, search, employeeId);
            } else {
                requests = requestRepository.findAllPaginated(0, Integer.MAX_VALUE, status, search);
            }

            StringBuilder csv = new StringBuilder();
            csv.append("ID,Title,Description,Status\n");

            for (Request request : requests) {
                csv.append(request.getId()).append(",");
                csv.append(escapeCsv(request.getTitle())).append(",");
                csv.append(escapeCsv(request.getDescription())).append(",");
                csv.append(request.getStatus()).append("\n");
            }

            return csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Error generating CSV report", e);
        }
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    public java.util.Map<String, Object> getActivitySummary() {
        java.util.Map<String, Object> summary = new java.util.HashMap<>();
        summary.put("totalComplaints", complaintRepository.findAll().size());
        summary.put("totalAssets", assetRepository.findAll().size());
        summary.put("totalRequests", requestRepository.findAll().size());
        summary.put("generatedAt", LocalDateTime.now());
        return summary;
    }

    public byte[] generateEmployeesReportCsv(String search) {
        try {
            StringBuilder csv = new StringBuilder();
            csv.append("ID,Name,Email,Role\n");

            List<Employee> employees = employeeRepository.findAll();

            for (Employee employee : employees) {
                csv.append(employee.getId()).append(",");
                csv.append(escapeCsv(employee.getName())).append(",");
                csv.append(employee.getEmail()).append(",");
                csv.append(employee.getRole() != null ? employee.getRole().getName() : "N/A").append("\n");
            }

            return csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Error generating CSV report", e);
        }
    }

    public byte[] generateDepartmentsReportCsv(String search) {
        try {
            StringBuilder csv = new StringBuilder();
            csv.append("ID,Name,Responsible Employee\n");

            List<Department> departments = departmentRepository.findAll();

            for (Department dept : departments) {
                csv.append(dept.getId()).append(",");
                csv.append(escapeCsv(dept.getName())).append(",");
                csv.append(dept.getResponsibleEmployee() != null ? dept.getResponsibleEmployee().getName() : "N/A").append("\n");
            }

            return csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Error generating CSV report", e);
        }
    }

    public byte[] generateActivityReportCsv(String search) {
        try {
            StringBuilder csv = new StringBuilder();
            csv.append("Type,Item,Accepted By,Status,Date\n");

            List<AssignmentTask> tasks = assignmentTaskRepository.findAll();

            for (AssignmentTask task : tasks) {
                csv.append(task.getItemType()).append(",");
                csv.append(task.getItemId()).append(",");
                String acceptedByName = "N/A";
                if (task.getAcceptedBy() != null) {
                    var employee = employeeRepository.findById(task.getAcceptedBy());
                    acceptedByName = employee.map(Employee::getName).orElse("Employee #" + task.getAcceptedBy());
                }
                csv.append(acceptedByName).append(",");
                csv.append(task.getStatus() != null ? task.getStatus() : "N/A").append(",");
                csv.append(task.getAcceptedAt() != null ? task.getAcceptedAt() : "N/A").append("\n");
            }

            return csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Error generating CSV report", e);
        }
    }
}
