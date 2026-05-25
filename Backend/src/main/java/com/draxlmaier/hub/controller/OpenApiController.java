// package com.draxlmaier.hub.controller;

// import jakarta.ws.rs.GET;
// import jakarta.ws.rs.Path;
// import jakarta.ws.rs.Produces;
// import jakarta.ws.rs.core.MediaType;


// @Path("/openapi")
// public class OpenApiController {

//     @GET
//     @Path("swagger-ui.html")
//     @Produces(MediaType.TEXT_HTML)
//     public String getSwaggerUI() {
//         return "<!DOCTYPE html>\n" +
//             "<html>\n" +
//             "  <head>\n" +
//             "    <title>Complaint Hub API</title>\n" +
//             "    <meta charset=\"utf-8\"/>\n" +
//             "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n" +
//             "    <link rel=\"stylesheet\" href=\"https://unpkg.com/swagger-ui-dist@5/swagger-ui.css\">\n" +
//             "  </head>\n" +
//             "  <body>\n" +
//             "    <div id=\"swagger-ui\"></div>\n" +
//             "    <script src=\"https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js\"></script>\n" +
//             "    <script>\n" +
//             "      SwaggerUIBundle({\n" +
//             "        url: 'http://localhost:8080/openapi',\n" +
//             "        dom_id: '#swagger-ui',\n" +
//             "        presets: [SwaggerUIBundle.presets.apis],\n" +
//             "        layout: 'BaseLayout'\n" +
//             "      })\n" +
//             "    </script>\n" +
//             "  </body>\n" +
//             "</html>";
//     }
// }
package com.draxlmaier.hub.controller;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/")
public class OpenApiController {

    @GET
    @Path("swagger-ui.html")
    @Produces(MediaType.TEXT_HTML)
    public String swaggerUI() {
        return "<!DOCTYPE html>\n" +
            "<html>\n" +
            "  <head>\n" +
            "    <title>API</title>\n" +
            "    <meta charset=\"utf-8\"/>\n" +
            "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n" +
            "    <link rel=\"stylesheet\" href=\"https://unpkg.com/swagger-ui-dist@5/swagger-ui.css\">\n" +
            "    <style>\n" +
            "      body { font-size: 12px !important; }\n" +
            "      .swagger-ui * { font-size: 12px !important;  }\n" +
            "      .swagger-ui .opblock { margin: 4px 0; }\n" +
            "      .swagger-ui .opblock-summary { padding: 6px !important; }\n" +
            "      .swagger-ui .opblock-description-text { margin: 0; }\n" +
            "    </style>\n" +
            "  </head>\n" +
            "  <body>\n" +
            "    <div id=\"swagger-ui\"></div>\n" +
            "    <script src=\"https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js\"></script>\n" +
            "    <script>\n" +
            "      SwaggerUIBundle({\n" +
            "        url: 'http://localhost:8080/openapi',\n" +
            "        dom_id: '#swagger-ui',\n" +
            "        presets: [SwaggerUIBundle.presets.apis],\n" +
            "        layout: 'BaseLayout',\n" +
            "        defaultModelsExpandDepth: -1\n" +
            "      })\n" +
            "    </script>\n" +
            "  </body>\n" +
            "</html>";
    }
}
