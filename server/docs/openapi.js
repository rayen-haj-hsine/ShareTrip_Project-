// docs/openapi.js
const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "TripShare API",
    version: "1.0.0",
    description:
      "Users, Trips, and Bookings API. Seats availability is derived from bookings."
  },
  servers: [
    { url: "http://localhost:4000", description: "Local" }
  ],
  paths: {
    // ---------------- USERS ----------------
    "/api/users": {
      get: {
        summary: "List users",
        responses: { 200: { description: "OK" } }
      },
      post: {
        summary: "Create user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "role"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string" },
                  phone: { type: "string" },
                  role: { type: "string", enum: ["driver", "passenger"] }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Created" },
          400: { description: "Bad Request" }
        }
      }
    },
    "/api/users/{id}": {
      put: {
        summary: "Update user",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  phone: { type: "string" },
                  role: { type: "string" }
                }
              }
            }
          }
        },
        responses: { 200: { description: "Updated" }, 404: { description: "Not Found" } }
      },
      delete: {
        summary: "Delete user",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } }
        ],
        responses: { 204: { description: "Deleted" }, 404: { description: "Not Found" } }
      }
    },

    // ---------------- TRIPS ----------------
    "/api/trips": {
      get: {
        summary: "List trips",
        responses: { 200: { description: "OK" } }
      },
      post: {
        summary: "Create trip",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "driver_id",
                  "origin",
                  "destination",
                  "date_time",
                  "total_seats",
                  "price"
                ],
                properties: {
                  driver_id: { type: "integer" },
                  origin: { type: "string" },
                  destination: { type: "string" },
                  date_time: { type: "string", example: "2025-10-25 09:30:00" },
                  total_seats: { type: "integer" },
                  price: { type: "number" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Created" },
          400: { description: "Bad Request" }
        }
      }
    },
    "/api/trips/{id}": {
      put: {
        summary: "Update trip",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  origin: { type: "string" },
                  destination: { type: "string" },
                  date_time: { type: "string" },
                  total_seats: { type: "integer" },
                  price: { type: "number" }
                }
              }
            }
          }
        },
        responses: { 200: { description: "Updated" }, 404: { description: "Not Found" } }
      },
      delete: {
        summary: "Delete trip",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } }
        ],
        responses: { 204: { description: "Deleted" }, 404: { description: "Not Found" } }
      }
    },

    // ---------------- BOOKINGS ----------------
    "/api/bookings": {
      get: {
        summary: "List bookings",
        responses: { 200: { description: "OK" } }
      },
      post: {
        summary: "Create booking",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["trip_id", "passenger_id", "seats"],
                properties: {
                  trip_id: { type: "integer" },
                  passenger_id: { type: "integer" },
                  seats: { type: "integer" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Created" },
          400: { description: "Bad Request" },
          409: { description: "Duplicate booking" }
        }
      }
    },
    "/api/bookings/{id}": {
      put: {
        summary: "Update booking",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  seats: { type: "integer" }
                }
              }
            }
          }
        },
        responses: { 200: { description: "Updated" }, 404: { description: "Not Found" } }
      },
      delete: {
        summary: "Delete booking",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } }
        ],
        responses: { 204: { description: "Deleted" }, 404: { description: "Not Found" } }
      }
    }
  }
};

export default openapiSpec;
