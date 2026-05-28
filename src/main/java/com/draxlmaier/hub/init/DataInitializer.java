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
        // 1. Create roles
        Role userRole = getOrCreateRole("USER", "Regular user with basic access");
        Role deptResponsibleRole = getOrCreateRole("DEPT_RESPONSIBLE", "Department responsible with management access");
        Role adminRole = getOrCreateRole("ADMIN", "Administrator with full access");

        // 2. Create departments
        Department itDept = getOrCreateDepartment("IT");
        Department hrDept = getOrCreateDepartment("HR");
        Department financeDept = getOrCreateDepartment("Finance");
        Department logisticsDept = getOrCreateDepartment("Logistica");
        Department productionDept = getOrCreateDepartment("Productie");
        Department qaDept = getOrCreateDepartment("QA");
        Department supportDept = getOrCreateDepartment("Support");
        Department marketingDept = getOrCreateDepartment("Marketing");

        // 3. Create department managers
        Employee itResponsible = getOrCreateEmployee("john.manager@draxlmaier.com", "John Manager", deptResponsibleRole, itDept, "password123");
        Employee hrResponsible = getOrCreateEmployee("jane.manager@draxlmaier.com", "Jane Manager", deptResponsibleRole, hrDept, "password123");
        Employee financeResponsible = getOrCreateEmployee("mike.finance@draxlmaier.com", "Mike Finance", deptResponsibleRole, financeDept, "password123");
        Employee logisticsResponsible = getOrCreateEmployee("anna.logistics@draxlmaier.com", "Anna Logistics", deptResponsibleRole, logisticsDept, "password123");
        Employee productionResponsible = getOrCreateEmployee("david.prod@draxlmaier.com", "David Production", deptResponsibleRole, productionDept, "password123");
        Employee qaResponsible = getOrCreateEmployee("sophie.qa@draxlmaier.com", "Sophie QA", deptResponsibleRole, qaDept, "password123");

        // Admin user
        Employee admin = getOrCreateEmployee("admin@draxlmaier.com", "Admin User", adminRole, itDept, "password123");

        // Regular users across departments
        Employee user1 = getOrCreateEmployee("john.doe@draxlmaier.com", "John Doe", userRole, itDept, "password123");
        Employee user2 = getOrCreateEmployee("jane.smith@draxlmaier.com", "Jane Smith", userRole, hrDept, "password123");
        Employee user3 = getOrCreateEmployee("bob.wilson@draxlmaier.com", "Bob Wilson", userRole, productionDept, "password123");
        Employee user4 = getOrCreateEmployee("alice.johnson@draxlmaier.com", "Alice Johnson", userRole, qaDept, "password123");
        Employee user5 = getOrCreateEmployee("carlos.lopez@draxlmaier.com", "Carlos Lopez", userRole, financeDept, "password123");
        Employee user6 = getOrCreateEmployee("emma.davis@draxlmaier.com", "Emma Davis", userRole, logisticsDept, "password123");
        Employee user7 = getOrCreateEmployee("frank.miller@draxlmaier.com", "Frank Miller", userRole, supportDept, "password123");
        Employee user8 = getOrCreateEmployee("grace.wilson@draxlmaier.com", "Grace Wilson", userRole, marketingDept, "password123");

        em.flush();

        // 4. Set department managers
        itDept.setResponsibleEmployee(itResponsible);
        hrDept.setResponsibleEmployee(hrResponsible);
        financeDept.setResponsibleEmployee(financeResponsible);
        logisticsDept.setResponsibleEmployee(logisticsResponsible);
        productionDept.setResponsibleEmployee(productionResponsible);
        qaDept.setResponsibleEmployee(qaResponsible);
        supportDept.setResponsibleEmployee(itResponsible);
        marketingDept.setResponsibleEmployee(hrResponsible);

        em.merge(itDept);
        em.merge(hrDept);
        em.merge(financeDept);
        em.merge(logisticsDept);
        em.merge(productionDept);
        em.merge(qaDept);
        em.merge(supportDept);
        em.merge(marketingDept);

        em.flush();

        // 5. Create assets
        Asset[] assets = {
            Asset.builder().name("Dell Latitude 5520").serialNumber("DLL-2024-001").category("Laptop").status("ACTIVE").employee(user1).build(),
            Asset.builder().name("MacBook Pro 16").serialNumber("APL-2024-001").category("Laptop").status("ACTIVE").employee(user2).build(),
            Asset.builder().name("iPhone 15 Pro").serialNumber("APL-PHN-2024-001").category("Phone").status("ACTIVE").employee(user3).build(),
            Asset.builder().name("Dell U2723DE Monitor").serialNumber("DLL-MON-2024-001").category("Monitor").status("ACTIVE").employee(user1).build(),
            Asset.builder().name("HP Printer LaserJet").serialNumber("HP-PRT-2024-001").category("Printer").status("ACTIVE").employee(user5).build(),
            Asset.builder().name("Samsung 49\" Curved Monitor").serialNumber("SAM-MON-2024-001").category("Monitor").status("ACTIVE").employee(user4).build(),
            Asset.builder().name("Logitech Mechanical Keyboard").serialNumber("LOG-KB-2024-001").category("Keyboard").status("ACTIVE").employee(user6).build(),
            Asset.builder().name("Microsoft Mouse Pro").serialNumber("MS-MOUSE-2024-001").category("Mouse").status("ACTIVE").employee(user7).build(),
            Asset.builder().name("iPad Air").serialNumber("APL-IPAD-2024-001").category("Tablet").status("ACTIVE").employee(user8).build(),
            Asset.builder().name("Dell Desktop Workstation").serialNumber("DLL-DESK-2024-001").category("Desktop").status("MAINTENANCE").employee(user5).build()
        };

        for (Asset asset : assets) {
            em.persist(asset);
        }

        em.flush();

        // 6. Create complaints
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime yesterday = now.minusDays(1);
        LocalDateTime twoAgo = now.minusDays(2);

        Complaint[] complaints = {
            Complaint.builder().title("Laptop not charging").description("Dell laptop battery not charging, stays at 0%").status(Complaint.Status.NEW).asset(assets[0]).employee(user1).createdAt(twoAgo).updatedAt(twoAgo).build(),
            Complaint.builder().title("Screen flickering").description("Monitor screen flickers randomly during work").status(Complaint.Status.IN_PROGRESS).asset(assets[3]).employee(user1).createdAt(yesterday).updatedAt(yesterday).build(),
            Complaint.builder().title("Phone charging port broken").description("iPhone charging port not working, phone only charges wirelessly").status(Complaint.Status.NEW).asset(assets[2]).employee(user3).createdAt(now).updatedAt(now).build(),
            Complaint.builder().title("MacBook heating issue").description("MacBook gets very hot during normal usage").status(Complaint.Status.RESOLVED).asset(assets[1]).employee(user2).createdAt(twoAgo).updatedAt(yesterday).build(),
            Complaint.builder().title("Printer not responding").description("HP printer shows offline and won't connect to network").status(Complaint.Status.NEW).asset(assets[4]).employee(user5).createdAt(yesterday).updatedAt(yesterday).build(),
            Complaint.builder().title("Monitor cable damaged").description("Monitor HDMI cable damaged, display has artifacts").status(Complaint.Status.IN_PROGRESS).asset(assets[5]).employee(user4).createdAt(twoAgo).updatedAt(now).build(),
            Complaint.builder().title("Keyboard not responding").description("Several keys not working, mechanical switch failure").status(Complaint.Status.IN_REVIEW).asset(assets[6]).employee(user6).createdAt(now).updatedAt(now).build(),
            Complaint.builder().title("Mouse connection issues").description("Wireless mouse keeps disconnecting and reconnecting").status(Complaint.Status.NEW).asset(assets[7]).employee(user7).createdAt(yesterday).updatedAt(yesterday).build()
        };

        for (Complaint complaint : complaints) {
            em.persist(complaint);
        }

        em.flush();

        // 7. Create complaint workflows
        ComplaintWorkflow[] workflows = {
            ComplaintWorkflow.builder().complaint(complaints[1]).employee(itResponsible).oldStatus(Complaint.Status.NEW).currentStatus(Complaint.Status.IN_PROGRESS).build(),
            ComplaintWorkflow.builder().complaint(complaints[3]).employee(itResponsible).oldStatus(Complaint.Status.IN_PROGRESS).currentStatus(Complaint.Status.RESOLVED).build(),
            ComplaintWorkflow.builder().complaint(complaints[5]).employee(itResponsible).oldStatus(Complaint.Status.NEW).currentStatus(Complaint.Status.IN_PROGRESS).build(),
            ComplaintWorkflow.builder().complaint(complaints[6]).employee(itResponsible).oldStatus(Complaint.Status.NEW).currentStatus(Complaint.Status.IN_REVIEW).build()
        };

        for (ComplaintWorkflow workflow : workflows) {
            em.persist(workflow);
        }

        em.flush();

        // 8. Create requests
        Request[] requests = {
            Request.builder().title("New Laptop Request").description("Need a new laptop for development work").status(Request.Status.PENDING).employee(user1).createdAt(twoAgo).updatedAt(twoAgo).build(),
            Request.builder().title("Monitor Upgrade").description("Request for 4K monitor for better productivity").status(Request.Status.APPROVED).employee(user2).asset(assets[3]).createdAt(yesterday).updatedAt(yesterday).build(),
            Request.builder().title("Phone Replacement").description("Old phone needs replacement with latest model").status(Request.Status.PENDING).employee(user3).createdAt(now).updatedAt(now).build(),
            Request.builder().title("Keyboard and Mouse").description("Ergonomic keyboard and mouse set").status(Request.Status.REJECTED).employee(user1).createdAt(twoAgo).updatedAt(yesterday).build(),
            Request.builder().title("Software License").description("Adobe Creative Suite license for design work").status(Request.Status.APPROVED).employee(user8).createdAt(yesterday).updatedAt(yesterday).build(),
            Request.builder().title("Additional Monitor for QA").description("Need dual monitor setup for test automation").status(Request.Status.APPROVED).employee(user4).createdAt(twoAgo).updatedAt(twoAgo).build(),
            Request.builder().title("Printer Cartridges").description("Replacement toner cartridges for HP printer").status(Request.Status.COMPLETED).employee(user5).asset(assets[4]).createdAt(twoAgo.minusDays(1)).updatedAt(now).build(),
            Request.builder().title("Webcam for Video Calls").description("HD webcam for remote meetings").status(Request.Status.PENDING).employee(user7).createdAt(now).updatedAt(now).build(),
            Request.builder().title("Tablet for Field Work").description("iPad for logistics field operations").status(Request.Status.APPROVED).employee(user6).asset(assets[8]).createdAt(yesterday).updatedAt(yesterday).build(),
            Request.builder().title("Workstation Upgrade").description("GPU upgrade for 3D rendering tasks").status(Request.Status.PENDING).employee(user5).asset(assets[9]).createdAt(now).updatedAt(now).build()
        };

        for (Request request : requests) {
            em.persist(request);
        }

        em.flush();
        System.out.println("Database seeded with comprehensive test data successfully!");
        System.out.println("Departments: 8 | Employees: 14 | Assets: 10 | Complaints: 8 | Requests: 10");
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
