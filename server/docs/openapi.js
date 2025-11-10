// server/docs/openapi.js
const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "TripShare API",
    version: "1.0.0",
    description:
      "Users, Trips, and Bookings API. Seats availability is derived from bookings. Note: some numeric fields may be returned as strings by MySQL drivers."
  },
  servers: [{ url: "http://localhost:4000", description: "Local" }],
  tags: [
    { name: "Users" },
    { name: "Trips" },
    { name: "Bookings" }
  ],
  paths: {
    // ---------------- USERS ----------------
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List users",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/User" } }
              }
            }
          }
        }
      },
      post: {
        tags: ["Users"],
        summary: "Create user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserCreate" }
            }
          }
        },
        responses: {
          201: {
            description: "Created",
            content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } }
          },
          400: { description: "Bad Request" },
          409: { description: "Email already in use" }
        }
      }
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by id",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: {
          200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          404: { description: "Not Found" }
        }
      },
      put: {
        tags: ["Users"],
        summary: "Update user",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: {
          content: { "application/json": { schema: { $ref: "#/components/schemas/UserUpdate" } } }
        },
        responses: {
          200: { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          404: { description: "Not Found" },
          409: { description: "Email already in use" }
        }
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: {
          200: { description: "Deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiMessage" } } } },
          404: { description: "Not Found" }
        }
      }
    },

    // ---------------- TRIPS ----------------
    "/api/trips": {
      get: {
        tags: ["Trips"],
        summary: "List/search trips",
        description:
          "When any query parameter is provided, the response is a paginated object `{ items, page, pageSize, total }`. If no query is provided, legacy behavior returns a plain array of trips.",
        parameters: [
          { name: "origin", in: "query", schema: { type: "string" }, description: "Partial match on origin city" },
          { name: "destination", in: "query", schema: { type: "string" }, description: "Partial match on destination city" },
          { name: "date", in: "query", schema: { type: "string", format: "date" }, description: "YYYY-MM-DD (day window)" },
          { name: "status", in: "query", schema: { type: "string", enum: ["Draft", "Published", "Cancelled"] }, description: "Default: Published" },
          { name: "driver_id", in: "query", schema: { type: "integer", minimum: 1 }, description: "Filter by driver id" },
          { name: "minSeats", in: "query", schema: { type: "integer", minimum: 0 }, description: "Only trips with seats_available ≥ minSeats" },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 }, description: "Default: 1" },
          { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 }, description: "Default: 10" }
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    { $ref: "#/components/schemas/PaginatedTrips" }, // new search path
                    { type: "array", items: { $ref: "#/components/schemas/Trip" } } // legacy no-filter path
                  ]
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Trips"],
        summary: "Create trip",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TripCreate" } } }
        },
        responses: {
          201: { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Trip" } } } },
          400: { description: "Bad Request" },
          403: { description: "Only 'driver' users can create trips" }
        }
      }
    },
    "/api/trips/{id}": {
      get: {
        tags: ["Trips"],
        summary: "Get trip by id",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: {
          200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Trip" } } } },
          404: { description: "Not Found" }
        }
      },
      put: {
        tags: ["Trips"],
        summary: "Update trip",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/TripUpdate" } } } },
        responses: {
          200: { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Trip" } } } },
          400: { description: "Bad Request" },
          404: { description: "Not Found" }
        }
      },
      delete: {
        tags: ["Trips"],
        summary: "Delete trip",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: {
          200: { description: "Deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiMessage" } } } },
          404: { description: "Not Found" }
        }
      }
    },

    // ---------------- BOOKINGS ----------------
    "/api/bookings": {
      get: {
        tags: ["Bookings"],
        summary: "List bookings",
        responses: {
          200: {
            description: "OK",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Booking" } } } }
          }
        }
      },
      post: {
        tags: ["Bookings"],
        summary: "Create booking",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/BookingCreate" } } }
        },
        responses: {
          201: { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Booking" } } } },
          400: { description: "Bad Request" },
          409: { description: "Duplicate booking (same passenger for same trip)" },
          422: { description: "Not enough seats available" }
        }
      }
    },
    "/api/bookings/{id}": {
      get: {
        tags: ["Bookings"],
        summary: "Get booking by id",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: {
          200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Booking" } } } },
          404: { description: "Not Found" }
        }
      },
      put: {
        tags: ["Bookings"],
        summary: "Update booking",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/BookingUpdate" } } } },
        responses: {
          200: { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Booking" } } } },
          400: { description: "Bad Request" },
          404: { description: "Not Found" },
          422: { description: "Not enough seats available for the update" }
        }
      },
      delete: {
        tags: ["Bookings"],
        summary: "Delete booking",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: {
          200: { description: "Deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiMessage" } } } },
          404: { description: "Not Found" }
        }
      }
    }
  },

  components: {
    parameters: {
      IdParam: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "integer", minimum: 1 }
      }
    },
    schemas: {
      ApiMessage: {
        type: "object",
        properties: { message: { type: "string" } }
      },

      // ---------- USERS ----------
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string", nullable: true },
          role: { type: "string", enum: ["driver", "passenger"] },
          created_at: { type: "string", format: "date-time" }
        }
      },
      UserCreate: {
        type: "object",
        required: ["name", "email", "role"],
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          role: { type: "string", enum: ["driver", "passenger"] }
        }
      },
      UserUpdate: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          role: { type: "string", enum: ["driver", "passenger"] }
        }
      },

      // ---------- TRIPS ----------
      Trip: {
        type: "object",
        properties: {
          id: { type: "integer" },
          driver_id: { type: "integer" },
          origin: { type: "string" },
          destination: { type: "string" },
          date_time: { type: "string", format: "date-time" },
          total_seats: { type: "integer" },
          // MySQL may return DECIMAL as string; allow both
          price: { oneOf: [{ type: "number" }, { type: "string" }] },
          status: { type: "string", enum: ["Draft", "Published", "Cancelled"] },
          // Computed; may arrive as number or numeric string from MySQL
          seats_available: { oneOf: [{ type: "integer" }, { type: "string", pattern: "^[0-9]+$" }] },
          driver_name: { type: "string" }
        }
      },
      TripCreate: {
        type: "object",
        required: ["driver_id", "origin", "destination", "date_time", "total_seats", "price"],
        properties: {
          driver_id: { type: "integer" },
          origin: { type: "string" },
          destination: { type: "string" },
          date_time: { type: "string", example: "2025-10-25 09:30:00" },
          total_seats: { type: "integer", minimum: 1 },
          price: { oneOf: [{ type: "number" }, { type: "string" }] },
          status: { type: "string", enum: ["Draft", "Published", "Cancelled"] }
        }
      },
      TripUpdate: {
        type: "object",
        properties: {
          driver_id: { type: "integer" },
          origin: { type: "string" },
          destination: { type: "string" },
          date_time: { type: "string" },
          total_seats: { type: "integer", minimum: 1 },
          price: { oneOf: [{ type: "number" }, { type: "string" }] },
          status: { type: "string", enum: ["Draft", "Published", "Cancelled"] }
        }
      },
      PaginatedTrips: {
        type: "object",
        properties: {
          items: { type: "array", items: { $ref: "#/components/schemas/Trip" } },
          page: { type: "integer", example: 1 },
          pageSize: { type: "integer", example: 10 },
          total: { type: "integer", example: 23 }
        }
      },

      // ---------- BOOKINGS ----------
      Booking: {
        type: "object",
        properties: {
          id: { type: "integer" },
          trip_id: { type: "integer" },
          passenger_id: { type: "integer" },
          seats: { type: "integer" },
          // `is_paid` is stored as TINYINT(1); you return 0/1 today
          is_paid: { oneOf: [{ type: "integer", enum: [0, 1] }, { type: "boolean" }] },
          status: { type: "string", enum: ["Confirmed", "Cancelled"] },
          created_at: { type: "string", format: "date-time" },
          // optional joins in listAll
          passenger_name: { type: "string" },
          origin: { type: "string" },
          destination: { type: "string" },
          date_time: { type: "string", format: "date-time" }
        }
      },
      BookingCreate: {
        type: "object",
        required: ["trip_id", "passenger_id", "seats"],
        properties: {
          trip_id: { type: "integer" },
          passenger_id: { type: "integer" },
          seats: { type: "integer", minimum: 1 }
        }
      },
      BookingUpdate: {
        type: "object",
        properties: {
          seats: { type: "integer", minimum: 1 },
          is_paid: { oneOf: [{ type: "integer", enum: [0, 1] }, { type: "boolean" }] },
          status: { type: "string", enum: ["Confirmed", "Cancelled"] }
        }
      }
    }
  }
};

export default openapiSpec;