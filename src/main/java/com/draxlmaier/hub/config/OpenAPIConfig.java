package com.draxlmaier.hub.config;

import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;

@OpenAPIDefinition(
    info = @Info(
        title = "Complaint Hub API",
        version = "1.0.0",
        description = "API pentru gestionarea plângerilor"
    )
)
public class OpenAPIConfig {
}
