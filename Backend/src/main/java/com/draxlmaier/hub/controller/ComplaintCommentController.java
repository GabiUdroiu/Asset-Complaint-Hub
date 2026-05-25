package com.draxlmaier.hub.controller;

import com.draxlmaier.hub.dto.ApiResponse;
import com.draxlmaier.hub.dto.ComplaintCommentDTO;
import com.draxlmaier.hub.service.ComplaintCommentService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/complaints/{complaintId}/comments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Complaint Comments", description = "Manage comments/chat for complaints")
public class ComplaintCommentController {

    @Inject
    private ComplaintCommentService commentService;

    @POST
    @Operation(summary = "Add comment to complaint")
    public Response createComment(
            @PathParam("complaintId") Long complaintId,
            @QueryParam("employeeId") Long employeeId,
            ComplaintCommentDTO commentDTO) {
        ComplaintCommentDTO created = commentService.create(complaintId, employeeId, commentDTO);
        if (created != null) {
            return Response.status(Response.Status.CREATED)
                .entity(new ApiResponse<>("Comment added successfully", created))
                .build();
        }
        return Response.status(Response.Status.BAD_REQUEST)
            .entity(new ApiResponse<>("Invalid complaint or employee", null))
            .build();
    }

    @GET
    @Operation(summary = "Get all comments for a complaint")
    public Response getComments(@PathParam("complaintId") Long complaintId) {
        var comments = commentService.getCommentsByComplaint(complaintId);
        return Response.ok(
            new ApiResponse<>(
                "Comments retrieved successfully",
                comments
            )
        ).build();
    }

    @GET
    @Path("/{commentId}")
    @Operation(summary = "Get single comment")
    public Response getComment(@PathParam("commentId") Long commentId) {
        return commentService.getComment(commentId)
            .map(dto -> Response.ok(new ApiResponse<>("Comment found", dto)).build())
            .orElse(Response.status(Response.Status.NOT_FOUND)
                .entity(new ApiResponse<>("Comment not found", null))
                .build());
    }

    @DELETE
    @Path("/{commentId}")
    @Operation(summary = "Delete comment")
    public Response deleteComment(@PathParam("commentId") Long commentId) {
        if (commentService.deleteComment(commentId)) {
            return Response.noContent()
                .entity(new ApiResponse<>("Comment deleted successfully", null))
                .build();
        }
        return Response.status(Response.Status.NOT_FOUND)
            .entity(new ApiResponse<>("Comment not found", null))
            .build();
    }
}
