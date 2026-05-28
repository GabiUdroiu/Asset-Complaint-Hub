package com.draxlmaier.hub.controller;

import com.draxlmaier.hub.dto.AnnouncementDTO;
import com.draxlmaier.hub.dto.ApiResponse;
import com.draxlmaier.hub.dto.PaginatedResponse;
import com.draxlmaier.hub.model.Announcement;
import com.draxlmaier.hub.service.IService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/announcements")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Announcements", description = "Announcement management")
public class AnnouncementController {

    @Inject
    private IService<Announcement, AnnouncementDTO> announcementService;

    @POST
    @Operation(summary = "Create announcement (only once - ID 1)")
    public Response createAnnouncement(AnnouncementDTO announcementDTO) {
        // Check if announcement with ID 1 already exists
        if (announcementService.get(1L).isPresent()) {
            return Response.status(Response.Status.CONFLICT)
                .entity(new ApiResponse<>("Announcement already exists. Use PUT /announcements/1 to update.", null))
                .build();
        }

        AnnouncementDTO created = announcementService.create(announcementDTO);
        return Response.status(Response.Status.CREATED)
            .entity(new ApiResponse<>("Announcement created successfully", created))
            .build();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get announcement by ID")
    public Response getAnnouncement(@PathParam("id") Long id) {
        return announcementService.get(id)
            .map(dto -> Response.ok(new ApiResponse<>("Announcement found", dto)).build())
            .orElse(Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiResponse<>("Announcement not found", null))
                .build());
    }

    @GET
    @Operation(summary = "Get all announcements with pagination")
    public Response getAllAnnouncements(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size) {

        PaginatedResponse<AnnouncementDTO> result = announcementService.getAll(page, size, null, null , null);
        return Response.ok(
            new ApiResponse<>(
                "Announcements retrieved successfully",
                result
            )
        ).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update announcement")
    public Response updateAnnouncement(@PathParam("id") Long id, AnnouncementDTO announcementDTO) {
        return announcementService.update(id, announcementDTO)
            .map(dto -> Response.ok(
                new ApiResponse<>(
                    "Announcement updated successfully",
                    dto)
                )
                .build()
            ).orElse(Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiResponse<>("Announcement not found", null))
                .build());
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete announcement")
    public Response deleteAnnouncement(@PathParam("id") Long id) {
        if (announcementService.delete(id)) {
            return Response.noContent()
                .entity(new ApiResponse<>("Announcement deleted successfully", null))
                .build();
        }
        return Response.status(Response.Status.NOT_FOUND)
            .entity(new ApiResponse<>("Announcement not found", null))
            .build();
    }
}
