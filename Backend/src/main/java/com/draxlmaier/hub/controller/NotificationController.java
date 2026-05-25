package com.draxlmaier.hub.controller;

import com.draxlmaier.hub.dto.NotificationDTO;
import com.draxlmaier.hub.service.NotificationService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.StreamingOutput;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Path("/notifications")
@Tag(name = "Notifications", description = "Real-time notifications via Server-Sent Events")
public class NotificationController {

    private static final ConcurrentHashMap<Long, CopyOnWriteArrayList<SseConnection>> connections = new ConcurrentHashMap<>();

    @Inject
    private NotificationService notificationService;

    // ── SSE ──────────────────────────────────────────────────────────────────

    @GET
    @Path("/subscribe/{userId}")
    @Produces("text/event-stream")
    @Operation(summary = "Subscribe to notifications via SSE")
    public Response subscribe(@PathParam("userId") Long userId) {
        SseConnection connection = new SseConnection();
        connections.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(connection);

        return Response.ok((StreamingOutput) connection)
            .header("Cache-Control", "no-cache")
            .header("Connection", "keep-alive")
            .build();
    }

    // ── REST ─────────────────────────────────────────────────────────────────

    @GET
    @Path("/user/{userId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getForUser(@PathParam("userId") Long userId) {
        List<NotificationDTO> list = notificationService.getForUser(userId);
        return Response.ok(list).build();
    }

    @PUT
    @Path("/{id}/read")
    public Response markAsRead(@PathParam("id") Long id) {
        notificationService.markAsRead(id);
        return Response.noContent().build();
    }

    @PUT
    @Path("/user/{userId}/read-all")
    public Response markAllAsRead(@PathParam("userId") Long userId) {
        notificationService.markAllAsRead(userId);
        return Response.noContent().build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        notificationService.delete(id);
        return Response.noContent().build();
    }

    @DELETE
    @Path("/user/{userId}")
    public Response deleteAll(@PathParam("userId") Long userId) {
        notificationService.deleteAll(userId);
        return Response.noContent().build();
    }

    // ── Static SSE helpers ───────────────────────────────────────────────────

    public static void sendNotification(Long userId, String eventType, String message) {
        CopyOnWriteArrayList<SseConnection> userConnections = connections.get(userId);
        if (userConnections != null) {
            for (SseConnection connection : userConnections) {
                try {
                    connection.send(eventType, message);
                } catch (Exception e) {
                    userConnections.remove(connection);
                }
            }
        }
    }

    public static void sendNotificationToAll(String eventType, String message) {
        for (CopyOnWriteArrayList<SseConnection> userConnections : connections.values()) {
            for (SseConnection connection : userConnections) {
                try {
                    connection.send(eventType, message);
                } catch (Exception e) {
                    userConnections.remove(connection);
                }
            }
        }
    }

    // ── SSE connection ───────────────────────────────────────────────────────

    public static class SseConnection implements StreamingOutput {
        private volatile OutputStream output;
        private volatile boolean closed = false;

        @Override
        public void write(OutputStream output) throws IOException {
            this.output = output;
            try {
                while (!closed) {
                    Thread.sleep(100);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        public void send(String eventType, String data) throws IOException {
            if (!closed && output != null) {
                try {
                    String frame = "event: " + eventType + "\ndata: " + data + "\n\n";
                    output.write(frame.getBytes());
                    output.flush();
                } catch (IOException e) {
                    closed = true;
                    throw e;
                }
            }
        }

        public void close() {
            closed = true;
            if (output != null) {
                try {
                    output.close();
                } catch (IOException e) {
                    // ignore
                }
            }
        }
    }
}
