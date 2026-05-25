package com.draxlmaier.hub;

import java.util.HashSet;
import java.util.Set;

import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;

@ApplicationPath("/api")
public class App extends Application {
    @Override
    public Set<Class<?>> getClasses() {
        Set<Class<?>> classes = new HashSet<>();
        
        // Controllers
        classes.add(com.draxlmaier.hub.controller.OpenApiController.class);
        classes.add(com.draxlmaier.hub.controller.TestController.class);

        // main controllers
        classes.add(com.draxlmaier.hub.controller.AssetController.class);
        classes.add(com.draxlmaier.hub.controller.EmployeeController.class);
        classes.add(com.draxlmaier.hub.controller.DepartmentController.class);
        classes.add(com.draxlmaier.hub.controller.ComplaintController.class);
        classes.add(com.draxlmaier.hub.controller.ComplaintCommentController.class);
        classes.add(com.draxlmaier.hub.controller.RequestController.class);
        classes.add(com.draxlmaier.hub.controller.ReportController.class);
        classes.add(com.draxlmaier.hub.controller.AnnouncementController.class);
        classes.add(com.draxlmaier.hub.controller.NotificationController.class);
        classes.add(com.draxlmaier.hub.controller.AssignmentTaskController.class);
        classes.add(com.draxlmaier.hub.controller.AuthController.class);
        
        return classes;
    }
}
