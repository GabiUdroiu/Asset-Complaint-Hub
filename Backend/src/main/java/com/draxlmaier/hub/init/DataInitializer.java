package com.draxlmaier.hub.init;

import com.draxlmaier.hub.model.*;
import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.mindrot.jbcrypt.BCrypt;
import java.time.LocalDateTime;

@Singleton
@Startup
@Transactional
public class DataInitializer {

    @PersistenceContext
    private EntityManager em;

    @PostConstruct
    public void init() {
        try {
            seedDatabase();
        } catch (Exception e) {
            // Database already seeded or initialization skipped
        }
    }

    @Transactional
    private void seedDatabase() {
        // 1. Create or get roles
        Role userRole = getOrCreateRole("USER", "Regular user with basic access");
        Role deptResponsibleRole = getOrCreateRole("DEPT_RESPONSIBLE", "Department responsible with management access");
        Role adminRole = getOrCreateRole("ADMIN", "Administrator with full access");

        // 2. Create or get departments
        Department itDept = getOrCreateDepartment("IT");
        Department hrDept = getOrCreateDepartment("HR");
        Department opsDept = getOrCreateDepartment("Operations");

        // 3. Create or get employees with auth passwords
        Employee itResponsible = getOrCreateEmployee("john.manager@draxlmaier.com", "John Manager", deptResponsibleRole, itDept, "password123");
        Employee hrResponsible = getOrCreateEmployee("jane.manager@draxlmaier.com", "Jane Manager", deptResponsibleRole, hrDept, "password123");
        Employee admin = getOrCreateEmployee("admin@draxlmaier.com", "Admin User", adminRole, itDept, "password123");
        Employee user1 = getOrCreateEmployee("john.doe@draxlmaier.com", "John Doe", userRole, itDept, "password123");
        Employee user2 = getOrCreateEmployee("jane.smith@draxlmaier.com", "Jane Smith", userRole, hrDept, "password123");
        Employee user3 = getOrCreateEmployee("bob.wilson@draxlmaier.com", "Bob Wilson", userRole, opsDept, "password123");

        em.flush();

        // 4. Set responsible employees and update departments
        itDept.setResponsibleEmployee(itResponsible);
        hrDept.setResponsibleEmployee(hrResponsible);
        opsDept.setResponsibleEmployee(hrResponsible);

        em.merge(itDept);
        em.merge(hrDept);
        em.merge(opsDept);

        em.flush();

        // Create assets
        Asset laptop1 = Asset.builder()
            .name("Dell Latitude 5520")
            .serialNumber("DLL-2024-001")
            .category("Laptop")
            .status("ACTIVE")
            .employee(user1)
            .build();
        em.persist(laptop1);

        Asset laptop2 = Asset.builder()
            .name("MacBook Pro 16")
            .serialNumber("APL-2024-001")
            .category("Laptop")
            .status("ACTIVE")
            .employee(user2)
            .build();
        em.persist(laptop2);

        Asset phone1 = Asset.builder()
            .name("iPhone 15 Pro")
            .serialNumber("APL-PHN-2024-001")
            .category("Phone")
            .status("ACTIVE")
            .employee(user3)
            .build();
        em.persist(phone1);

        Asset monitor1 = Asset.builder()
            .name("Dell U2723DE")
            .serialNumber("DLL-MON-2024-001")
            .category("Monitor")
            .status("ACTIVE")
            .employee(user1)
            .build();
        em.persist(monitor1);

        em.flush();

        // Create complaints
        LocalDateTime now = LocalDateTime.now();

        Complaint complaint1 = Complaint.builder()
            .title("Laptop not charging")
            .description("Dell laptop battery not charging, stays at 0%")
            .status(Complaint.Status.NEW)
            .asset(laptop1)
            .employee(user1)
            .createdAt(now)
            .updatedAt(now)
            .build();
        em.persist(complaint1);

        Complaint complaint2 = Complaint.builder()
            .title("Screen flickering")
            .description("Monitor screen flickers randomly during work")
            .status(Complaint.Status.IN_PROGRESS)
            .asset(monitor1)
            .employee(user1)
            .createdAt(now)
            .updatedAt(now)
            .build();
        em.persist(complaint2);

        Complaint complaint3 = Complaint.builder()
            .title("Phone charging port broken")
            .description("iPhone charging port not working, phone only charges wirelessly")
            .status(Complaint.Status.NEW)
            .asset(phone1)
            .employee(user3)
            .createdAt(now)
            .updatedAt(now)
            .build();
        em.persist(complaint3);

        Complaint complaint4 = Complaint.builder()
            .title("MacBook heating issue")
            .description("MacBook gets very hot during normal usage")
            .status(Complaint.Status.RESOLVED)
            .asset(laptop2)
            .employee(user2)
            .createdAt(now)
            .updatedAt(now)
            .build();
        em.persist(complaint4);

        em.flush();

        // Create complaint comments
        ComplaintComment comment1 = ComplaintComment.builder()
            .complaint(complaint1)
            .employee(itResponsible)
            .text("Checked hardware. Battery might be defective. Ordering replacement.")
            .build();
        em.persist(comment1);

        ComplaintComment comment2 = ComplaintComment.builder()
            .complaint(complaint1)
            .employee(user1)
            .text("Thank you for the quick response!")
            .build();
        em.persist(comment2);

        // Create complaint workflows
        ComplaintWorkflow workflow1 = ComplaintWorkflow.builder()
            .complaint(complaint1)
            .employee(itResponsible)
            .oldStatus(Complaint.Status.NEW)
            .currentStatus(Complaint.Status.IN_PROGRESS)
            .build();
        em.persist(workflow1);

        ComplaintWorkflow workflow2 = ComplaintWorkflow.builder()
            .complaint(complaint4)
            .employee(itResponsible)
            .oldStatus(Complaint.Status.IN_PROGRESS)
            .currentStatus(Complaint.Status.RESOLVED)
            .build();
        em.persist(workflow2);

        em.flush();

        // Create requests
        Request request1 = Request.builder()
            .title("New Laptop Request")
            .description("Need a new laptop for development work")
            .status(Request.Status.PENDING)
            .employee(user1)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        em.persist(request1);

        Request request2 = Request.builder()
            .title("Monitor Upgrade")
            .description("Request for 4K monitor for better productivity")
            .status(Request.Status.APPROVED)
            .employee(user2)
            .asset(monitor1)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        em.persist(request2);

        Request request3 = Request.builder()
            .title("Phone Replacement")
            .description("Old phone needs replacement with latest model")
            .status(Request.Status.PENDING)
            .employee(user3)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        em.persist(request3);

        Request request4 = Request.builder()
            .title("Keyboard and Mouse")
            .description("Ergonomic keyboard and mouse set")
            .status(Request.Status.REJECTED)
            .employee(user1)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        em.persist(request4);

        Request request5 = Request.builder()
            .title("Software License")
            .description("Adobe Creative Suite license for design work")
            .status(Request.Status.APPROVED)
            .employee(user2)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        em.persist(request5);

        em.flush();
        System.out.println("Database seeded successfully!");
    }

    private Role getOrCreateRole(String name, String description) {
        try {
            Role existing = em.createQuery("SELECT r FROM Role r WHERE r.name = :name", Role.class)
                .setParameter("name", name)
                .getSingleResult();
            return existing;
        } catch (Exception e) {
            Role newRole = Role.builder()
                .name(name)
                .description(description)
                .build();
            em.persist(newRole);
            return newRole;
        }
    }

    private Department getOrCreateDepartment(String name) {
        try {
            Department existing = em.createQuery("SELECT d FROM Department d WHERE d.name = :name", Department.class)
                .setParameter("name", name)
                .getSingleResult();
            return existing;
        } catch (Exception e) {
            Department newDept = new Department();
            newDept.setName(name);
            em.persist(newDept);
            return newDept;
        }
    }

    private Employee getOrCreateEmployee(String email, String name, Role role, Department dept, String password) {
        try {
            Employee existing = em.createQuery("SELECT e FROM Employee e WHERE e.email = :email", Employee.class)
                .setParameter("email", email)
                .getSingleResult();
            // Update password if needed
            if (existing.getPasswordHash() == null || existing.getPasswordHash().isEmpty()) {
                existing.setPasswordHash(BCrypt.hashpw(password, BCrypt.gensalt(12)));
                em.merge(existing);
            }
            return existing;
        } catch (Exception e) {
            Employee newEmployee = Employee.builder()
                .email(email)
                .name(name)
                .passwordHash(BCrypt.hashpw(password, BCrypt.gensalt(12)))
                .role(role)
                .department(dept)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();
            em.persist(newEmployee);
            return newEmployee;
        }
    }
}
