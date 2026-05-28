package com.draxlmaier.hub.controller;

import com.draxlmaier.hub.dto.ApiResponse;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.MediaType;

@Path("/test")
public class TestController {
    
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response test() {
        return Response.ok(
            new ApiResponse<String>(
                "Hello from the backend!", 
                "melc"
            )
        ).build();
    }
}
