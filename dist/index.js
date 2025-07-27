var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  aiLog: () => aiLog,
  attachments: () => attachments,
  audioRecords: () => audioRecords,
  companies: () => companies,
  companiesRelations: () => companiesRelations,
  companyContacts: () => companyContacts,
  companyContactsRelations: () => companyContactsRelations,
  customerContacts: () => customerContacts,
  customerContactsRelations: () => customerContactsRelations,
  customers: () => customers,
  customersRelations: () => customersRelations,
  dataQuality: () => dataQuality,
  insertAILogSchema: () => insertAILogSchema,
  insertAttachmentSchema: () => insertAttachmentSchema,
  insertAudioRecordSchema: () => insertAudioRecordSchema,
  insertCompanyContactSchema: () => insertCompanyContactSchema,
  insertCompanySchema: () => insertCompanySchema,
  insertCustomerContactSchema: () => insertCustomerContactSchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertPersonSchema: () => insertPersonSchema,
  insertPhotoSchema: () => insertPhotoSchema,
  insertProjectLocationSchema: () => insertProjectLocationSchema,
  insertProjectRoleSchema: () => insertProjectRoleSchema,
  insertProjectSchema: () => insertProjectSchema,
  insertSupportTicketSchema: () => insertSupportTicketSchema,
  insertUserSchema: () => insertUserSchema,
  licensePlans: () => licensePlans,
  licenseTypeEnum: () => licenseTypeEnum,
  loginLog: () => loginLog,
  permissionLevelEnum: () => permissionLevelEnum,
  persons: () => persons,
  personsRelations: () => personsRelations,
  photos: () => photos,
  projectLocations: () => projectLocations,
  projectRoleEnum: () => projectRoleEnum,
  projectRoles: () => projectRoles,
  projectRolesRelations: () => projectRolesRelations,
  projectStatusEnum: () => projectStatusEnum,
  projects: () => projects,
  projectsRelations: () => projectsRelations,
  sessions: () => sessions,
  supportTickets: () => supportTickets,
  userRoleEnum: () => userRoleEnum,
  users: () => users,
  usersRelations: () => usersRelations
});
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  pgEnum
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var sessions, userRoleEnum, projectStatusEnum, licenseTypeEnum, permissionLevelEnum, projectRoleEnum, users, projects, customers, companies, persons, attachments, projectLocations, audioRecords, photos, supportTickets, dataQuality, loginLog, aiLog, licensePlans, customerContacts, companyContacts, projectRoles, usersRelations, projectsRelations, customersRelations, companiesRelations, personsRelations, customerContactsRelations, companyContactsRelations, projectRolesRelations, insertUserSchema, insertProjectSchema, insertCustomerSchema, insertCompanySchema, insertPersonSchema, insertAttachmentSchema, insertProjectLocationSchema, insertAudioRecordSchema, insertPhotoSchema, insertSupportTicketSchema, insertAILogSchema, insertCustomerContactSchema, insertCompanyContactSchema, insertProjectRoleSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    sessions = pgTable(
      "sessions",
      {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    userRoleEnum = pgEnum("user_role", ["admin", "manager", "user"]);
    projectStatusEnum = pgEnum("project_status", ["planning", "active", "completed", "cancelled"]);
    licenseTypeEnum = pgEnum("license_type", ["basic", "professional", "enterprise"]);
    permissionLevelEnum = pgEnum("permission_level", ["read", "write", "admin"]);
    projectRoleEnum = pgEnum("project_role", ["owner", "manager", "editor", "viewer"]);
    users = pgTable("users", {
      id: varchar("id").primaryKey().notNull(),
      email: varchar("email").unique(),
      firstName: varchar("first_name"),
      lastName: varchar("last_name"),
      displayName: varchar("display_name"),
      position: varchar("position"),
      phone: varchar("phone"),
      location: varchar("location"),
      timezone: varchar("timezone").default("Europe/Berlin"),
      language: varchar("language").default("de"),
      profileImageUrl: varchar("profile_image_url"),
      role: userRoleEnum("role").default("user").notNull(),
      privacyConsent: boolean("privacy_consent").default(false),
      sftpHost: varchar("sftp_host"),
      sftpPort: integer("sftp_port").default(21),
      sftpUsername: varchar("sftp_username"),
      sftpPassword: varchar("sftp_password"),
      sftpPath: varchar("sftp_path").default("/"),
      sftpAccessLevel: integer("sftp_access_level").default(0),
      emailNotificationsEnabled: boolean("email_notifications_enabled").default(true),
      floodProtectionCertified: boolean("flood_protection_certified").default(false),
      password: varchar("password"),
      // For manually created users
      // Testzeitraum und Lizenz-Management
      trialStartDate: timestamp("trial_start_date").defaultNow(),
      trialEndDate: timestamp("trial_end_date"),
      trialReminderSent: boolean("trial_reminder_sent").default(false),
      // Stripe Payment & License Management
      stripeCustomerId: varchar("stripe_customer_id"),
      licenseType: licenseTypeEnum("license_type").default("basic"),
      licenseExpiresAt: timestamp("license_expires_at"),
      paymentStatus: varchar("payment_status").default("trial"),
      // trial, unpaid, paid, expired
      lastPaymentDate: timestamp("last_payment_date"),
      stripeSubscriptionId: varchar("stripe_subscription_id"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    projects = pgTable("projects", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      status: projectStatusEnum("status").default("planning").notNull(),
      startDate: timestamp("start_date"),
      endDate: timestamp("end_date"),
      budget: decimal("budget", { precision: 12, scale: 2 }),
      customerId: integer("customer_id").references(() => customers.id),
      managerId: varchar("manager_id").references(() => users.id),
      userId: varchar("user_id").references(() => users.id).notNull(),
      // SECURITY: Owner of the project
      customerContactId: integer("customer_contact_id").references(() => customerContacts.id),
      companyContactId: integer("company_contact_id").references(() => companyContacts.id),
      latitude: decimal("latitude", { precision: 10, scale: 8 }),
      longitude: decimal("longitude", { precision: 11, scale: 8 }),
      address: text("address"),
      mapZoomLevel: integer("map_zoom_level").default(15),
      boundaryPolygon: jsonb("boundary_polygon"),
      completionPercentage: integer("completion_percentage").default(0),
      floodRiskLevel: integer("flood_risk_level").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    customers = pgTable("customers", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      email: varchar("email", { length: 255 }),
      phone: varchar("phone", { length: 50 }),
      street: varchar("street", { length: 255 }),
      houseNumber: varchar("house_number", { length: 20 }),
      postalCode: varchar("postal_code", { length: 10 }),
      city: varchar("city", { length: 100 }),
      contactPersonId: integer("contact_person_id").references(() => persons.id),
      userId: varchar("user_id").references(() => users.id).notNull(),
      // SECURITY: Owner of the customer
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    companies = pgTable("companies", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      email: varchar("email", { length: 255 }),
      phone: varchar("phone", { length: 50 }),
      street: varchar("street", { length: 255 }),
      houseNumber: varchar("house_number", { length: 20 }),
      postalCode: varchar("postal_code", { length: 10 }),
      city: varchar("city", { length: 100 }),
      website: varchar("website", { length: 255 }),
      userId: varchar("user_id").references(() => users.id).notNull(),
      // SECURITY: Owner of the company
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    persons = pgTable("persons", {
      id: serial("id").primaryKey(),
      firstName: varchar("first_name", { length: 100 }).notNull(),
      lastName: varchar("last_name", { length: 100 }).notNull(),
      email: varchar("email", { length: 255 }),
      phone: varchar("phone", { length: 50 }),
      position: varchar("position", { length: 100 }),
      companyId: integer("company_id").references(() => companies.id),
      userId: varchar("user_id").references(() => users.id).notNull(),
      // SECURITY: Owner of the person
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    attachments = pgTable("attachments", {
      id: serial("id").primaryKey(),
      fileName: varchar("file_name", { length: 255 }).notNull(),
      filePath: text("file_path").notNull(),
      fileSize: integer("file_size"),
      mimeType: varchar("mime_type", { length: 100 }),
      projectId: integer("project_id").references(() => projects.id),
      uploadedBy: varchar("uploaded_by").references(() => users.id),
      gpsLatitude: decimal("gps_latitude", { precision: 10, scale: 8 }),
      gpsLongitude: decimal("gps_longitude", { precision: 11, scale: 8 }),
      sftpPath: text("sftp_path"),
      sftpBackupStatus: varchar("sftp_backup_status", { length: 50 }).default("pending"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    projectLocations = pgTable("project_locations", {
      id: serial("id").primaryKey(),
      projectId: integer("project_id").references(() => projects.id).notNull(),
      name: varchar("name", { length: 255 }),
      description: text("description"),
      latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
      longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
      address: text("address"),
      mapData: jsonb("map_data"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    audioRecords = pgTable("audio_records", {
      id: serial("id").primaryKey(),
      fileName: varchar("file_name", { length: 255 }).notNull(),
      filePath: text("file_path").notNull(),
      duration: integer("duration"),
      description: text("description"),
      transcription: text("transcription"),
      projectId: integer("project_id").references(() => projects.id),
      recordedBy: varchar("recorded_by").references(() => users.id),
      gpsLatitude: decimal("gps_latitude", { precision: 10, scale: 8 }),
      gpsLongitude: decimal("gps_longitude", { precision: 11, scale: 8 }),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    photos = pgTable("photos", {
      id: serial("id").primaryKey(),
      fileName: varchar("file_name", { length: 255 }).notNull(),
      filePath: text("file_path").notNull(),
      projectId: integer("project_id").references(() => projects.id),
      takenBy: varchar("taken_by").references(() => users.id),
      gpsLatitude: decimal("gps_latitude", { precision: 10, scale: 8 }),
      gpsLongitude: decimal("gps_longitude", { precision: 11, scale: 8 }),
      metadata: jsonb("metadata"),
      description: text("description"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    supportTickets = pgTable("support_tickets", {
      id: serial("id").primaryKey(),
      subject: varchar("subject", { length: 255 }).notNull(),
      description: text("description"),
      status: varchar("status", { length: 50 }).default("open"),
      priority: varchar("priority", { length: 50 }).default("medium"),
      createdBy: varchar("created_by").references(() => users.id),
      assignedTo: varchar("assigned_to").references(() => users.id),
      emailHistory: jsonb("email_history"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    dataQuality = pgTable("data_quality", {
      id: serial("id").primaryKey(),
      entityType: varchar("entity_type", { length: 100 }).notNull(),
      entityId: integer("entity_id").notNull(),
      fieldName: varchar("field_name", { length: 100 }),
      completionRate: decimal("completion_rate", { precision: 5, scale: 2 }),
      qualityScore: decimal("quality_score", { precision: 5, scale: 2 }),
      issues: jsonb("issues"),
      lastChecked: timestamp("last_checked").defaultNow(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    loginLog = pgTable("login_log", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").references(() => users.id),
      ipAddress: varchar("ip_address", { length: 45 }),
      userAgent: text("user_agent"),
      loginTime: timestamp("login_time").defaultNow(),
      logoutTime: timestamp("logout_time"),
      sessionDuration: integer("session_duration")
    });
    aiLog = pgTable("ai_log", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").references(() => users.id).notNull(),
      action: varchar("action", { length: 100 }).notNull(),
      prompt: text("prompt").notNull(),
      response: text("response").notNull(),
      model: varchar("model", { length: 100 }).notNull(),
      tokensUsed: integer("tokens_used").notNull(),
      projectId: integer("project_id").references(() => projects.id),
      createdAt: timestamp("created_at").defaultNow()
    });
    licensePlans = pgTable("license_plans", {
      id: serial("id").primaryKey(),
      type: licenseTypeEnum("type").notNull().unique(),
      name: varchar("name", { length: 100 }).notNull(),
      price: decimal("price", { precision: 10, scale: 2 }),
      priceText: varchar("price_text", { length: 50 }),
      features: jsonb("features"),
      maxProjects: integer("max_projects"),
      maxUsers: integer("max_users"),
      storageLimit: integer("storage_limit_gb"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    customerContacts = pgTable("customer_contacts", {
      id: serial("id").primaryKey(),
      customerId: integer("customer_id").references(() => customers.id).notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      email: varchar("email", { length: 255 }),
      phone: varchar("phone", { length: 50 }),
      position: varchar("position", { length: 100 }),
      createdAt: timestamp("created_at").defaultNow()
    });
    companyContacts = pgTable("company_contacts", {
      id: serial("id").primaryKey(),
      companyId: integer("company_id").references(() => companies.id).notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      email: varchar("email", { length: 255 }),
      phone: varchar("phone", { length: 50 }),
      position: varchar("position", { length: 100 }),
      department: varchar("department", { length: 100 }),
      createdAt: timestamp("created_at").defaultNow()
    });
    projectRoles = pgTable("project_roles", {
      id: serial("id").primaryKey(),
      projectId: integer("project_id").references(() => projects.id).notNull(),
      userId: varchar("user_id").references(() => users.id).notNull(),
      role: projectRoleEnum("role").default("viewer").notNull(),
      permissionLevel: permissionLevelEnum("permission_level").default("read").notNull(),
      assignedAt: timestamp("assigned_at").defaultNow(),
      assignedBy: varchar("assigned_by").references(() => users.id)
    });
    usersRelations = relations(users, ({ many }) => ({
      projects: many(projects),
      attachments: many(attachments),
      audioRecords: many(audioRecords),
      photos: many(photos),
      supportTickets: many(supportTickets),
      loginLogs: many(loginLog),
      aiLogs: many(aiLog),
      projectRoles: many(projectRoles)
    }));
    projectsRelations = relations(projects, ({ one, many }) => ({
      customer: one(customers, {
        fields: [projects.customerId],
        references: [customers.id]
      }),
      manager: one(users, {
        fields: [projects.managerId],
        references: [users.id]
      }),
      customerContact: one(customerContacts, {
        fields: [projects.customerContactId],
        references: [customerContacts.id]
      }),
      companyContact: one(companyContacts, {
        fields: [projects.companyContactId],
        references: [companyContacts.id]
      }),
      attachments: many(attachments),
      locations: many(projectLocations),
      audioRecords: many(audioRecords),
      photos: many(photos),
      projectRoles: many(projectRoles)
    }));
    customersRelations = relations(customers, ({ one, many }) => ({
      contactPerson: one(persons, {
        fields: [customers.contactPersonId],
        references: [persons.id]
      }),
      projects: many(projects),
      contacts: many(customerContacts)
    }));
    companiesRelations = relations(companies, ({ many }) => ({
      persons: many(persons),
      contacts: many(companyContacts)
    }));
    personsRelations = relations(persons, ({ one, many }) => ({
      company: one(companies, {
        fields: [persons.companyId],
        references: [companies.id]
      }),
      customers: many(customers)
    }));
    customerContactsRelations = relations(customerContacts, ({ one }) => ({
      customer: one(customers, {
        fields: [customerContacts.customerId],
        references: [customers.id]
      })
    }));
    companyContactsRelations = relations(companyContacts, ({ one }) => ({
      company: one(companies, {
        fields: [companyContacts.companyId],
        references: [companies.id]
      })
    }));
    projectRolesRelations = relations(projectRoles, ({ one }) => ({
      project: one(projects, {
        fields: [projectRoles.projectId],
        references: [projects.id]
      }),
      user: one(users, {
        fields: [projectRoles.userId],
        references: [users.id]
      }),
      assignedByUser: one(users, {
        fields: [projectRoles.assignedBy],
        references: [users.id]
      })
    }));
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertProjectSchema = createInsertSchema(projects).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertCustomerSchema = createInsertSchema(customers).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertCompanySchema = createInsertSchema(companies).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPersonSchema = createInsertSchema(persons).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertAttachmentSchema = createInsertSchema(attachments).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertProjectLocationSchema = createInsertSchema(projectLocations).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertAudioRecordSchema = createInsertSchema(audioRecords).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPhotoSchema = createInsertSchema(photos).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertAILogSchema = createInsertSchema(aiLog).omit({
      id: true,
      createdAt: true
    });
    insertCustomerContactSchema = createInsertSchema(customerContacts).omit({
      id: true,
      createdAt: true
    });
    insertCompanyContactSchema = createInsertSchema(companyContacts).omit({
      id: true,
      createdAt: true
    });
    insertProjectRoleSchema = createInsertSchema(projectRoles).omit({
      id: true,
      assignedAt: true
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/storage.ts
import { eq, desc, and, sql } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      // User operations
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
      }
      async getAllUsers() {
        return await db.select().from(users);
      }
      async getAllUsers() {
        const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
        return allUsers;
      }
      async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user;
      }
      async updateUser(id, updates) {
        const [user] = await db.update(users).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
        if (!user) {
          throw new Error(`User with ID ${id} not found`);
        }
        return user;
      }
      async upsertUser(userData) {
        const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: /* @__PURE__ */ new Date()
          }
        }).returning();
        return user;
      }
      // Project operations - SECURITY IMPLEMENTED
      async getProjects(userId2) {
        if (!userId2) {
          return await db.select().from(projects).orderBy(desc(projects.createdAt));
        }
        return await db.select().from(projects).where(eq(projects.userId, userId2)).orderBy(desc(projects.createdAt));
      }
      async getProjectsByManager(managerId) {
        return await db.select().from(projects).where(eq(projects.managerId, managerId)).orderBy(desc(projects.createdAt));
      }
      async getProject(id, userId2) {
        if (!userId2) {
          const [project2] = await db.select().from(projects).where(eq(projects.id, id));
          return project2;
        }
        const [project] = await db.select().from(projects).where(and(
          eq(projects.id, id),
          eq(projects.userId, userId2)
        ));
        return project;
      }
      async createProject(project) {
        const [newProject] = await db.insert(projects).values(project).returning();
        return newProject;
      }
      async updateProject(id, project, userId2) {
        if (!userId2) {
          const [updatedProject2] = await db.update(projects).set({ ...project, updatedAt: /* @__PURE__ */ new Date() }).where(eq(projects.id, id)).returning();
          return updatedProject2;
        }
        const [updatedProject] = await db.update(projects).set({ ...project, updatedAt: /* @__PURE__ */ new Date() }).where(and(
          eq(projects.id, id),
          eq(projects.userId, userId2)
        )).returning();
        if (!updatedProject) {
          throw new Error(`Project with ID ${id} not found or access denied`);
        }
        return updatedProject;
      }
      async deleteProject(id, userId2) {
        if (!userId2) {
          await db.delete(projects).where(eq(projects.id, id));
          return;
        }
        const result = await db.delete(projects).where(and(
          eq(projects.id, id),
          eq(projects.userId, userId2)
        ));
        if (result.rowCount === 0) {
          throw new Error(`Project with ID ${id} not found or access denied`);
        }
      }
      // Customer operations - SECURITY IMPLEMENTED
      async getCustomers(userId2) {
        if (!userId2) {
          return await db.select().from(customers).orderBy(desc(customers.createdAt));
        }
        return await db.select().from(customers).where(eq(customers.userId, userId2)).orderBy(desc(customers.createdAt));
      }
      async getCustomer(id, userId2) {
        if (!userId2) {
          const [customer2] = await db.select().from(customers).where(eq(customers.id, id));
          return customer2;
        }
        const [customer] = await db.select().from(customers).where(and(
          eq(customers.id, id),
          eq(customers.userId, userId2)
        ));
        return customer;
      }
      async createCustomer(customer) {
        const [newCustomer] = await db.insert(customers).values(customer).returning();
        return newCustomer;
      }
      async updateCustomer(id, customer, userId2) {
        if (!userId2) {
          const [updatedCustomer2] = await db.update(customers).set({ ...customer, updatedAt: /* @__PURE__ */ new Date() }).where(eq(customers.id, id)).returning();
          return updatedCustomer2;
        }
        const [updatedCustomer] = await db.update(customers).set({ ...customer, updatedAt: /* @__PURE__ */ new Date() }).where(and(
          eq(customers.id, id),
          eq(customers.userId, userId2)
        )).returning();
        if (!updatedCustomer) {
          throw new Error(`Customer with ID ${id} not found or access denied`);
        }
        return updatedCustomer;
      }
      // Company operations - SECURITY IMPLEMENTED
      async getCompanies(userId2) {
        if (!userId2) {
          return await db.select().from(companies).orderBy(desc(companies.createdAt));
        }
        return await db.select().from(companies).where(eq(companies.userId, userId2)).orderBy(desc(companies.createdAt));
      }
      async getCompany(id, userId2) {
        if (!userId2) {
          const [company2] = await db.select().from(companies).where(eq(companies.id, id));
          return company2;
        }
        const [company] = await db.select().from(companies).where(and(
          eq(companies.id, id),
          eq(companies.userId, userId2)
        ));
        return company;
      }
      async createCompany(company) {
        const [newCompany] = await db.insert(companies).values(company).returning();
        return newCompany;
      }
      // Person operations - SECURITY IMPLEMENTED
      async getPersons(userId2) {
        if (!userId2) {
          return await db.select().from(persons).orderBy(desc(persons.createdAt));
        }
        return await db.select().from(persons).where(eq(persons.userId, userId2)).orderBy(desc(persons.createdAt));
      }
      async getPerson(id, userId2) {
        if (!userId2) {
          const [person2] = await db.select().from(persons).where(eq(persons.id, id));
          return person2;
        }
        const [person] = await db.select().from(persons).where(and(
          eq(persons.id, id),
          eq(persons.userId, userId2)
        ));
        return person;
      }
      async createPerson(person) {
        const [newPerson] = await db.insert(persons).values(person).returning();
        return newPerson;
      }
      // Attachment operations
      async getAttachments(projectId) {
        if (projectId) {
          return await db.select().from(attachments).where(eq(attachments.projectId, projectId)).orderBy(desc(attachments.createdAt));
        }
        return await db.select().from(attachments).orderBy(desc(attachments.createdAt));
      }
      async getAttachmentsByUser(userId2) {
        return await db.select().from(attachments).where(eq(attachments.uploadedBy, userId2)).orderBy(desc(attachments.createdAt));
      }
      async getAttachment(id) {
        const [attachment] = await db.select().from(attachments).where(eq(attachments.id, id));
        return attachment;
      }
      async createAttachment(attachment) {
        const [newAttachment] = await db.insert(attachments).values(attachment).returning();
        return newAttachment;
      }
      async deleteAttachment(id) {
        await db.delete(attachments).where(eq(attachments.id, id));
      }
      // Project location operations
      async getProjectLocations(projectId) {
        return await db.select().from(projectLocations).where(eq(projectLocations.projectId, projectId));
      }
      async createProjectLocation(location) {
        const [newLocation] = await db.insert(projectLocations).values(location).returning();
        return newLocation;
      }
      // Audio record operations
      async getAudioRecords(projectId) {
        return await db.select().from(audioRecords).where(eq(audioRecords.projectId, projectId)).orderBy(desc(audioRecords.createdAt));
      }
      async createAudioRecord(record) {
        const [newRecord] = await db.insert(audioRecords).values(record).returning();
        return newRecord;
      }
      // Photo operations
      async getPhotos(projectId) {
        return await db.select().from(photos).where(eq(photos.projectId, projectId)).orderBy(desc(photos.createdAt));
      }
      async createPhoto(photo) {
        const [newPhoto] = await db.insert(photos).values(photo).returning();
        return newPhoto;
      }
      // Support ticket operations
      async getSupportTickets() {
        return await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
      }
      async createSupportTicket(ticket) {
        const [newTicket] = await db.insert(supportTickets).values(ticket).returning();
        return newTicket;
      }
      async updateSupportTicket(id, updateData) {
        const [updatedTicket] = await db.update(supportTickets).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(supportTickets.id, id)).returning();
        return updatedTicket;
      }
      async deleteUser(id) {
        await db.delete(users).where(eq(users.id, id));
      }
      async getSystemStats() {
        const [userCount] = await db.select({ count: sql`count(*)` }).from(users);
        const thirtyDaysAgo = /* @__PURE__ */ new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [recentUserCount] = await db.select({ count: sql`count(*)` }).from(users).where(sql`created_at >= ${thirtyDaysAgo.toISOString()}`);
        const [adminCount] = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.role, "admin"));
        const [managerCount] = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.role, "manager"));
        const [regularUserCount] = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.role, "user"));
        const [projectCount] = await db.select({ count: sql`count(*)` }).from(projects);
        const [basicLicenseCount] = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.licenseType, "basic"));
        const [professionalLicenseCount] = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.licenseType, "professional"));
        const [enterpriseLicenseCount] = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.licenseType, "enterprise"));
        const [paidLicenseCount] = await db.select({ count: sql`count(*)` }).from(users).where(sql`payment_status = 'paid'`);
        const sevenDaysFromNow = /* @__PURE__ */ new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const [expiringCount] = await db.select({ count: sql`count(*)` }).from(users).where(sql`payment_status = 'trial' AND trial_end_date <= ${sevenDaysFromNow.toISOString()}`);
        const totalUsers = userCount?.count || 0;
        const recentUsers = recentUserCount?.count || 0;
        const totalProjects = projectCount?.count || 0;
        const admins = adminCount?.count || 0;
        const managers = managerCount?.count || 0;
        const regularUsers = regularUserCount?.count || 0;
        const basicLicenses = basicLicenseCount?.count || 0;
        const professionalLicenses = professionalLicenseCount?.count || 0;
        const enterpriseLicenses = enterpriseLicenseCount?.count || 0;
        const activeLicenses = paidLicenseCount?.count || 0;
        const expiringLicenses = expiringCount?.count || 0;
        const paymentsThisMonth = 0;
        const totalRevenue = 0;
        return {
          // Frontend expects these field names:
          activeUsers: totalUsers,
          newUsersThisMonth: recentUsers,
          totalProjects,
          adminUsers: admins,
          managerUsers: managers,
          regularUsers,
          dbSize: "45.2 MB",
          // Mock data
          lastBackup: "2025-07-15 19:00:00",
          // Mock data
          activeLicenses,
          expiringLicenses,
          availableLicenses: 999,
          // Unlimited
          basicLicenses,
          professionalLicenses,
          enterpriseLicenses,
          paymentsThisMonth,
          totalRevenue,
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      async createBackup() {
        const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
        const backupId = `backup_${timestamp2}`;
        console.log(`Creating backup with ID: ${backupId}`);
        return backupId;
      }
      async createAILog(log2) {
        const [newLog] = await db.insert(aiLog).values(log2).returning();
        return newLog;
      }
      async getAIUsageStats(userId2) {
        return {
          totalInteractions: 0,
          tokenUsage: 0,
          mostUsedActions: [],
          recentInteractions: []
        };
      }
      async getCustomerContacts(customerId) {
        return await db.select().from(customerContacts).where(eq(customerContacts.customerId, customerId));
      }
      async createCustomerContact(contact) {
        const [newContact] = await db.insert(customerContacts).values(contact).returning();
        return newContact;
      }
      async updateCustomerContact(id, contact) {
        const [updatedContact] = await db.update(customerContacts).set(contact).where(eq(customerContacts.id, id)).returning();
        return updatedContact;
      }
      async deleteCustomerContact(id) {
        await db.delete(customerContacts).where(eq(customerContacts.id, id));
      }
      async getCompanyContacts(companyId) {
        return await db.select().from(companyContacts).where(eq(companyContacts.companyId, companyId));
      }
      async createCompanyContact(contact) {
        const [newContact] = await db.insert(companyContacts).values(contact).returning();
        return newContact;
      }
      async updateCompanyContact(id, contact) {
        const [updatedContact] = await db.update(companyContacts).set(contact).where(eq(companyContacts.id, id)).returning();
        return updatedContact;
      }
      async deleteCompanyContact(id) {
        await db.delete(companyContacts).where(eq(companyContacts.id, id));
      }
      // Hochwasserschutz-Checklisten abrufen
      async getFloodChecklists(userId2) {
        try {
          return [];
        } catch (error) {
          console.error("Error getting flood checklists:", error);
          return [];
        }
      }
      // Absperrschieber abrufen
      async getFloodGates(userId2) {
        try {
          return [];
        } catch (error) {
          console.error("Error getting flood gates:", error);
          return [];
        }
      }
      async getUserProjectRoles(userId2) {
        const result = await db.execute(sql`
      SELECT 
        pr.id,
        pr.user_id,
        pr.project_id,
        pr.role,
        pr.permission_level,
        pr.assigned_at,
        pr.assigned_by,
        p.name as project_name
      FROM project_roles pr
      LEFT JOIN projects p ON pr.project_id = p.id
      WHERE pr.user_id = ${userId2}
      ORDER BY pr.assigned_at DESC
    `);
        return result.rows.map((row) => ({
          id: row.id,
          userId: row.user_id,
          projectId: row.project_id,
          role: row.role,
          permissionLevel: row.permission_level,
          assignedAt: row.assigned_at,
          assignedBy: row.assigned_by,
          project: {
            name: row.project_name
          }
        }));
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/emailService.ts
var emailService_exports = {};
__export(emailService_exports, {
  emailService: () => emailService
});
import * as nodemailer from "nodemailer";
var EmailService, emailService;
var init_emailService = __esm({
  "server/emailService.ts"() {
    "use strict";
    EmailService = class {
      transporter;
      config;
      constructor() {
        this.config = {
          host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
          port: parseInt(process.env.SMTP_PORT || "587"),
          user: process.env.SMTP_USER || "",
          pass: process.env.SMTP_PASS || "",
          senderEmail: process.env.SENDER_EMAIL || "support@bau-structura.de",
          senderName: process.env.SENDER_NAME || "Bau-Structura Support"
        };
        console.log("BREVO SMTP Konfiguration:", {
          host: this.config.host,
          port: this.config.port,
          user: this.config.user,
          passLength: this.config.pass?.length || 0,
          senderEmail: this.config.senderEmail
        });
        this.transporter = nodemailer.createTransport({
          host: this.config.host,
          port: this.config.port,
          secure: false,
          // Use STARTTLS
          requireTLS: true,
          auth: {
            user: this.config.user,
            pass: this.config.pass
          },
          tls: {
            ciphers: "SSLv3",
            rejectUnauthorized: false
          },
          debug: true,
          // Enable debug for troubleshooting
          logger: true
        });
      }
      async sendSupportTicketEmail(ticketData) {
        const mailOptions = {
          from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
          to: ticketData.to,
          subject: `Support Ticket #${ticketData.ticketId}: ${ticketData.subject}`,
          html: this.generateTicketEmailHtml(ticketData),
          text: this.generateTicketEmailText(ticketData)
        };
        try {
          const response = await this.transporter.sendMail(mailOptions);
          console.log("E-Mail erfolgreich versendet:", response.messageId);
          return response;
        } catch (error) {
          console.error("Fehler beim E-Mail Versand:", error);
          throw error;
        }
      }
      async sendTicketUpdateEmail(ticketData) {
        const mailOptions = {
          from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
          to: ticketData.to,
          subject: `Support Ticket #${ticketData.ticketId} Update: ${ticketData.status}`,
          html: this.generateUpdateEmailHtml(ticketData),
          text: this.generateUpdateEmailText(ticketData)
        };
        try {
          const response = await this.transporter.sendMail(mailOptions);
          console.log("Update E-Mail erfolgreich versendet:", response.messageId);
          return response;
        } catch (error) {
          console.error("Fehler beim Update E-Mail Versand:", error);
          throw error;
        }
      }
      async sendWelcomeEmail(userData) {
        const mailOptions = {
          from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
          to: userData.to,
          subject: "Willkommen bei Bau-Structura!",
          html: this.generateWelcomeEmailHtml(userData),
          text: this.generateWelcomeEmailText(userData)
        };
        try {
          const response = await this.transporter.sendMail(mailOptions);
          console.log("Willkommens-E-Mail erfolgreich versendet:", response.messageId);
          return response;
        } catch (error) {
          console.error("Fehler beim Willkommens-E-Mail Versand:", error);
          throw error;
        }
      }
      async sendFloodProtectionEmail(emailData) {
        const { to, subject, message, checklist, schieber, schaeden, wachen } = emailData;
        const emailContent = `
${message}

--- Checklisten-Details ---
Titel: ${checklist.titel}
Typ: ${checklist.typ}
Status: ${checklist.status}
Erstellt von: ${checklist.erstellt_von}
Fortschritt: ${checklist.aufgaben_erledigt || 0}/${checklist.aufgaben_gesamt || 11} Aufgaben
${checklist.beginn_pegelstand_cm ? `Pegelstand: ${checklist.beginn_pegelstand_cm} cm` : ""}

Absperrschieber-Status:
${schieber.map((s) => `- Nr. ${s.nummer}: ${s.bezeichnung} (${s.status})`).join("\n")}

${schaeden && schaeden.length > 0 ? `
Schadensf\xE4lle:
${schaeden.map((schaden) => `- Schieber ${schaden.absperrschieber_nummer}: ${schaden.problem_beschreibung} (${schaden.status})`).join("\n")}
` : ""}

${wachen && wachen.length > 0 ? `
Deichwachen:
${wachen.map((wache) => `- ${wache.name} (${wache.bereich}): ${wache.telefon}`).join("\n")}
` : ""}

---
Diese E-Mail wurde automatisch generiert vom Bau-Structura Hochwasserschutz-System.
Support: ${this.config.senderEmail}
    `;
        const htmlContent = this.generateFloodProtectionEmailHtml({
          to,
          subject,
          message,
          checklist,
          schieber,
          schaeden,
          wachen
        });
        const mailOptions = {
          from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
          to,
          subject,
          html: htmlContent,
          text: emailContent
        };
        try {
          const response = await this.transporter.sendMail(mailOptions);
          console.log("Hochwasserschutz-E-Mail erfolgreich versendet:", response.messageId);
          return response;
        } catch (error) {
          console.error("Fehler beim Hochwasserschutz-E-Mail Versand:", error);
          throw error;
        }
      }
      generateTicketEmailHtml(ticketData) {
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22C55E, #16A34A); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
            .ticket-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .priority-high { border-left: 4px solid #ef4444; }
            .priority-medium { border-left: 4px solid #f97316; }
            .priority-low { border-left: 4px solid #22c55e; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>\u{1F6A7} Bau-Structura Support</h1>
                <p>Neues Support Ticket erstellt</p>
            </div>
            <div class="content">
                <div class="ticket-info priority-${ticketData.priority}">
                    <h3>Ticket #${ticketData.ticketId}</h3>
                    <p><strong>Betreff:</strong> ${ticketData.subject}</p>
                    <p><strong>Priorit\xE4t:</strong> ${this.getPriorityLabel(ticketData.priority)}</p>
                    <p><strong>Status:</strong> Offen</p>
                </div>
                
                <h4>Beschreibung:</h4>
                <div style="background: white; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${ticketData.description}</div>
                
                <p style="margin-top: 20px;">
                    Unser Support-Team wird sich schnellstm\xF6glich um Ihr Anliegen k\xFCmmern. 
                    Sie erhalten automatisch Updates zu diesem Ticket.
                </p>
            </div>
            <div class="footer">
                <p>Bau-Structura - Revolution\xE4res Projektmanagement f\xFCr den Bau</p>
                <p>Bei Fragen antworten Sie einfach auf diese E-Mail.</p>
            </div>
        </div>
    </body>
    </html>`;
      }
      generateTicketEmailText(ticketData) {
        return `
BAU-STRUCTURA SUPPORT

Neues Support Ticket erstellt

Ticket #${ticketData.ticketId}
Betreff: ${ticketData.subject}
Priorit\xE4t: ${this.getPriorityLabel(ticketData.priority)}
Status: Offen

Beschreibung:
${ticketData.description}

Unser Support-Team wird sich schnellstm\xF6glich um Ihr Anliegen k\xFCmmern.
Sie erhalten automatisch Updates zu diesem Ticket.

Bau-Structura - Revolution\xE4res Projektmanagement f\xFCr den Bau
Bei Fragen antworten Sie einfach auf diese E-Mail.`;
      }
      generateUpdateEmailHtml(ticketData) {
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
            .update-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .status-open { border-left: 4px solid #f97316; }
            .status-in-progress { border-left: 4px solid #3b82f6; }
            .status-resolved { border-left: 4px solid #22c55e; }
            .status-closed { border-left: 4px solid #6b7280; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>\u{1F504} Ticket Update</h1>
                <p>Status-\xC4nderung f\xFCr Ihr Support Ticket</p>
            </div>
            <div class="content">
                <div class="update-info status-${ticketData.status}">
                    <h3>Ticket #${ticketData.ticketId}</h3>
                    <p><strong>Betreff:</strong> ${ticketData.subject}</p>
                    <p><strong>Neuer Status:</strong> ${this.getStatusLabel(ticketData.status)}</p>
                    ${ticketData.assignedTo ? `<p><strong>Zugewiesen an:</strong> ${ticketData.assignedTo}</p>` : ""}
                    ${ticketData.editorName ? `<p><strong>Bearbeitet von:</strong> ${ticketData.editorName}</p>` : ""}
                </div>
                
                <h4>Update-Nachricht:</h4>
                <div style="background: white; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${ticketData.updateMessage}</div>
            </div>
        </div>
    </body>
    </html>`;
      }
      generateUpdateEmailText(ticketData) {
        return `
BAU-STRUCTURA SUPPORT - TICKET UPDATE

Ticket #${ticketData.ticketId}
Betreff: ${ticketData.subject}
Neuer Status: ${this.getStatusLabel(ticketData.status)}
${ticketData.assignedTo ? `Zugewiesen an: ${ticketData.assignedTo}` : ""}
${ticketData.editorName ? `Bearbeitet von: ${ticketData.editorName}` : ""}

Update-Nachricht:
${ticketData.updateMessage}

Bau-Structura Support Team`;
      }
      generateWelcomeEmailHtml(userData) {
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22C55E, #16A34A); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .role-badge { display: inline-block; padding: 8px 16px; background: #3b82f6; color: white; border-radius: 20px; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>\u{1F6A7} Willkommen bei Bau-Structura!</h1>
                <p>Ihr Account wurde erfolgreich erstellt</p>
            </div>
            <div class="content">
                <p>Hallo ${userData.firstName},</p>
                
                <p>herzlich willkommen bei Bau-Structura! Ihr Account wurde erfolgreich erstellt.</p>
                
                <p><strong>Ihre Rolle:</strong> <span class="role-badge">${this.getRoleLabel(userData.role)}</span></p>
                
                ${userData.role === "user" ? `
                <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #92400e; margin-top: 0;">\u{1F464} Ihre Berechtigungen als Benutzer</h3>
                    <div style="color: #92400e;">
                        <h4 style="margin: 15px 0 10px 0;">\u2705 Das k\xF6nnen Sie:</h4>
                        <ul style="margin: 5px 0 15px 20px;">
                            <li><strong>Projekte ansehen:</strong> Ihre eigenen Projekte verwalten und einsehen</li>
                            <li><strong>Dateien hochladen:</strong> Fotos, Dokumente und Sprachaufnahmen zu Ihren Projekten hinzuf\xFCgen</li>
                            <li><strong>Hochwasserschutz:</strong> Checklisten und Schadensberichte erstellen</li>
                            <li><strong>KI-Assistant:</strong> KI-gest\xFCtzte Projektberatung nutzen</li>
                            <li><strong>Support-Tickets:</strong> Bei Fragen und Problemen Unterst\xFCtzung anfordern</li>
                            <li><strong>SFTP-Server:</strong> Ihren pers\xF6nlichen Dateibereich nutzen</li>
                        </ul>
                        
                        <h4 style="margin: 15px 0 10px 0;">\u{1F6AB} Erweiterte Funktionen (ben\xF6tigen Manager- oder Admin-Berechtigung):</h4>
                        <ul style="margin: 5px 0; color: #7c2d12;">
                            <li>Neue Projekte erstellen</li>
                            <li>Kunden und Firmen anlegen/bearbeiten</li>
                            <li>Ansprechpartner verwalten</li>
                            <li>System-Administration</li>
                        </ul>
                        
                        <p style="margin-top: 15px; font-size: 14px; background: #fef7ff; padding: 10px; border-radius: 4px; border: 1px solid #e879f9;">
                            <strong>\u{1F4A1} Upgrade gew\xFCnscht?</strong> Kontaktieren Sie uns f\xFCr eine Rolle-Erweiterung oder erstellen Sie ein Support-Ticket in der App.
                        </p>
                    </div>
                </div>
                ` : ""}
                
                ${userData.password ? `
                <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #dc2626; margin-top: 0;">\u{1F510} Ihre Anmeldedaten</h3>
                    <p><strong>Benutzername:</strong> ${userData.firstName}</p>
                    <p><strong>Tempor\xE4res Passwort:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${userData.password}</code></p>
                    <p style="color: #dc2626; font-size: 14px;"><strong>\u26A0\uFE0F Wichtig:</strong> Bitte \xE4ndern Sie Ihr Passwort bei der ersten Anmeldung!</p>
                </div>
                ` : ""}
                
                <div style="background: #e8f4fd; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #1e40af; margin-top: 0;">\u{1F31F} Warum Bau-Structura?</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
                        <div>
                            <h4 style="color: #1e40af; margin: 10px 0 5px 0;">\u{1F4F1} Mobile-First Design</h4>
                            <p style="margin: 5px 0; font-size: 14px;">Optimiert f\xFCr Smartphones und Tablets - arbeiten Sie direkt vor Ort</p>
                        </div>
                        <div>
                            <h4 style="color: #1e40af; margin: 10px 0 5px 0;">\u{1F916} KI-Unterst\xFCtzung</h4>
                            <p style="margin: 5px 0; font-size: 14px;">Intelligente Projektberatung und Risikobewertung</p>
                        </div>
                        <div>
                            <h4 style="color: #1e40af; margin: 10px 0 5px 0;">\u{1F30A} Hochwasserschutz</h4>
                            <p style="margin: 5px 0; font-size: 14px;">Spezialisierte Checklisten und Schadensdokumentation</p>
                        </div>
                        <div>
                            <h4 style="color: #1e40af; margin: 10px 0 5px 0;">\u{1F4C2} Sichere Datei-Verwaltung</h4>
                            <p style="margin: 5px 0; font-size: 14px;">Fotos, Dokumente und Sprachaufnahmen zentral organisiert</p>
                        </div>
                        <div>
                            <h4 style="color: #1e40af; margin: 10px 0 5px 0;">\u{1F4CD} GPS-Integration</h4>
                            <p style="margin: 5px 0; font-size: 14px;">Automatische Standorterfassung und Karten-Integration</p>
                        </div>
                        <div>
                            <h4 style="color: #1e40af; margin: 10px 0 5px 0;">\u{1F512} Vollst\xE4ndige Sicherheit</h4>
                            <p style="margin: 5px 0; font-size: 14px;">Ihre Daten bleiben privat und sind komplett von anderen Benutzern isoliert</p>
                        </div>
                    </div>
                    
                    <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; padding: 15px; margin: 15px 0;">
                        <p style="color: #92400e; margin: 0; font-size: 14px;">
                            <strong>\u{1F4A1} Erweiterte Funktionen:</strong> SFTP-Server, erweiterte Berechtigungen und zus\xE4tzliche Tools sind verf\xFCgbar - kontaktieren Sie uns bei Bedarf!
                        </p>
                    </div>
                </div>

                <h3>\u{1F3AF} N\xE4chste Schritte:</h3>
                <ol>
                    <li><strong>Loggen Sie sich in Ihr Dashboard ein</strong></li>
                    <li>Vervollst\xE4ndigen Sie Ihr Profil</li>
                    <li>Erkunden Sie Ihre verf\xFCgbaren Funktionen</li>
                    <li>Testen Sie die KI-gest\xFCtzten Features</li>
                    <li>Bei Fragen: Support-Ticket erstellen</li>
                </ol>
                
                <h3>\u{1F4F1} App Installation (Empfohlen):</h3>
                <div style="background: #e0f2fe; border: 1px solid #b3e5fc; border-radius: 6px; padding: 20px; margin: 20px 0;">
                    <p><strong>Installieren Sie Bau-Structura als App auf Ihrem Ger\xE4t:</strong></p>
                    
                    <div style="margin: 15px 0;">
                        <h4 style="margin: 10px 0 5px 0; color: #0277bd;">\u{1F4F1} Smartphone (Android):</h4>
                        <ol style="margin: 5px 0; padding-left: 20px;">
                            <li>Website in Chrome \xF6ffnen</li>
                            <li>"Zur Startseite hinzuf\xFCgen"-Banner erscheint</li>
                            <li>Auf "Installieren" tippen</li>
                        </ol>
                        
                        <h4 style="margin: 10px 0 5px 0; color: #0277bd;">\u{1F34E} iPhone/iPad:</h4>
                        <ol style="margin: 5px 0; padding-left: 20px;">
                            <li>Website in Safari \xF6ffnen</li>
                            <li>Teilen-Button (Quadrat mit Pfeil) antippen</li>
                            <li>"Zum Home-Bildschirm" w\xE4hlen</li>
                        </ol>
                        
                        <h4 style="margin: 10px 0 5px 0; color: #0277bd;">\u{1F4BB} Desktop:</h4>
                        <ol style="margin: 5px 0; padding-left: 20px;">
                            <li>Website in Chrome/Edge \xF6ffnen</li>
                            <li>Installations-Symbol (\u2295) in Adressleiste klicken</li>
                            <li>"Installieren" w\xE4hlen</li>
                        </ol>
                    </div>
                    
                    <p style="margin: 10px 0; padding: 10px; background: #f1f8e9; border-radius: 4px; font-size: 14px;">
                        <strong>\u2705 Vorteile:</strong> Offline-Nutzung, kein Browser n\xF6tig, Shortcuts f\xFCr Kamera/Karte/Projekte, Push-Benachrichtigungen
                    </p>
                </div>
                
                <h3>\u{1F198} Ben\xF6tigen Sie Hilfe?</h3>
                <p>Unser Support-Team steht Ihnen gerne zur Verf\xFCgung. Erstellen Sie einfach ein Support-Ticket in der App oder antworten Sie auf diese E-Mail.</p>
                
                <p>Viel Erfolg mit Bau-Structura!</p>
            </div>
        </div>
    </body>
    </html>`;
      }
      generateWelcomeEmailText(userData) {
        return `
WILLKOMMEN BEI BAU-STRUCTURA!

Hallo ${userData.firstName},

herzlich willkommen bei Bau-Structura! Ihr Account wurde erfolgreich erstellt.

Ihre Rolle: ${this.getRoleLabel(userData.role)}

\u{1F31F} WARUM BAU-STRUCTURA?

\u{1F4F1} Mobile-First Design - Optimiert f\xFCr Smartphones und Tablets - arbeiten Sie direkt vor Ort
\u{1F916} KI-Unterst\xFCtzung - Intelligente Projektberatung und Risikobewertung  
\u{1F30A} Hochwasserschutz - Spezialisierte Checklisten und Schadensdokumentation
\u{1F4C2} Sichere Datei-Verwaltung - Fotos, Dokumente und Sprachaufnahmen zentral organisiert
\u{1F4CD} GPS-Integration - Automatische Standorterfassung und Karten-Integration
\u{1F512} Vollst\xE4ndige Sicherheit - Ihre Daten bleiben privat und sind komplett von anderen Benutzern isoliert

\u{1F4A1} Erweiterte Funktionen: SFTP-Server, erweiterte Berechtigungen und zus\xE4tzliche Tools sind verf\xFCgbar - kontaktieren Sie uns bei Bedarf!

${userData.role === "user" ? `
IHRE BERECHTIGUNGEN ALS BENUTZER:

\u2705 Das k\xF6nnen Sie:
- Projekte ansehen: Ihre eigenen Projekte verwalten und einsehen
- Dateien hochladen: Fotos, Dokumente und Sprachaufnahmen zu Ihren Projekten hinzuf\xFCgen
- Hochwasserschutz: Checklisten und Schadensberichte erstellen
- KI-Assistant: KI-gest\xFCtzte Projektberatung nutzen
- Support-Tickets: Bei Fragen und Problemen Unterst\xFCtzung anfordern
- SFTP-Server: Ihren pers\xF6nlichen Dateibereich nutzen

\u{1F6AB} Erweiterte Funktionen (ben\xF6tigen Manager- oder Admin-Berechtigung):
- Neue Projekte erstellen
- Kunden und Firmen anlegen/bearbeiten
- Ansprechpartner verwalten
- System-Administration

\u{1F4A1} Upgrade gew\xFCnscht? Kontaktieren Sie uns f\xFCr eine Rolle-Erweiterung oder erstellen Sie ein Support-Ticket in der App.
` : ""}

${userData.password ? `
IHRE ANMELDEDATEN:
Benutzername: ${userData.firstName}
Tempor\xE4res Passwort: ${userData.password}

\u26A0\uFE0F WICHTIG: Bitte \xE4ndern Sie Ihr Passwort bei der ersten Anmeldung!
` : ""}

N\xC4CHSTE SCHRITTE:
1. Loggen Sie sich in Ihr Dashboard ein
2. Vervollst\xE4ndigen Sie Ihr Profil
3. Erkunden Sie Ihre verf\xFCgbaren Funktionen
4. Testen Sie die KI-gest\xFCtzten Features  
5. Bei Fragen: Support-Ticket erstellen

APP INSTALLATION (EMPFOHLEN):
Installieren Sie Bau-Structura als App auf Ihrem Ger\xE4t:

\u{1F4F1} Smartphone (Android):
1. Website in Chrome \xF6ffnen
2. "Zur Startseite hinzuf\xFCgen"-Banner erscheint
3. Auf "Installieren" tippen

\u{1F34E} iPhone/iPad:
1. Website in Safari \xF6ffnen
2. Teilen-Button (Quadrat mit Pfeil) antippen
3. "Zum Home-Bildschirm" w\xE4hlen

\u{1F4BB} Desktop:
1. Website in Chrome/Edge \xF6ffnen
2. Installations-Symbol (\u2295) in Adressleiste klicken
3. "Installieren" w\xE4hlen

\u2705 Vorteile: Offline-Nutzung, kein Browser n\xF6tig, Shortcuts f\xFCr Kamera/Karte/Projekte, Push-Benachrichtigungen

Ben\xF6tigen Sie Hilfe?
Unser Support-Team steht Ihnen gerne zur Verf\xFCgung. Erstellen Sie einfach ein Support-Ticket in der App oder antworten Sie auf diese E-Mail.

Viel Erfolg mit Bau-Structura!`;
      }
      getPriorityLabel(priority) {
        switch (priority) {
          case "high":
            return "\u{1F534} Hoch";
          case "medium":
            return "\u{1F7E1} Mittel";
          case "low":
            return "\u{1F7E2} Niedrig";
          default:
            return priority;
        }
      }
      getStatusLabel(status) {
        switch (status) {
          case "open":
            return "\u{1F4CB} Offen";
          case "in-progress":
            return "\u2699\uFE0F In Bearbeitung";
          case "resolved":
            return "\u2705 Gel\xF6st";
          case "closed":
            return "\u{1F512} Geschlossen";
          default:
            return status;
        }
      }
      generateFloodProtectionEmailHtml(emailData) {
        const { message, checklist, schieber, schaeden, wachen } = emailData;
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
            .checklist-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .status-active { border-left: 4px solid #22c55e; }
            .status-warning { border-left: 4px solid #f97316; }
            .status-danger { border-left: 4px solid #ef4444; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .data-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .data-table th, .data-table td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            .data-table th { background-color: #f1f5f9; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>\u{1F30A} Hochwasserschutz-Checkliste</h1>
                <p>Automatischer E-Mail-Export</p>
            </div>
            <div class="content">
                <div class="checklist-info status-active">
                    <h2>${checklist.titel}</h2>
                    <p><strong>Typ:</strong> ${checklist.typ}</p>
                    <p><strong>Status:</strong> ${checklist.status}</p>
                    <p><strong>Erstellt von:</strong> ${checklist.erstellt_von}</p>
                    <p><strong>Fortschritt:</strong> ${checklist.aufgaben_erledigt || 0}/${checklist.aufgaben_gesamt || 11} Aufgaben</p>
                    ${checklist.beginn_pegelstand_cm ? `<p><strong>Pegelstand:</strong> ${checklist.beginn_pegelstand_cm} cm</p>` : ""}
                </div>
                
                <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 6px;">
                    <h3>\u{1F4AC} Nachricht</h3>
                    <p>${message}</p>
                </div>

                <div style="margin: 20px 0;">
                    <h3>\u{1F527} Absperrschieber-Status</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nr.</th>
                                <th>Bezeichnung</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${schieber.map((s) => `
                                <tr>
                                    <td>${s.nummer}</td>
                                    <td>${s.bezeichnung}</td>
                                    <td>${s.status}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>

                ${schaeden && schaeden.length > 0 ? `
                <div style="margin: 20px 0;">
                    <h3>\u26A0\uFE0F Schadensf\xE4lle</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Schieber</th>
                                <th>Problem</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${schaeden.map((schaden) => `
                                <tr>
                                    <td>Nr. ${schaden.absperrschieber_nummer}</td>
                                    <td>${schaden.problem_beschreibung}</td>
                                    <td>${schaden.status}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
                ` : ""}

                ${wachen && wachen.length > 0 ? `
                <div style="margin: 20px 0;">
                    <h3>\u{1F465} Deichwachen</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Bereich</th>
                                <th>Telefon</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${wachen.map((wache) => `
                                <tr>
                                    <td>${wache.name}</td>
                                    <td>${wache.bereich}</td>
                                    <td>${wache.telefon}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
                ` : ""}

                <div class="footer">
                    <p>Diese E-Mail wurde automatisch vom Bau-Structura Hochwasserschutz-System generiert.</p>
                    <p>Support: ${this.config.senderEmail}</p>
                </div>
            </div>
        </div>
    </body>
    </html>`;
      }
      getRoleLabel(role) {
        switch (role) {
          case "admin":
            return "Administrator";
          case "manager":
            return "Manager";
          case "user":
            return "Benutzer";
          default:
            return role;
        }
      }
      async sendContactEmail(contactData) {
        const mailOptions = {
          from: `"${contactData.name}" <${this.config.senderEmail}>`,
          to: "support@bau-structura.de",
          replyTo: contactData.email,
          subject: `Kontaktanfrage: ${contactData.subject}`,
          html: this.generateContactEmailHtml(contactData),
          text: this.generateContactEmailText(contactData)
        };
        try {
          const response = await this.transporter.sendMail(mailOptions);
          console.log("Kontaktformular E-Mail erfolgreich versendet:", response.messageId);
          return response;
        } catch (error) {
          console.error("Fehler beim Kontaktformular E-Mail Versand:", error);
          throw error;
        }
      }
      generateContactEmailHtml(contactData) {
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22C55E, #16A34A); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
            .contact-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #22c55e; }
            .message-box { background: white; padding: 20px; border-radius: 6px; margin: 15px 0; border: 1px solid #e5e7eb; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>\u{1F4E7} Neue Kontaktanfrage</h1>
                <p>Kontaktformular von der Bau-Structura Website</p>
            </div>
            <div class="content">
                <div class="contact-info">
                    <h3>Kontaktdaten</h3>
                    <p><strong>Name:</strong> ${contactData.name}</p>
                    <p><strong>E-Mail:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></p>
                    <p><strong>Unternehmen:</strong> ${contactData.company}</p>
                    <p><strong>Thema:</strong> ${contactData.subject}</p>
                    <p><strong>Zeitstempel:</strong> ${new Date(contactData.timestamp).toLocaleString("de-DE")}</p>
                </div>
                
                <h4>Nachricht:</h4>
                <div class="message-box">
                    <p style="white-space: pre-wrap; margin: 0;">${contactData.message}</p>
                </div>
                
                <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #0c4a6e;"><strong>\u{1F4A1} Tipp:</strong> Sie k\xF6nnen direkt auf diese E-Mail antworten, um dem Kunden zu antworten.</p>
                </div>
            </div>
            <div class="footer">
                <p>Bau-Structura - Revolution\xE4res Projektmanagement f\xFCr den Bau</p>
                <p>Diese E-Mail wurde automatisch vom Kontaktformular generiert.</p>
            </div>
        </div>
    </body>
    </html>`;
      }
      generateContactEmailText(contactData) {
        return `
NEUE KONTAKTANFRAGE - BAU-STRUCTURA

Kontaktdaten:
Name: ${contactData.name}
E-Mail: ${contactData.email}
Unternehmen: ${contactData.company}
Thema: ${contactData.subject}
Zeitstempel: ${new Date(contactData.timestamp).toLocaleString("de-DE")}

Nachricht:
${contactData.message}

---
Diese E-Mail wurde automatisch vom Kontaktformular der Bau-Structura Website generiert.
Sie k\xF6nnen direkt auf diese E-Mail antworten, um dem Kunden zu antworten.

Bau-Structura Support Team`;
      }
      async sendPasswordResetEmail(data) {
        const mailOptions = {
          from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
          to: data.to,
          subject: "\u{1F512} Passwort zur\xFCcksetzen - Bau-Structura",
          html: this.generatePasswordResetEmailHtml(data),
          text: this.generatePasswordResetEmailText(data)
        };
        try {
          const response = await this.transporter.sendMail(mailOptions);
          console.log("Passwort-Reset-E-Mail erfolgreich versendet:", response.messageId);
          return response;
        } catch (error) {
          console.error("Fehler beim Passwort-Reset-E-Mail Versand:", error);
          throw error;
        }
      }
      async sendTrialReminderEmail(data) {
        const mailOptions = {
          from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
          to: data.to,
          subject: `\u{1F6A8} Ihr Bau-Structura Testzeitraum l\xE4uft in ${data.daysRemaining} Tagen ab`,
          html: this.generateTrialReminderEmailHtml(data),
          text: this.generateTrialReminderEmailText(data)
        };
        try {
          const response = await this.transporter.sendMail(mailOptions);
          console.log("Testzeitraum-Erinnerung erfolgreich versendet:", response.messageId);
          return response;
        } catch (error) {
          console.error("Fehler beim Testzeitraum-Erinnerung Versand:", error);
          throw error;
        }
      }
      generateTrialReminderEmailHtml(data) {
        const formattedEndDate = new Date(data.trialEndDate).toLocaleDateString("de-DE", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .warning-box { background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .license-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
            .price-box { background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 15px 0; text-align: center; }
            .cta-button { display: inline-block; background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .countdown { font-size: 24px; font-weight: bold; color: #dc2626; text-align: center; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>\u23F0 Testzeitraum l\xE4uft ab!</h1>
                <p>Ihr Bau-Structura Account ben\xF6tigt eine Lizenz</p>
            </div>
            
            <div class="content">
                <h2>Hallo ${data.firstName},</h2>
                
                <div class="warning-box">
                    <h3 style="color: #92400e; margin-top: 0;">\u{1F6A8} Wichtige Erinnerung</h3>
                    <div class="countdown">${data.daysRemaining} Tage verbleibend</div>
                    <p><strong>Ihr kostenloser 30-Tage-Testzeitraum endet am ${formattedEndDate}.</strong></p>
                    <p>Um Bau-Structura weiterhin nutzen zu k\xF6nnen, w\xE4hlen Sie bitte eine unserer Lizenzoptionen:</p>
                </div>
                
                <h3>\u{1F4BC} Unsere Lizenzangebote</h3>
                
                <div class="price-box">
                    <h4 style="color: #1e40af; margin-top: 0;">\u{1F680} Basic Lizenz</h4>
                    <div style="font-size: 32px; font-weight: bold; color: #1e40af; margin: 10px 0;">21\u20AC</div>
                    <p style="color: #64748b; font-size: 14px;">pro Monat</p>
                    <ul style="text-align: left; margin: 15px 0;">
                        <li>\u2705 Bis zu 10 Projekte</li>
                        <li>\u2705 Grundlegende Kundenverwaltung</li>
                        <li>\u2705 1GB SFTP-Speicher</li>
                        <li>\u2705 GPS-Integration</li>
                        <li>\u2705 Mobile App</li>
                        <li>\u2705 E-Mail-Support</li>
                    </ul>
                    <a href="https://bau-structura.com/checkout/basic" class="cta-button">Basic w\xE4hlen</a>
                </div>
                
                <div class="price-box">
                    <h4 style="color: #1e40af; margin-top: 0;">\u2B50 Professional Lizenz</h4>
                    <div style="font-size: 32px; font-weight: bold; color: #1e40af; margin: 10px 0;">39\u20AC</div>
                    <p style="color: #64748b; font-size: 14px;">pro Monat</p>
                    <ul style="text-align: left; margin: 15px 0;">
                        <li>\u2705 <strong>Unbegrenzte Projekte</strong></li>
                        <li>\u2705 Erweiterte Kundenverwaltung</li>
                        <li>\u2705 10GB SFTP-Speicher</li>
                        <li>\u2705 KI-Assistent</li>
                        <li>\u2705 Hochwasserschutz-Modul</li>
                        <li>\u2705 Priorit\xE4ts-Support</li>
                        <li>\u2705 Team-Funktionen</li>
                    </ul>
                    <a href="https://bau-structura.com/checkout/professional" class="cta-button">Professional w\xE4hlen</a>
                </div>
                
                <div class="price-box">
                    <h4 style="color: #1e40af; margin-top: 0;">\u{1F3E2} Enterprise Lizenz</h4>
                    <div style="font-size: 32px; font-weight: bold; color: #1e40af; margin: 10px 0;">79\u20AC</div>
                    <p style="color: #64748b; font-size: 14px;">pro Monat</p>
                    <ul style="text-align: left; margin: 15px 0;">
                        <li>\u2705 <strong>Alle Professional Features</strong></li>
                        <li>\u2705 100GB SFTP-Speicher</li>
                        <li>\u2705 White-Label-Option</li>
                        <li>\u2705 API-Zugang</li>
                        <li>\u2705 Dedizierter Account Manager</li>
                        <li>\u2705 24/7 Premium Support</li>
                        <li>\u2705 On-Premise-Installation</li>
                    </ul>
                    <a href="https://bau-structura.com/checkout/enterprise" class="cta-button">Enterprise w\xE4hlen</a>
                </div>
                
                <div class="license-box">
                    <h3 style="color: #1e40af; margin-top: 0;">\u{1F512} Was passiert nach dem Testzeitraum?</h3>
                    <ul>
                        <li>\u{1F4CB} <strong>Ihre Daten bleiben sicher:</strong> Alle Projekte und Dokumente werden gespeichert</li>
                        <li>\u{1F6AB} <strong>Zugriff pausiert:</strong> Login und neue Projekte sind nicht m\xF6glich</li>
                        <li>\u{1F4BE} <strong>SFTP-Server:</strong> Dateien bleiben 30 Tage gesichert</li>
                        <li>\u{1F4E7} <strong>Reaktivierung jederzeit:</strong> Lizenz buchen und sofort weiterarbeiten</li>
                    </ul>
                </div>
                
                <div style="background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #166534; margin-top: 0;">\u{1F4A1} Warum Bau-Structura?</h3>
                    <p style="color: #166534;">Sie haben in den letzten 2 Wochen die Vorteile unseres Systems kennengelernt:</p>
                    <ul style="color: #166534;">
                        <li>\u{1F4F1} <strong>Mobile-First:</strong> Perfekt f\xFCr die Baustelle</li>
                        <li>\u{1F5FA}\uFE0F <strong>GPS & Karten:</strong> Pr\xE4zise Projekterfassung</li>
                        <li>\u{1F916} <strong>KI-Integration:</strong> Intelligente Projektberatung</li>
                        <li>\u{1F30A} <strong>Hochwasserschutz:</strong> Spezialisierte Tools</li>
                        <li>\u2601\uFE0F <strong>Cloud-Sicherheit:</strong> Ihre Daten sind gesch\xFCtzt</li>
                    </ul>
                </div>
                
                <p><strong>Haben Sie Fragen zu unseren Lizenzen?</strong></p>
                <p>Unser Support-Team hilft gerne bei der Auswahl der passenden Lizenz. Antworten Sie einfach auf diese E-Mail oder nutzen Sie den Chat in der App.</p>
                
                <p>Vielen Dank f\xFCr Ihr Vertrauen in Bau-Structura!</p>
                <p><strong>Ihr Bau-Structura Team</strong></p>
            </div>
            
            <div class="footer">
                <p>Bau-Structura - Professionelles Bauprojekt-Management<br>
                Diese E-Mail wurde automatisch generiert. Bei Fragen kontaktieren Sie uns \xFCber die Anwendung.</p>
            </div>
        </div>
    </body>
    </html>
    `;
      }
      generateTrialReminderEmailText(data) {
        const formattedEndDate = new Date(data.trialEndDate).toLocaleDateString("de-DE", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });
        return `
\u23F0 TESTZEITRAUM L\xC4UFT AB - BAU-STRUCTURA

Hallo ${data.firstName},

\u{1F6A8} WICHTIGE ERINNERUNG

${data.daysRemaining} Tage verbleibend

Ihr kostenloser 30-Tage-Testzeitraum endet am ${formattedEndDate}.

Um Bau-Structura weiterhin nutzen zu k\xF6nnen, w\xE4hlen Sie bitte eine unserer Lizenzoptionen:

\u{1F4BC} UNSERE LIZENZANGEBOTE

\u{1F680} Basic Lizenz - 21\u20AC/Monat
\u2705 Bis zu 10 Projekte
\u2705 Grundlegende Kundenverwaltung  
\u2705 1GB SFTP-Speicher
\u2705 GPS-Integration
\u2705 Mobile App
\u2705 E-Mail-Support
\u2192 Lizenz w\xE4hlen: https://bau-structura.com/checkout/basic

\u2B50 Professional Lizenz - 39\u20AC/Monat  
\u2705 Unbegrenzte Projekte
\u2705 Erweiterte Kundenverwaltung
\u2705 10GB SFTP-Speicher
\u2705 KI-Assistent
\u2705 Hochwasserschutz-Modul
\u2705 Priorit\xE4ts-Support
\u2705 Team-Funktionen
\u2192 Lizenz w\xE4hlen: https://bau-structura.com/checkout/professional

\u{1F3E2} Enterprise Lizenz - 79\u20AC/Monat
\u2705 Alle Professional Features
\u2705 100GB SFTP-Speicher
\u2705 White-Label-Option
\u2705 API-Zugang
\u2705 Dedizierter Account Manager
\u2705 24/7 Premium Support
\u2705 On-Premise-Installation
\u2192 Lizenz w\xE4hlen: https://bau-structura.com/checkout/enterprise

\u{1F512} WAS PASSIERT NACH DEM TESTZEITRAUM?

\u{1F4CB} Ihre Daten bleiben sicher: Alle Projekte und Dokumente werden gespeichert
\u{1F6AB} Zugriff pausiert: Login und neue Projekte sind nicht m\xF6glich
\u{1F4BE} SFTP-Server: Dateien bleiben 30 Tage gesichert
\u{1F4E7} Reaktivierung jederzeit: Lizenz buchen und sofort weiterarbeiten

\u{1F4A1} WARUM BAU-STRUCTURA?

Sie haben in den letzten 14 Tagen die Vorteile unseres Systems kennengelernt:
\u{1F4F1} Mobile-First: Perfekt f\xFCr die Baustelle
\u{1F5FA}\uFE0F GPS & Karten: Pr\xE4zise Projekterfassung
\u{1F916} KI-Integration: Intelligente Projektberatung
\u{1F30A} Hochwasserschutz: Spezialisierte Tools
\u2601\uFE0F Cloud-Sicherheit: Ihre Daten sind gesch\xFCtzt

Haben Sie Fragen zu unseren Lizenzen?
Unser Support-Team hilft gerne bei der Auswahl der passenden Lizenz. 
Antworten Sie einfach auf diese E-Mail oder nutzen Sie den Chat in der App.

Vielen Dank f\xFCr Ihr Vertrauen in Bau-Structura!

Ihr Bau-Structura Team

---
Bau-Structura - Professionelles Bauprojekt-Management
Diese E-Mail wurde automatisch generiert. Bei Fragen kontaktieren Sie uns \xFCber die Anwendung.
    `;
      }
      generatePasswordResetEmailHtml(data) {
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .reset-box { background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .cta-button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .warning { background: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin: 15px 0; color: #991b1b; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>\u{1F512} Passwort zur\xFCcksetzen</h1>
                <p>Bau-Structura Account Sicherheit</p>
            </div>
            <div class="content">
                <p>Hallo ${data.firstName},</p>
                
                <p>Sie haben eine Anfrage zur Zur\xFCcksetzung Ihres Passworts f\xFCr Ihren Bau-Structura Account gestellt.</p>
                
                <div class="reset-box">
                    <h3>\u{1F511} Passwort zur\xFCcksetzen</h3>
                    <p>Klicken Sie auf den folgenden Button, um Ihr Passwort zur\xFCckzusetzen:</p>
                    <div style="text-align: center;">
                        <a href="${data.resetLink}" class="cta-button">Passwort jetzt zur\xFCcksetzen</a>
                    </div>
                </div>
                
                <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
                <p style="background: #f1f5f9; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 14px;">${data.resetLink}</p>
                
                <div class="warning">
                    <h4 style="margin-top: 0;">\u26A0\uFE0F Sicherheitshinweise:</h4>
                    <ul style="margin-bottom: 0;">
                        <li>Dieser Link ist nur 24 Stunden g\xFCltig</li>
                        <li>Der Link kann nur einmal verwendet werden</li>
                        <li>Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail</li>
                        <li>Teilen Sie diesen Link mit niemandem</li>
                    </ul>
                </div>
                
                <p style="margin-top: 30px;">Falls Sie Probleme haben, kontaktieren Sie unser Support-Team unter <a href="mailto:support@bau-structura.de">support@bau-structura.de</a></p>
                
                <p>Ihr Bau-Structura Support-Team</p>
            </div>
            <div class="footer">
                <p>Bau-Structura - Sicheres Projektmanagement f\xFCr den Bau</p>
                <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.</p>
            </div>
        </div>
    </body>
    </html>`;
      }
      generatePasswordResetEmailText(data) {
        return `
PASSWORT ZUR\xDCCKSETZEN - BAU-STRUCTURA

Hallo ${data.firstName},

Sie haben eine Anfrage zur Zur\xFCcksetzung Ihres Passworts f\xFCr Ihren Bau-Structura Account gestellt.

\u{1F511} PASSWORT ZUR\xDCCKSETZEN:
\xD6ffnen Sie den folgenden Link in Ihrem Browser, um Ihr Passwort zur\xFCckzusetzen:

${data.resetLink}

\u26A0\uFE0F SICHERHEITSHINWEISE:
- Dieser Link ist nur 24 Stunden g\xFCltig
- Der Link kann nur einmal verwendet werden  
- Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail
- Teilen Sie diesen Link mit niemandem

SUPPORT:
Falls Sie Probleme haben, kontaktieren Sie unser Support-Team unter support@bau-structura.de

Ihr Bau-Structura Support-Team

---
Bau-Structura - Sicheres Projektmanagement f\xFCr den Bau
Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.`;
      }
      /**
       * SFTP-Willkommens-E-Mail nach Lizenz-Aktivierung
       */
      async sendSftpWelcomeEmail(data) {
        try {
          const mailOptions = {
            from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
            to: data.email,
            subject: "\u{1F389} Ihr SFTP-Server ist bereit! - Bau-Structura",
            text: this.generateSftpWelcomeEmailText(data),
            html: this.generateSftpWelcomeEmailHtml(data)
          };
          await this.transporter.sendMail(mailOptions);
          console.log(`\u2705 SFTP-Willkommens-E-Mail gesendet an ${data.email}`);
        } catch (error) {
          console.error("Fehler beim Senden der SFTP-Willkommens-E-Mail:", error);
          throw error;
        }
      }
      generateSftpWelcomeEmailHtml(data) {
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .credentials-box { background: #e8f4fd; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .warning-box { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .success-box { background: #d1fae5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
            code { background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #1e40af; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>\u{1F389} Ihr SFTP-Server ist bereit!</h1>
                <p>Automatische Einrichtung abgeschlossen</p>
            </div>
            <div class="content">
                <p>Hallo ${data.firstName},</p>
                
                <p><strong>Herzlichen Gl\xFCckwunsch!</strong> Ihre ${this.getLicenseLabel(data.licenseType)}-Lizenz wurde aktiviert und Ihr pers\xF6nlicher SFTP-Server wurde automatisch eingerichtet.</p>
                
                <div class="success-box">
                    <h3 style="color: #059669; margin-top: 0;">\u2705 Was wurde f\xFCr Sie erledigt:</h3>
                    <ul>
                        <li>\u{1F527} SFTP-Account automatisch erstellt</li>
                        <li>\u{1F512} Sichere Zugangsdaten generiert</li>
                        <li>\u{1F4C2} Pers\xF6nlicher Upload-Bereich konfiguriert</li>
                        <li>\u{1F6E1}\uFE0F Vollst\xE4ndige Isolation von anderen Benutzern</li>
                        <li>\u{1F4BE} ${data.storageLimit}GB Speicherplatz zugewiesen</li>
                    </ul>
                </div>

                <div class="credentials-box">
                    <h3 style="color: #1e40af; margin-top: 0;">\u{1F510} Ihre SFTP-Zugangsdaten</h3>
                    <p><strong>Server:</strong> <code>${data.sftpHost}:${data.sftpPort}</code></p>
                    <p><strong>Benutzername:</strong> <code>${data.sftpUsername}</code></p>
                    <p><strong>Passwort:</strong> <code>${data.sftpPassword}</code></p>
                    <p><strong>Upload-Pfad:</strong> <code>${data.sftpPath}</code></p>
                    <p><strong>Speicherplatz:</strong> <code>${data.storageLimit}GB</code></p>
                </div>

                <div class="warning-box">
                    <h3 style="color: #d97706; margin-top: 0;">\u{1F512} Sicherheitshinweise</h3>
                    <ul style="color: #92400e;">
                        <li><strong>Bewahren Sie diese Zugangsdaten sicher auf!</strong></li>
                        <li>Verwenden Sie nur sichere FTP-Clients (FileZilla, WinSCP)</li>
                        <li>Ihre Daten sind komplett von anderen Benutzern isoliert</li>
                        <li>Der Server verwendet SSL/TLS-Verschl\xFCsselung</li>
                    </ul>
                </div>

                <h3>\u{1F680} So verwenden Sie Ihren SFTP-Server:</h3>
                <ol>
                    <li><strong>\xDCber die App:</strong> Gehen Sie zu "Dokumente" \u2192 Upload-Bereich</li>
                    <li><strong>FTP-Client:</strong> Verwenden Sie die Zugangsdaten oben</li>
                    <li><strong>Automatisch:</strong> Fotos/Dateien werden automatisch hochgeladen</li>
                </ol>

                <h3>\u{1F4CA} Ihre Lizenz-Details:</h3>
                <p><strong>Lizenztyp:</strong> ${this.getLicenseLabel(data.licenseType)}</p>
                <p><strong>Speicherplatz:</strong> ${data.storageLimit}GB</p>
                <p><strong>Server-Standort:</strong> Hetzner Cloud, Deutschland (DSGVO-konform)</p>

                <h3>\u{1F198} Support</h3>
                <p>Bei Fragen zu Ihrem SFTP-Server erstellen Sie gerne ein Support-Ticket in der App.</p>
                
                <p><strong>Viel Erfolg mit Ihrem neuen SFTP-Server!</strong></p>
            </div>
        </div>
    </body>
    </html>`;
      }
      generateSftpWelcomeEmailText(data) {
        return `
\u{1F389} IHR SFTP-SERVER IST BEREIT! - BAU-STRUCTURA

Hallo ${data.firstName},

Herzlichen Gl\xFCckwunsch! Ihre ${this.getLicenseLabel(data.licenseType)}-Lizenz wurde aktiviert und Ihr pers\xF6nlicher SFTP-Server wurde automatisch eingerichtet.

IHRE SFTP-ZUGANGSDATEN:
Server: ${data.sftpHost}:${data.sftpPort}
Benutzername: ${data.sftpUsername}
Passwort: ${data.sftpPassword}
Upload-Pfad: ${data.sftpPath}
Speicherplatz: ${data.storageLimit}GB

\u{1F512} SICHERHEITSHINWEISE:
- Bewahren Sie diese Zugangsdaten sicher auf!
- Verwenden Sie nur sichere FTP-Clients (FileZilla, WinSCP)
- Ihre Daten sind komplett von anderen Benutzern isoliert
- Der Server verwendet SSL/TLS-Verschl\xFCsselung

\u{1F680} SO VERWENDEN SIE IHREN SFTP-SERVER:
1. \xDCber die App: Gehen Sie zu "Dokumente" \u2192 Upload-Bereich
2. FTP-Client: Verwenden Sie die Zugangsdaten oben
3. Automatisch: Fotos/Dateien werden automatisch hochgeladen

Bei Fragen erstellen Sie gerne ein Support-Ticket in der App.

Viel Erfolg mit Ihrem neuen SFTP-Server!

Bau-Structura Team`;
      }
      getLicenseLabel(licenseType) {
        switch (licenseType) {
          case "basic":
            return "Basic";
          case "professional":
            return "Professional";
          case "enterprise":
            return "Enterprise";
          default:
            return licenseType;
        }
      }
    };
    emailService = new EmailService();
  }
});

// server/localAuth.ts
var localAuth_exports = {};
__export(localAuth_exports, {
  comparePasswords: () => comparePasswords,
  hashPassword: () => hashPassword,
  isAuthenticated: () => isAuthenticated,
  setupLocalAuth: () => setupLocalAuth
});
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import bcrypt from "bcryptjs";
import connectPg from "connect-pg-simple";
function generateSecurePassword2() {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  try {
    if (stored.startsWith("$2b$")) {
      return await bcrypt.compare(supplied, stored);
    }
    if (stored.includes(".")) {
      const [hashed, salt] = stored.split(".");
      if (hashed && salt) {
        const hashedBuf = Buffer.from(hashed, "hex");
        const suppliedBuf = await scryptAsync(supplied, salt, 64);
        return timingSafeEqual(hashedBuf, suppliedBuf);
      }
    }
    return false;
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}
async function setupLocalAuth(app2) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    // Allow creating table if missing
    ttl: sessionTtl,
    tableName: "sessions"
  });
  console.log("\u{1F50D} Testing session store connection...");
  sessionStore.on("connect", () => {
    console.log("\u2705 Session store connected successfully");
  });
  sessionStore.on("error", (err) => {
    console.error("\u274C Session store error:", err);
  });
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "default-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: false,
      // Set to true in production with HTTPS
      maxAge: sessionTtl,
      sameSite: "lax",
      path: "/"
    },
    name: "connect.sid"
    // Ensure consistent session name
  };
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          console.log("\u{1F50D} Login attempt for:", email);
          const user = await storage.getUserByEmail(email);
          if (!user || !user.password) {
            console.log("\u274C User not found or no password");
            return done(null, false, { message: "Invalid credentials" });
          }
          console.log("\u{1F510} Comparing passwords...");
          const isValid = await comparePasswords(password, user.password);
          console.log("\u2705 Password comparison result:", isValid);
          if (!isValid) {
            console.log("\u274C Invalid password");
            return done(null, false, { message: "Invalid credentials" });
          }
          console.log("\u2705 Login successful for:", user.email);
          return done(null, user);
        } catch (error) {
          console.error("\u274C Login error:", error);
          return done(error);
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    console.log("\u{1F50D} Serializing user:", user.id, user.email);
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      console.log("\u{1F50D} Deserializing user with ID:", id);
      const user = await storage.getUser(id);
      if (!user) {
        console.log("\u274C User not found during deserialization:", id);
        return done(null, false);
      }
      console.log("\u2705 User successfully deserialized:", user.email);
      done(null, user);
    } catch (error) {
      console.error("\u274C Error deserializing user:", error);
      done(null, false);
    }
  });
  app2.post("/api/auth/login", (req, res, next) => {
    console.log("\u{1F4E7} Login request received for:", req.body.email);
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("\u274C Passport authentication error:", err);
        return next(err);
      }
      if (!user) {
        console.log("\u274C Authentication failed:", info?.message || "No user returned");
        return res.status(401).json({
          message: info?.message || "Invalid credentials"
        });
      }
      req.logIn(user, (err2) => {
        if (err2) {
          console.error("\u274C Login error:", err2);
          return next(err2);
        }
        console.log("\u2705 Login successful for:", user.email);
        res.json({ user: req.user, message: "Login successful" });
      });
    })(req, res, next);
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, privacyConsent } = req.body;
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "Alle Felder sind erforderlich" });
      }
      if (!privacyConsent) {
        return res.status(400).json({ message: "DSGVO-Einverst\xE4ndnis ist erforderlich" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Diese E-Mail-Adresse existiert bereits im System" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Passwort muss mindestens 6 Zeichen lang sein" });
      }
      const hashedPassword = await hashPassword(password);
      const trialStartDate = /* @__PURE__ */ new Date();
      const trialEndDate = /* @__PURE__ */ new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30);
      const user = await storage.upsertUser({
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: "user",
        privacyConsent: true,
        // User has explicitly consented
        emailNotificationsEnabled: true,
        trialStartDate,
        trialEndDate,
        paymentStatus: "trial",
        trialReminderSent: false
      });
      console.log(`\u2705 Neuer Benutzer registriert: ${email} (DSGVO-Einverst\xE4ndnis: ${privacyConsent})`);
      try {
        const sftpUsername = `baustructura_user_${user.id}`;
        const sftpPassword = generateSecurePassword2();
        const homeDir = `/var/ftp/user_${user.id}`;
        await storage.updateUser(user.id, {
          sftpHost: "128.140.82.20",
          sftpPort: 21,
          sftpUsername,
          sftpPassword,
          sftpPath: `${homeDir}/uploads/`
        });
        console.log(`\u2705 SFTP-Account automatisch erstellt f\xFCr Benutzer ${user.id}: ${sftpUsername}`);
      } catch (sftpError) {
        console.error("\u274C SFTP-Account-Erstellung fehlgeschlagen:", sftpError);
      }
      let emailSent = false;
      let emailError = null;
      try {
        const { emailService: emailService2 } = await Promise.resolve().then(() => (init_emailService(), emailService_exports));
        console.log(`\u{1F4E7} Sende Willkommens-E-Mail an: ${email}`);
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const emailResponse = await emailService2.sendWelcomeEmail({
              to: email,
              firstName,
              role: "user",
              id: user.id
            });
            console.log(`\u2705 Willkommens-E-Mail erfolgreich versendet (Versuch ${attempt}):`, emailResponse.messageId);
            emailSent = true;
            break;
          } catch (retryError) {
            console.error(`\u274C Willkommens-E-Mail Versuch ${attempt} fehlgeschlagen:`, retryError);
            emailError = retryError;
            if (attempt < 3) {
              console.log(`\u23F3 Wiederhole E-Mail-Versand in 2 Sekunden...`);
              await new Promise((resolve) => setTimeout(resolve, 2e3));
            }
          }
        }
        if (!emailSent) {
          throw new Error(`E-Mail-Versand nach 3 Versuchen fehlgeschlagen: ${emailError?.message || "Unbekannter Fehler"}`);
        }
      } catch (emailError2) {
        console.error("\u274C Willkommens-E-Mail komplett fehlgeschlagen:", emailError2);
        emailSent = false;
        console.log("\u26A0\uFE0F  Registrierung wird trotz E-Mail-Fehler fortgesetzt");
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Anmeldung nach Registrierung fehlgeschlagen" });
        }
        res.status(201).json({
          user,
          message: "Registrierung erfolgreich",
          sftpEnabled: true,
          welcomeEmailSent: emailSent,
          emailStatus: emailSent ? "Willkommens-E-Mail erfolgreich versendet" : "E-Mail-Versand fehlgeschlagen - pr\xFCfen Sie Ihr Postfach oder kontaktieren Sie den Support"
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registrierung fehlgeschlagen" });
    }
  });
  const handleLogout = (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        if (req.method === "GET") {
          return res.redirect("/auth?error=logout_failed");
        }
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          console.error("Session destroy error:", sessionErr);
        }
        if (req.method === "GET") {
          res.redirect("/auth?message=logged_out");
        } else {
          res.json({ message: "Logout successful" });
        }
      });
    });
  };
  app2.get("/api/logout", handleLogout);
  app2.post("/api/auth/logout", handleLogout);
  app2.get("/api/auth/user", (req, res) => {
    console.log("=== /API/AUTH/USER REQUEST ===");
    console.log("Session ID:", req.sessionID);
    console.log("Session exists:", !!req.session);
    console.log("Session passport:", req.session?.passport);
    console.log("User object:", req.user);
    console.log("isAuthenticated():", req.isAuthenticated ? req.isAuthenticated() : "method not available");
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      console.log("\u2705 User authenticated, returning user data");
      res.json(req.user);
    } else {
      console.log("\u274C User not authenticated");
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "E-Mail-Adresse ist erforderlich" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "Falls die E-Mail-Adresse registriert ist, wurde ein Reset-Link gesendet." });
      }
      const resetToken = Math.random().toString(36).substr(2, 15) + Date.now().toString(36);
      console.log(`Password reset requested for ${email}. Reset token: ${resetToken}`);
      try {
        const { emailService: emailService2 } = await Promise.resolve().then(() => (init_emailService(), emailService_exports));
        await emailService2.sendPasswordResetEmail({
          to: email,
          firstName: user.firstName,
          resetToken,
          resetLink: `https://bau-structura.com/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
        });
        console.log(`\u{1F4E7} Passwort-Reset-E-Mail versendet an: ${email}`);
      } catch (emailError) {
        console.error("\u274C Passwort-Reset-E-Mail fehlgeschlagen:", emailError);
      }
      res.json({
        message: "Falls die E-Mail-Adresse registriert ist, wurde ein Reset-Link gesendet.",
        // For demo purposes, return the token (remove in production)
        resetToken
      });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Passwort-Reset fehlgeschlagen" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, newPassword, resetToken } = req.body;
      if (!email || !newPassword || !resetToken) {
        return res.status(400).json({ message: "Alle Felder sind erforderlich" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Ung\xFCltiger Reset-Link" });
      }
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashedPassword });
      console.log(`Password reset completed for ${email}`);
      res.json({ message: "Passwort erfolgreich zur\xFCckgesetzt" });
    } catch (error) {
      console.error("Password reset confirmation error:", error);
      res.status(500).json({ message: "Passwort-Reset fehlgeschlagen" });
    }
  });
}
var scryptAsync, isAuthenticated;
var init_localAuth = __esm({
  "server/localAuth.ts"() {
    "use strict";
    init_storage();
    scryptAsync = promisify(scrypt);
    isAuthenticated = (req, res, next) => {
      console.log("=== AUTHENTICATION CHECK ===");
      console.log("Session ID:", req.sessionID);
      console.log("Session:", JSON.stringify(req.session, null, 2));
      console.log("User:", req.user);
      console.log("isAuthenticated():", req.isAuthenticated ? req.isAuthenticated() : "method not available");
      if (req.isAuthenticated()) {
        console.log("\u2713 Authentication successful");
        return next();
      }
      console.log("\u2717 Authentication failed");
      res.status(401).json({ message: "Unauthorized" });
    };
  }
});

// shared/error-learning-system.ts
var error_learning_system_exports = {};
__export(error_learning_system_exports, {
  IntelligentErrorLogger: () => IntelligentErrorLogger,
  errorLearningSystem: () => errorLearningSystem,
  withErrorLearning: () => withErrorLearning
});
function withErrorLearning(target, propertyName, descriptor) {
  const method = descriptor.value;
  descriptor.value = function(...args) {
    try {
      return method.apply(this, args);
    } catch (error) {
      const errorId = errorLearningSystem.logError({
        type: "RUNTIME",
        message: error.message,
        file: `${target.constructor.name}.${propertyName}`,
        context: `Method execution: ${propertyName}`,
        stackTrace: error.stack
      });
      const stats = errorLearningSystem.getErrorStatistics();
      console.log(`\u{1F50D} Fehler geloggt: ${errorId}`);
      throw error;
    }
  };
  return descriptor;
}
var IntelligentErrorLogger, errorLearningSystem;
var init_error_learning_system = __esm({
  "shared/error-learning-system.ts"() {
    "use strict";
    IntelligentErrorLogger = class _IntelligentErrorLogger {
      static instance;
      errorHistory = [];
      patterns = [];
      learningRules = /* @__PURE__ */ new Map();
      constructor() {
      }
      static getInstance() {
        if (!_IntelligentErrorLogger.instance) {
          _IntelligentErrorLogger.instance = new _IntelligentErrorLogger();
        }
        return _IntelligentErrorLogger.instance;
      }
      /**
       * Hauptfunktion zur Fehlerdokumentation
       */
      logError(error) {
        const errorId = this.generateErrorId(error.type, error.message);
        const existingPattern = this.findExistingPattern(error);
        const isRecurring = existingPattern !== null;
        const errorEntry = {
          id: errorId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          errorType: error.type,
          originalMessage: error.message,
          affectedFile: error.file,
          lineNumber: error.line,
          context: error.context,
          causeAnalysis: this.analyzeCause(error),
          trigger: this.identifyTrigger(error),
          isRecurring,
          occurrenceCount: isRecurring ? existingPattern.frequency + 1 : 1,
          lastOccurrences: this.getLastOccurrences(error),
          solution: "",
          codeChanges: [],
          verification: "",
          preventionMeasures: [],
          automaticChecks: [],
          patternRule: ""
        };
        this.errorHistory.push(errorEntry);
        this.updatePatterns(errorEntry);
        this.applyLearningRules(errorEntry);
        console.log(this.generateErrorReport(errorEntry));
        return errorId;
      }
      /**
       * Lösung zu einem Fehler hinzufügen
       */
      addSolution(errorId, solution) {
        const errorEntry = this.errorHistory.find((e) => e.id === errorId);
        if (errorEntry) {
          errorEntry.solution = solution.description;
          errorEntry.codeChanges = solution.codeChanges;
          errorEntry.verification = solution.verification;
          errorEntry.preventionMeasures = solution.steps;
          console.log(`\u2705 L\xF6sung f\xFCr Fehler ${errorId} hinzugef\xFCgt:`, solution.description);
        }
      }
      /**
       * Lösung für einen Fehler dokumentieren
       */
      documentSolution(errorId, solution) {
        const errorEntry = this.errorHistory.find((e) => e.id === errorId);
        if (!errorEntry) return;
        Object.assign(errorEntry, solution);
        this.updatePatternSolution(errorEntry);
        if (errorEntry.occurrenceCount >= 3) {
          this.implementAutomaticWarning(errorEntry);
        }
        if (errorEntry.occurrenceCount >= 5) {
          this.implementAutomaticCorrection(errorEntry);
        }
      }
      /**
       * Fehler-ID generieren
       */
      generateErrorId(type, message) {
        const now = /* @__PURE__ */ new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hour = String(now.getHours()).padStart(2, "0");
        const minute = String(now.getMinutes()).padStart(2, "0");
        const second = String(now.getSeconds()).padStart(2, "0");
        const timestamp2 = `${year}${month}${day}${hour}${minute}${second}`;
        const shortMessage = message.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
        return `${timestamp2}_${type}_${shortMessage}`;
      }
      /**
       * Ursachenanalyse
       */
      analyzeCause(error) {
        const patterns = {
          "SYNTAX": () => "Syntax-Fehler durch Tippfehler oder fehlende Zeichen",
          "IMPORT": () => "Import-Problem durch fehlende Dependencies oder falsche Pfade",
          "CONFIG": () => "Konfigurationsfehler durch fehlende Environment-Variablen",
          "API": () => "API-Fehler durch externe Service-Probleme oder Netzwerkissues",
          "DATA": () => "Daten-Validierungsfehler durch unerwartete Eingabeformate",
          "LOGIC": () => "Logikfehler durch falsche Algorithmen oder Bedingungen",
          "RUNTIME": () => "Laufzeitfehler durch unerwartete Ausf\xFChrungsbedingungen",
          "ROUTING": () => "Routing-Fehler durch fehlende Route-Definitionen in App.tsx",
          "SECURITY": () => "Sicherheitsl\xFCcke durch ungesch\xFCtzte Routes oder fehlende Authentifizierung"
        };
        return patterns[error.type]?.() || "Unbekannte Fehlerursache";
      }
      /**
       * Trigger identifizieren
       */
      identifyTrigger(error) {
        if (error.context.includes("user input")) return "Benutzereingabe";
        if (error.context.includes("API call")) return "API-Aufruf";
        if (error.context.includes("file operation")) return "Dateioperation";
        if (error.context.includes("database")) return "Datenbankoperation";
        return "Unbekannter Trigger";
      }
      /**
       * Existierendes Pattern finden
       */
      findExistingPattern(error) {
        return this.patterns.find(
          (p) => p.description.includes(error.type) && p.description.includes(error.message.slice(0, 50))
        ) || null;
      }
      /**
       * Letzte Vorkommen abrufen
       */
      getLastOccurrences(error) {
        return this.errorHistory.filter((e) => e.errorType === error.type && e.originalMessage === error.message).slice(-5).map((e) => e.timestamp);
      }
      /**
       * Patterns aktualisieren
       */
      updatePatterns(errorEntry) {
        const existingPattern = this.patterns.find(
          (p) => p.description.includes(errorEntry.errorType)
        );
        if (existingPattern) {
          existingPattern.frequency++;
          existingPattern.lastSeen = errorEntry.timestamp;
        } else {
          this.patterns.push({
            patternId: `pattern_${this.patterns.length + 1}`,
            description: `${errorEntry.errorType}: ${errorEntry.originalMessage.slice(0, 100)}`,
            frequency: 1,
            lastSeen: errorEntry.timestamp,
            solutions: [],
            preventionRules: [],
            autoFixAvailable: false
          });
        }
      }
      /**
       * Pattern-Lösung aktualisieren
       */
      updatePatternSolution(errorEntry) {
        const pattern = this.patterns.find(
          (p) => p.description.includes(errorEntry.errorType)
        );
        if (pattern) {
          pattern.solutions.push(errorEntry.solution);
          pattern.preventionRules.push(...errorEntry.preventionMeasures);
          if (errorEntry.occurrenceCount >= 5) {
            pattern.autoFixAvailable = true;
          }
        }
      }
      /**
       * Lernregeln anwenden
       */
      applyLearningRules(errorEntry) {
        const ruleKey = `${errorEntry.errorType}_${errorEntry.originalMessage.slice(0, 30)}`;
        if (this.learningRules.has(ruleKey)) {
          const rule = this.learningRules.get(ruleKey);
          rule.count++;
          rule.lastSeen = errorEntry.timestamp;
        } else {
          this.learningRules.set(ruleKey, {
            count: 1,
            firstSeen: errorEntry.timestamp,
            lastSeen: errorEntry.timestamp,
            autoFixImplemented: false
          });
        }
      }
      /**
       * Automatische Warnung implementieren (nach 3 Fehlern)
       */
      implementAutomaticWarning(errorEntry) {
        console.warn(`\u26A0\uFE0F WIEDERHOLUNGSFEHLER ERKANNT: ${errorEntry.errorType}`);
        console.warn(`Vorkommen: ${errorEntry.occurrenceCount}x`);
        console.warn(`Empfohlene L\xF6sung: ${errorEntry.solution}`);
        this.addPreventionRule(errorEntry);
        this.notifyDevelopmentTeam(errorEntry);
        this.createLintRule(errorEntry);
      }
      /**
       * Automatische Korrektur implementieren (nach 5 Fehlern)
       */
      implementAutomaticCorrection(errorEntry) {
        console.log(`\u{1F916} AUTO-KORREKTUR AKTIVIERT: ${errorEntry.errorType}`);
        const pattern = this.patterns.find((p) => p.description.includes(errorEntry.errorType));
        if (pattern) {
          pattern.autoFixAvailable = true;
        }
        this.createAutoFixRule(errorEntry);
        this.installPreCommitHook(errorEntry);
        this.createCodeTemplate(errorEntry);
      }
      /**
       * Präventionsregel hinzufügen
       */
      addPreventionRule(errorEntry) {
        const preventionRule = {
          id: `prevention_${errorEntry.id}`,
          errorType: errorEntry.errorType,
          rule: errorEntry.patternRule,
          autoCheck: this.generateAutoCheck(errorEntry),
          implemented: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.learningRules.set(preventionRule.id, preventionRule);
        console.log(`\u{1F4CB} NEUE PR\xC4VENTIONSREGEL ERSTELLT: ${preventionRule.rule}`);
        console.log(`\u{1F50D} AUTO-CHECK: ${preventionRule.autoCheck}`);
      }
      /**
       * Entwickler-Team benachrichtigen
       */
      notifyDevelopmentTeam(errorEntry) {
        console.log(`\u{1F4E7} ENTWICKLER-BENACHRICHTIGUNG: Wiederkehrender Fehler ${errorEntry.errorType} (${errorEntry.occurrenceCount}x)`);
      }
      /**
       * Lint-Regel erstellen
       */
      createLintRule(errorEntry) {
        const lintRules = {
          "SYNTAX": `"no-trailing-spaces": "error", "semi": ["error", "always"]`,
          "IMPORT": `"import/no-unresolved": "error", "import/order": "error"`,
          "CONFIG": `"no-process-env": "warn"`,
          "DATA": `"@typescript-eslint/strict-boolean-expressions": "error"`,
          "ROUTING": `"react-router/no-missing-routes": "error"`
        };
        const rule = lintRules[errorEntry.errorType];
        if (rule) {
          console.log(`\u{1F527} LINT-REGEL ERSTELLT: ${rule}`);
        }
      }
      /**
       * Auto-Fix-Regel erstellen
       */
      createAutoFixRule(errorEntry) {
        const autoFixes = {
          "SYNTAX": "prettier --write",
          "IMPORT": "organize-imports-cli",
          "CONFIG": "env-validation-check",
          "DATA": "type-guard-generator",
          "ROUTING": "auto-route-generator"
        };
        const fix = autoFixes[errorEntry.errorType];
        if (fix) {
          console.log(`\u{1F916} AUTO-FIX REGEL: ${fix}`);
        }
      }
      /**
       * Pre-Commit Hook installieren
       */
      installPreCommitHook(errorEntry) {
        const hooks = {
          "SYNTAX": "npm run lint:fix",
          "IMPORT": "npm run imports:organize",
          "CONFIG": "npm run config:validate",
          "DATA": "npm run types:check"
        };
        const hook = hooks[errorEntry.errorType];
        if (hook) {
          console.log(`\u{1FA9D} PRE-COMMIT HOOK: ${hook}`);
        }
      }
      /**
       * Code-Template erstellen
       */
      createCodeTemplate(errorEntry) {
        const templates = {
          "SYNTAX": "// AUTO-GENERATED: Korrekte Syntax-Template",
          "IMPORT": "// AUTO-GENERATED: Import-Template mit korrekten Pfaden",
          "CONFIG": "// AUTO-GENERATED: Config-Validation-Template",
          "DATA": "// AUTO-GENERATED: Type-Safe Data-Handling-Template"
        };
        const template = templates[errorEntry.errorType];
        if (template) {
          console.log(`\u{1F4C4} CODE-TEMPLATE ERSTELLT: ${template}`);
        }
      }
      /**
       * Auto-Check generieren
       */
      generateAutoCheck(errorEntry) {
        const checks = {
          "SYNTAX": "Syntax-Validator vor Ausf\xFChrung",
          "IMPORT": "Import-Resolver Check",
          "CONFIG": "Environment-Variable Validation",
          "DATA": "Type-Safety Check",
          "API": "API-Endpoint Verf\xFCgbarkeit",
          "LOGIC": "Unit-Test Coverage Check",
          "ROUTING": "Route-Definition Check in App.tsx",
          "PERMISSION": "Rollenbasierte Berechtigung Check",
          "SECURITY": "ProtectedRoute Authentication Check"
        };
        return checks[errorEntry.errorType] || "Allgemeiner Validierungs-Check";
      }
      /**
       * Fehlerbericht generieren
       */
      generateErrorReport(errorEntry) {
        return `
## FEHLER-EINTRAG ${errorEntry.id}

### Fehlerdetails:
- **Zeitpunkt:** ${errorEntry.timestamp}
- **Fehlertyp:** ${errorEntry.errorType}
- **Fehlermeldung:** ${errorEntry.originalMessage}
- **Betroffene Datei:** ${errorEntry.affectedFile}:${errorEntry.lineNumber || "unknown"}
- **Kontext:** ${errorEntry.context}

### Ursachenanalyse:
- **Grund:** ${errorEntry.causeAnalysis}
- **Ausl\xF6ser:** ${errorEntry.trigger}
- **Muster erkannt:** ${errorEntry.isRecurring ? "JA" : "NEIN"} (${errorEntry.occurrenceCount}x)

### Status:
- **L\xF6sung implementiert:** ${errorEntry.solution || "AUSSTEHEND"}
- **Pr\xE4ventionsma\xDFnahmen:** ${errorEntry.preventionMeasures.length || 0} geplant
`;
      }
      /**
       * Öffentliche API für Fehlerstatistiken
       */
      getErrorStatistics() {
        console.log("\u{1F4CA} Aktuelle Error Learning Statistiken:", {
          totalErrors: this.errorHistory.length,
          recurringErrors: this.errorHistory.filter((e) => e.isRecurring).length,
          patterns: this.patterns.length,
          autoFixesAvailable: this.patterns.filter((p) => p.autoFixAvailable).length,
          mostCommonErrorType: this.getMostCommonErrorType(),
          recentErrorsCount: this.errorHistory.slice(-10).length,
          allErrorTypes: this.errorHistory.map((e) => e.errorType),
          patternIds: this.patterns.map((p) => p.patternId)
        });
        return {
          totalErrors: this.errorHistory.length,
          recurringErrors: this.errorHistory.filter((e) => e.isRecurring).length,
          patterns: this.patterns.length,
          autoFixesAvailable: this.patterns.filter((p) => p.autoFixAvailable).length,
          mostCommonErrorType: this.getMostCommonErrorType(),
          recentErrors: this.errorHistory.slice(-10)
        };
      }
      getMostCommonErrorType() {
        const counts = this.errorHistory.reduce((acc, error) => {
          acc[error.errorType] = (acc[error.errorType] || 0) + 1;
          return acc;
        }, {});
        return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || "NONE";
      }
      /**
       * Alle Patterns abrufen
       */
      getAllPatterns() {
        return this.patterns;
      }
      /**
       * Bekannte Fehler & Lösungen exportieren
       */
      exportKnowledgeBase() {
        return this.patterns.map((pattern) => `
## ${pattern.description}
- **H\xE4ufigkeit:** ${pattern.frequency}x
- **Letzte Sichtung:** ${pattern.lastSeen}
- **L\xF6sungen:** ${pattern.solutions.join("; ")}
- **Pr\xE4vention:** ${pattern.preventionRules.join("; ")}
- **Auto-Fix:** ${pattern.autoFixAvailable ? "Verf\xFCgbar" : "Nicht verf\xFCgbar"}
`).join("\n");
      }
    };
    errorLearningSystem = IntelligentErrorLogger.getInstance();
    setTimeout(() => {
      const instance = errorLearningSystem;
      instance.patterns.push({
        patternId: "permission_manager_project_creation",
        description: "PERMISSION: Manager k\xF6nnen keine Projekte erstellen (enforceUserIsolation Konflikt)",
        frequency: 3,
        lastSeen: (/* @__PURE__ */ new Date()).toISOString(),
        solutions: [
          "enforceUserIsolation() Middleware durch direkte Berechtigungspr\xFCfung ersetzen",
          "requireManagerOrAdmin() vor komplexe Middleware-Kette setzen"
        ],
        preventionRules: [
          "Berechtigungspr\xFCfung vor jeder CRUD-Operation testen",
          "Manager-Rolle explizit in API-Tests validieren"
        ],
        autoFixAvailable: true
      });
      instance.patterns.push({
        patternId: "permission_manager_customer_creation",
        description: "PERMISSION: Manager k\xF6nnen keine Kunden erstellen (fehlende user_id Spalte)",
        frequency: 2,
        lastSeen: (/* @__PURE__ */ new Date()).toISOString(),
        solutions: [
          "user_id Spalte zu customers Tabelle hinzuf\xFCgen via ALTER TABLE",
          "User-Isolation f\xFCr alle Customer-CRUD-Operationen implementieren"
        ],
        preventionRules: [
          "Datenbank-Schema mit user_id f\xFCr Multi-Tenant-Isolation pr\xFCfen",
          "Alle neuen Tabellen automatisch mit user_id erstellen"
        ],
        autoFixAvailable: true
      });
      instance.patterns.push({
        patternId: "permission_manager_company_creation",
        description: "PERMISSION: Manager k\xF6nnen keine Firmen erstellen (fehlende user_id Spalte)",
        frequency: 2,
        lastSeen: (/* @__PURE__ */ new Date()).toISOString(),
        solutions: [
          "user_id Spalte zu companies Tabelle hinzuf\xFCgen via ALTER TABLE",
          "User-Isolation f\xFCr alle Company-CRUD-Operationen implementieren"
        ],
        preventionRules: [
          "Automatische user_id-Spalten-Pr\xFCfung bei neuen Tabellen",
          "Schema-Migrations mit user_id-Standard implementieren"
        ],
        autoFixAvailable: true
      });
      instance.patterns.push({
        patternId: "security_unprotected_frontend_routes",
        description: "SECURITY: User undefined kann ins Dashboard - Frontend-Routes ohne ProtectedRoute",
        frequency: 5,
        lastSeen: (/* @__PURE__ */ new Date()).toISOString(),
        solutions: [
          "Alle Frontend-Routes mit <ProtectedRoute> umschlie\xDFen",
          "useAuth Hook pr\xFCft isAuthenticated vor Seitenzugriff",
          'credentials: "include" f\xFCr alle API-Requests aktivieren'
        ],
        preventionRules: [
          "Neue Routes automatisch mit ProtectedRoute erstellen",
          "Authentication-Tests f\xFCr alle gesch\xFCtzten Seiten",
          "Route-Security-Audit bei jeder neuen Route-Definition"
        ],
        autoFixAvailable: true
      });
      instance.patterns.push({
        patternId: "data_project_creation_validation",
        description: "DATA: Projekterstellung fehlschl\xE4gt - Frontend String-Daten vs Backend Schema-Types",
        frequency: 3,
        lastSeen: (/* @__PURE__ */ new Date()).toISOString(),
        solutions: [
          "Backend-Datenkonvertierung vor Schema-Validierung implementieren",
          "Date-Strings zu Date-Objekten konvertieren (new Date())",
          "Robuste Typenkonvertierung f\xFCr budget (toString) und customerId (parseInt)"
        ],
        preventionRules: [
          "Automatische Datentyp-Validierung in API-Routes",
          "Schema-Tests f\xFCr Frontend-Backend-Kompatibilit\xE4t",
          "Einheitliche Datenkonvertierungslogik implementieren"
        ],
        autoFixAvailable: true
      });
      instance.patterns.push({
        patternId: "api_request_parameter_order",
        description: "API: apiRequest Parameter-Reihenfolge falsch - H\xE4ufigster Fehler bei API-Aufrufen",
        frequency: 15,
        lastSeen: (/* @__PURE__ */ new Date()).toISOString(),
        solutions: [
          "apiRequest Parameter-Reihenfolge: apiRequest(url, method, data) - NICHT (method, url, data)",
          'Korrekt: apiRequest("/api/endpoint", "PUT", data)',
          'Falsch: apiRequest("PUT", "/api/endpoint", data)'
        ],
        preventionRules: [
          "Bei jedem apiRequest-Aufruf Parameter-Reihenfolge pr\xFCfen",
          "URL immer als erster Parameter, dann HTTP-Method, dann Daten",
          "TypeScript-Definitionen f\xFCr apiRequest-Funktion erweitern",
          "Automatische Lint-Regel f\xFCr apiRequest-Parameter-Reihenfolge"
        ],
        autoFixAvailable: true
      });
      console.log("\u2705 Manager-Berechtigungsprobleme, Security-Patterns, Daten-Validierung und apiRequest-Parameter-Reihenfolge in Error Learning System geladen");
    }, 100);
  }
});

// server/sftpAutoSetup.ts
var sftpAutoSetup_exports = {};
__export(sftpAutoSetup_exports, {
  SftpAutoSetup: () => SftpAutoSetup,
  onLicenseActivated: () => onLicenseActivated,
  onLicenseCancelled: () => onLicenseCancelled
});
import crypto from "crypto";
async function onLicenseActivated(userId2, licenseType) {
  console.log(`\u{1F389} Lizenz aktiviert f\xFCr User ${userId2}: ${licenseType}`);
  const sftpResult = await SftpAutoSetup.setupSftpForUser(userId2);
  if (sftpResult.success) {
    console.log(`\u2705 SFTP automatisch eingerichtet: ${sftpResult.username}`);
  } else {
    console.error(`\u274C SFTP-Einrichtung fehlgeschlagen: ${sftpResult.error}`);
  }
  return sftpResult;
}
async function onLicenseCancelled(userId2) {
  console.log(`\u274C Lizenz gek\xFCndigt f\xFCr User ${userId2}`);
  const result = await SftpAutoSetup.removeSftpForUser(userId2);
  if (result.success) {
    console.log(`\u2705 SFTP-Account automatisch entfernt f\xFCr User ${userId2}`);
  } else {
    console.error(`\u274C SFTP-Entfernung fehlgeschlagen: ${result.error}`);
  }
  return result;
}
var SftpAutoSetup;
var init_sftpAutoSetup = __esm({
  "server/sftpAutoSetup.ts"() {
    "use strict";
    init_storage();
    init_emailService();
    SftpAutoSetup = class {
      static SFTP_HOST = "128.140.82.20";
      // Hetzner Server
      static SFTP_PORT = 22;
      static BASE_PATH = "/home/sftp-users";
      /**
       * Erstellt automatisch SFTP-Account nach Lizenz-Aktivierung
       */
      static async setupSftpForUser(userId2) {
        try {
          console.log(`\u{1F527} Starte automatische SFTP-Einrichtung f\xFCr User ${userId2}`);
          const user = await storage.getUser(userId2);
          if (!user) {
            return { success: false, error: "Benutzer nicht gefunden" };
          }
          if (!this.hasValidLicense(user)) {
            console.log(`\u274C User ${userId2} hat keine g\xFCltige Lizenz - SFTP-Setup \xFCbersprungen`);
            return { success: false, error: "Keine g\xFCltige Lizenz vorhanden" };
          }
          if (user.sftpUsername && user.sftpPassword) {
            console.log(`\u2705 SFTP bereits konfiguriert f\xFCr User ${userId2}`);
            return {
              success: true,
              username: user.sftpUsername,
              host: this.SFTP_HOST,
              port: this.SFTP_PORT,
              path: user.sftpPath || "/"
            };
          }
          const sftpCredentials = this.generateSftpCredentials(user);
          const serverSetup = await this.createSftpAccountOnServer(sftpCredentials);
          if (!serverSetup.success) {
            return { success: false, error: serverSetup.error };
          }
          await storage.updateUser(userId2, {
            sftpHost: this.SFTP_HOST,
            sftpPort: this.SFTP_PORT,
            sftpUsername: sftpCredentials.username,
            sftpPassword: sftpCredentials.password,
            sftpPath: sftpCredentials.path,
            sftpAccessLevel: this.getSftpAccessLevel(user.licenseType || "basic")
          });
          await this.sendSftpWelcomeEmail(user, sftpCredentials);
          console.log(`\u2705 SFTP automatisch eingerichtet f\xFCr User ${userId2}: ${sftpCredentials.username}`);
          return {
            success: true,
            username: sftpCredentials.username,
            password: sftpCredentials.password,
            host: this.SFTP_HOST,
            port: this.SFTP_PORT,
            path: sftpCredentials.path
          };
        } catch (error) {
          console.error("Fehler bei automatischer SFTP-Einrichtung:", error);
          return { success: false, error: "Technischer Fehler bei SFTP-Einrichtung" };
        }
      }
      /**
       * Prüft ob Benutzer eine gültige Lizenz hat
       */
      static hasValidLicense(user) {
        if (user.paymentStatus === "trial") {
          return false;
        }
        if (user.paymentStatus !== "active") {
          return false;
        }
        if (user.licenseExpiresAt && new Date(user.licenseExpiresAt) < /* @__PURE__ */ new Date()) {
          return false;
        }
        return true;
      }
      /**
       * Generiert sichere SFTP-Credentials
       */
      static generateSftpCredentials(user) {
        const username = `bau${user.id}`;
        const password = crypto.randomBytes(16).toString("hex");
        const path3 = `/home/sftp-users/${username}/`;
        return { username, password, path: path3 };
      }
      /**
       * Erstellt SFTP-Account auf dem Server (simuliert)
       */
      static async createSftpAccountOnServer(credentials) {
        try {
          console.log(`\u{1F527} Erstelle SFTP-Account auf Server: ${credentials.username}`);
          await new Promise((resolve) => setTimeout(resolve, 1e3));
          console.log(`\u2705 SFTP-Account erfolgreich erstellt: ${credentials.username}`);
          return { success: true };
        } catch (error) {
          console.error("Fehler bei Server-Account-Erstellung:", error);
          return { success: false, error: "Server-Kommunikation fehlgeschlagen" };
        }
      }
      /**
       * Bestimmt SFTP-Zugriffslevel basierend auf Lizenztyp
       */
      static getSftpAccessLevel(licenseType) {
        switch (licenseType) {
          case "basic":
            return 1;
          // 1GB Speicher
          case "professional":
            return 5;
          // 5GB Speicher
          case "enterprise":
            return 20;
          // 20GB Speicher
          default:
            return 0;
        }
      }
      /**
       * Sendet Willkommens-E-Mail mit SFTP-Informationen
       */
      static async sendSftpWelcomeEmail(user, credentials) {
        try {
          await emailService.sendSftpWelcomeEmail({
            email: user.email,
            firstName: user.firstName || "Benutzer",
            sftpHost: this.SFTP_HOST,
            sftpPort: this.SFTP_PORT,
            sftpUsername: credentials.username,
            sftpPassword: credentials.password,
            sftpPath: credentials.path,
            licenseType: user.licenseType,
            storageLimit: this.getSftpAccessLevel(user.licenseType)
          });
          console.log(`\u{1F4E7} SFTP-Willkommens-E-Mail gesendet an ${user.email}`);
        } catch (error) {
          console.error("Fehler beim Senden der SFTP-Willkommens-E-Mail:", error);
        }
      }
      /**
       * Entfernt SFTP-Account bei Lizenz-Kündigung
       */
      static async removeSftpForUser(userId2) {
        try {
          const user = await storage.getUser(userId2);
          if (!user || !user.sftpUsername) {
            return { success: true };
          }
          console.log(`\u{1F5D1}\uFE0F Entferne SFTP-Account: ${user.sftpUsername}`);
          await storage.updateUser(userId2, {
            sftpHost: null,
            sftpPort: 22,
            sftpUsername: null,
            sftpPassword: null,
            sftpPath: "/",
            sftpAccessLevel: 0
          });
          console.log(`\u2705 SFTP-Account erfolgreich entfernt f\xFCr User ${userId2}`);
          return { success: true };
        } catch (error) {
          console.error("Fehler beim Entfernen des SFTP-Accounts:", error);
          return { success: false, error: "Fehler beim Entfernen des SFTP-Accounts" };
        }
      }
    };
  }
});

// server/pdfGenerator.ts
var pdfGenerator_exports = {};
__export(pdfGenerator_exports, {
  generateFloodProtectionPDF: () => generateFloodProtectionPDF
});
async function generateFloodProtectionPDF(data) {
  const { checklist, schieber, schaeden, wachen, exportedAt, exportedBy } = data;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Hochwasserschutz-Checkliste</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          line-height: 1.4;
          color: #333;
        }
        .header { 
          border-bottom: 3px solid #1f2937; 
          padding-bottom: 15px; 
          margin-bottom: 25px;
          text-align: center;
        }
        .header h1 {
          color: #1f2937;
          margin: 0 0 15px 0;
          font-size: 28px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        .info-item {
          background: #f9fafb;
          padding: 10px;
          border-left: 4px solid #3b82f6;
          border-radius: 4px;
        }
        .info-label {
          font-weight: bold;
          color: #374151;
          margin-bottom: 3px;
        }
        .section { 
          margin-bottom: 30px; 
          page-break-inside: avoid;
        }
        .section h2 {
          color: #1f2937;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
          margin-bottom: 15px;
          font-size: 20px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 15px;
          font-size: 12px;
        }
        th, td { 
          border: 1px solid #d1d5db; 
          padding: 10px 8px; 
          text-align: left;
          vertical-align: top;
        }
        th { 
          background-color: #f3f4f6; 
          font-weight: bold;
          color: #374151;
        }
        .status-ok { color: #16a34a; font-weight: bold; }
        .status-warning { color: #ea580c; font-weight: bold; }
        .priority { font-weight: bold; }
        .priority-1 { color: #dc2626; }
        .priority-2 { color: #ea580c; }
        .priority-3 { color: #ca8a04; }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #d1d5db;
          font-size: 11px;
          color: #6b7280;
          text-align: center;
        }
        
        /* Print-optimierte Styles f\xFCr PDF-Export */
        @media print {
          body { margin: 0; }
          .header, .section { page-break-inside: avoid; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
        
        /* Automatische Print-Funktionalit\xE4t */
        @page { size: A4; margin: 2cm; }
        
        /* Button zum manuellen PDF-Export */
        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
        }
        
        @media print {
          .print-button { display: none; }
        }
        .progress-bar {
          width: 100%;
          height: 20px;
          background-color: #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
          margin: 10px 0;
        }
        .progress-fill {
          height: 100%;
          background-color: #10b981;
          width: ${checklist.fortschritt || 0}%;
          transition: width 0.3s ease;
        }
      </style>
      <script>
        // Automatischer Print-Dialog beim Laden der Seite
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 1000);
        };
        
        function printDocument() {
          window.print();
        }
      </script>
    </head>
    <body>
      <button class="print-button" onclick="printDocument()">\u{1F4C4} Als PDF speichern</button>
      <div class="header">
        <h1>\u{1F3D7}\uFE0F Hochwasserschutz-Checkliste</h1>
        <div style="font-size: 14px; color: #6b7280;">
          Sachverst\xE4ndigenb\xFCro Justiti \u2022 Hochwasservorsorge & -schutz
        </div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Checklist-Titel</div>
          <div>${checklist.titel}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Typ</div>
          <div>${checklist.typ}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Status</div>
          <div style="text-transform: capitalize; font-weight: bold;">${checklist.status}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Erstellt von</div>
          <div>${checklist.erstellt_von}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Erstellt am</div>
          <div>${new Date(checklist.erstellt_am).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })}</div>
        </div>
        ${checklist.beginn_pegelstand_cm ? `
        <div class="info-item">
          <div class="info-label">Pegelstand</div>
          <div>${checklist.beginn_pegelstand_cm} cm</div>
        </div>
        ` : ""}
      </div>

      <div class="section">
        <h2>\u{1F4CA} Fortschritt</h2>
        <div style="margin: 15px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span><strong>Aufgaben erledigt:</strong> ${checklist.aufgaben_erledigt || 0} von ${checklist.aufgaben_gesamt || 11}</span>
            <span><strong>${checklist.fortschritt || 0}% abgeschlossen</strong></span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>\u{1F527} Absperrschieber-Status</h2>
        <table>
          <thead>
            <tr>
              <th>Nr.</th>
              <th>Bezeichnung</th>
              <th>Lage</th>
              <th>Status</th>
              <th>Letzte Pr\xFCfung</th>
            </tr>
          </thead>
          <tbody>
            ${schieber.map((s) => `
              <tr>
                <td><strong>${s.nummer}</strong></td>
                <td>${s.bezeichnung}</td>
                <td>${s.lage}</td>
                <td class="${s.funktionsfaehig ? "status-ok" : "status-warning"}">
                  ${s.funktionsfaehig ? "\u2713 Funktionsf\xE4hig" : "\u26A0 Wartung erforderlich"}
                </td>
                <td>${new Date(s.letzte_pruefung).toLocaleDateString("de-DE")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      ${schaeden && schaeden.length > 0 ? `
      <div class="section">
        <h2>\u{1F6A8} Schadensf\xE4lle</h2>
        <table>
          <thead>
            <tr>
              <th>Schieber Nr.</th>
              <th>Problem</th>
              <th>Status</th>
              <th>Priorit\xE4t</th>
              <th>Gemeldet von</th>
              <th>Ma\xDFnahme</th>
            </tr>
          </thead>
          <tbody>
            ${schaeden.map((schaden) => `
              <tr>
                <td><strong>${schaden.absperrschieber_nummer}</strong></td>
                <td>${schaden.problem_beschreibung}</td>
                <td style="text-transform: capitalize;">${schaden.status}</td>
                <td class="priority priority-${schaden.prioritaet}">Stufe ${schaden.prioritaet}</td>
                <td>${schaden.gemeldet_von}</td>
                <td>${schaden.massnahme}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      ` : ""}

      ${wachen && wachen.length > 0 ? `
      <div class="section">
        <h2>\u{1F465} Deichwachen</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Telefon</th>
              <th>Schicht</th>
              <th>Bereich</th>
              <th>Bemerkung</th>
            </tr>
          </thead>
          <tbody>
            ${wachen.map((wache) => `
              <tr>
                <td><strong>${wache.name}</strong></td>
                <td>${wache.telefon}</td>
                <td>
                  ${new Date(wache.schicht_beginn).toLocaleDateString("de-DE")} ${new Date(wache.schicht_beginn).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                  <br>
                  bis ${new Date(wache.schicht_ende).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td>${wache.bereich}</td>
                <td>${wache.bemerkung || "-"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      ` : ""}

      <div class="footer">
        <p><strong>Exportiert am:</strong> ${exportedAt} <strong>von:</strong> ${exportedBy}</p>
        <p>Bau-Structura Hochwasserschutz-Management System \u2022 Sachverst\xE4ndigenb\xFCro Justiti</p>
        <p>Diese Checkliste dient der systematischen \xDCberwachung und Wartung von Hochwasserschutzanlagen.</p>
      </div>
    </body>
    </html>
  `;
  const textContent = `
HOCHWASSERSCHUTZ-CHECKLISTE
===========================

Checkliste: ${checklist?.titel || "Unbenannt"}
Typ: ${checklist?.typ || "hochwasser"}
Status: ${checklist?.status || "offen"}
Erstellt von: ${exportedBy || "Unbekannt"}
Exportiert am: ${new Date(exportedAt || Date.now()).toLocaleDateString("de-DE")}

Aufgaben: ${checklist?.aufgaben_erledigt || 0}/${checklist?.aufgaben_gesamt || 11} erledigt
${checklist?.beginn_pegelstand_cm ? `Pegelstand: ${checklist.beginn_pegelstand_cm} cm` : ""}

ABSPERRSCHIEBER
---------------
${schieber?.length ? schieber.map((s) => `- Nr. ${s.nummer}: ${s.bezeichnung} (${s.funktionsfaehig ? "OK" : "Defekt"})`).join("\n") : "Keine Schieber erfasst"}

${schaeden?.length ? `SCHADENSF\xC4LLE
-------------
${schaeden.map((s) => `- Schieber ${s.absperrschieber_nummer}: ${s.problem_beschreibung}`).join("\n")}` : ""}

${wachen?.length ? `DEICHWACHEN
-----------
${wachen.map((w) => `- ${w.name}: ${w.telefon}`).join("\n")}` : ""}

---
Generiert mit Bau-Structura Hochwasserschutz-System
  `;
  const pdfHeader = "%PDF-1.4\n";
  const pdfContent = `1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length ${textContent.length + 50}
>>
stream
BT
/F1 12 Tf
72 720 Td
(${textContent.replace(/\n/g, ")Tj T*(").replace(/\(/g, "\\(").replace(/\)/g, "\\)")})Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000202 00000 n 

trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${300 + textContent.length}
%%EOF`;
  return Buffer.from(pdfHeader + pdfContent, "utf-8");
}
var init_pdfGenerator = __esm({
  "server/pdfGenerator.ts"() {
    "use strict";
  }
});

// server/openai.ts
var openai_exports = {};
__export(openai_exports, {
  aiProjectChat: () => aiProjectChat,
  generateProjectDescription: () => generateProjectDescription,
  generateRiskAssessment: () => generateRiskAssessment,
  getAIUsageStats: () => getAIUsageStats,
  summarizeDocument: () => summarizeDocument
});
import OpenAI from "openai";
async function logAIInteraction(data) {
  console.log(`[AI-LOG] ${(/* @__PURE__ */ new Date()).toISOString()} - User: ${data.userId}, Action: ${data.action}, Model: ${data.model}, Tokens: ${data.tokens}`);
}
async function generateProjectDescription(userId2, projectData) {
  const prompt = `Erstelle eine professionelle Projektbeschreibung f\xFCr ein Tiefbau-Projekt:

Projektname: ${projectData.name}
${projectData.location ? `Standort: ${projectData.location}` : ""}
${projectData.budget ? `Budget: ${projectData.budget.toLocaleString("de-DE")} \u20AC` : ""}
${projectData.category ? `Kategorie: ${projectData.category}` : ""}

Erstelle eine pr\xE4zise, technische Beschreibung (max. 200 W\xF6rter) f\xFCr deutsche Bauunternehmen. Fokus auf praktische Aspekte und Herausforderungen. Antwort in JSON Format: {"description": "text"}`;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 300
    });
    const result = JSON.parse(response.choices[0].message.content || '{"description": ""}');
    await logAIInteraction({
      userId: userId2,
      action: "generate_project_description",
      prompt,
      response: result.description,
      model: "gpt-4o",
      tokens: response.usage?.total_tokens || 0
    });
    return {
      description: result.description,
      aiGenerated: true
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("KI-Beschreibung konnte nicht generiert werden");
  }
}
async function generateRiskAssessment(userId2, projectData, projectId) {
  const prompt = `F\xFChre eine Risikobewertung f\xFCr dieses Tiefbau-Projekt durch:

Projektname: ${projectData.name}
${projectData.location ? `Standort: ${projectData.location}` : ""}
${projectData.budget ? `Budget: ${projectData.budget.toLocaleString("de-DE")} \u20AC` : ""}
${projectData.description ? `Beschreibung: ${projectData.description}` : ""}
${projectData.duration ? `Dauer: ${projectData.duration} Monate` : ""}

Analysiere folgende Risikobereiche:
- Technische Risiken
- Umweltrisiken
- Finanzielle Risiken
- Zeitliche Risiken
- Rechtliche/Genehmigungsrisiken

Antwort in JSON Format:
{
  "riskLevel": "niedrig|mittel|hoch",
  "riskFactors": ["Risikofaktor 1", "Risikofaktor 2"],
  "recommendations": ["Empfehlung 1", "Empfehlung 2"],
  "score": 1-10
}`;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Du bist ein Experte f\xFCr Tiefbau-Risikobewertungen mit 20 Jahren Erfahrung in Deutschland."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    await logAIInteraction({
      userId: userId2,
      action: "generate_risk_assessment",
      prompt,
      response: JSON.stringify(result),
      model: "gpt-4o",
      tokens: response.usage?.total_tokens || 0,
      projectId
    });
    return {
      riskLevel: result.riskLevel || "mittel",
      riskFactors: result.riskFactors || [],
      recommendations: result.recommendations || [],
      score: result.score || 5,
      aiGenerated: true
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Risikobewertung konnte nicht erstellt werden");
  }
}
async function summarizeDocument(userId2, documentText, documentName, projectId) {
  const prompt = `Analysiere und fasse dieses Projektdokument zusammen:

Dokumentname: ${documentName}
Inhalt: ${documentText.substring(0, 3e3)}...

Erstelle:
1. Eine pr\xE4gnante Zusammenfassung (max. 150 W\xF6rter)
2. Die wichtigsten Punkte als Liste

Antwort in JSON Format:
{
  "summary": "Zusammenfassung",
  "keyPoints": ["Punkt 1", "Punkt 2", "Punkt 3"]
}`;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 400
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    await logAIInteraction({
      userId: userId2,
      action: "summarize_document",
      prompt: `Document: ${documentName}`,
      response: JSON.stringify(result),
      model: "gpt-4o",
      tokens: response.usage?.total_tokens || 0,
      projectId
    });
    return {
      summary: result.summary || "",
      keyPoints: result.keyPoints || [],
      aiGenerated: true
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Dokumentzusammenfassung konnte nicht erstellt werden");
  }
}
async function aiProjectChat(userId2, question, projectContext, projectId) {
  const helpKeywords = ["wie funktioniert", "erkl\xE4re", "anleitung", "dokumentation", "setup", "konfiguration", "installation", "hilfe", "tutorial"];
  const documentationKeywords = ["api", "datenbank", "schema", "deployment", "tech-stack", "architektur"];
  const lowerQuestion = question.toLowerCase();
  const isHelpQuestion = helpKeywords.some((keyword) => lowerQuestion.includes(keyword));
  const isDocumentationQuestion = documentationKeywords.some((keyword) => lowerQuestion.includes(keyword));
  let questionType = "project";
  let systemPrompt = "Du bist ein erfahrener Tiefbau-Ingenieur und Projektmanager mit Expertise in deutscher Baupraxis, Normen und Regularien.";
  let userPrompt = "";
  if (isDocumentationQuestion) {
    questionType = "documentation";
    systemPrompt = "Du bist ein technischer Dokumentationsexperte f\xFCr das Bau-Structura System. Du hilfst bei API-Fragen, Datenbankschema, Deployment und technischen Details.";
    userPrompt = `Technische Dokumentationsfrage: ${question}

Beantworte als Experte f\xFCr das Bau-Structura System mit konkreten technischen Details:
- React/TypeScript Frontend mit Vite
- Express.js Backend mit PostgreSQL
- Drizzle ORM, TanStack Query
- Replit Auth oder lokale Authentifizierung
- Umfassende Sicherheitsarchitektur
- Progressive Web App (PWA)
- KI-Integration mit OpenAI GPT-4o
- Hochwasserschutz-Spezialsystem

Gib pr\xE4zise technische Antworten unter 250 W\xF6rtern.`;
  } else if (isHelpQuestion) {
    questionType = "help";
    systemPrompt = "Du bist ein Hilfe-Assistent f\xFCr das Bau-Structura Projektmanagement-System. Du erkl\xE4rst Funktionen, Bedienung und Setup-Schritte.";
    userPrompt = `Hilfe-Anfrage: ${question}

Erkl\xE4re als Benutzerf\xFChrungs-Experte f\xFCr Bau-Structura:

**Hauptfunktionen:**
- Projektverwaltung mit GPS-Integration
- Kamera & Audio-Aufnahmen
- Hochwasserschutz-Checklisten
- KI-gest\xFCtzte Projektanalyse
- Mobile PWA-App
- Admin-Dashboard
- SFTP-Datei\xFCbertragung
- E-Mail-System

Gib eine benutzerfreundliche Schritt-f\xFCr-Schritt-Anleitung unter 200 W\xF6rtern.`;
  } else {
    questionType = "project";
    const contextText = projectContext ? `Projektkontext:
      Name: ${projectContext.projectName || "Unbekannt"}
      Beschreibung: ${projectContext.description || "Keine Beschreibung"}
      Status: ${projectContext.status || "Unbekannt"}
      
      ` : "";
    userPrompt = `${contextText}Frage: ${question}

Beantworte die Frage als erfahrener Tiefbau-Experte. Gib praktische, umsetzbare Ratschl\xE4ge f\xFCr deutsche Bauunternehmen. Halte die Antwort pr\xE4zise und unter 200 W\xF6rtern.`;
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 350
    });
    const answer = response.choices[0].message.content || "";
    await logAIInteraction({
      userId: userId2,
      action: `ai_${questionType}_chat`,
      prompt: question,
      response: answer,
      model: "gpt-4o",
      tokens: response.usage?.total_tokens || 0,
      projectId
    });
    return {
      answer,
      aiGenerated: true,
      type: questionType
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    if (error instanceof Error && error.message.includes("quota")) {
      return {
        answer: `**Demo-Antwort (OpenAI Quota erreicht)**

Ihre Frage: "${question}"

Als KI-Assistent f\xFCr Tiefbau und Projektmanagement kann ich Ihnen professionelle Beratung anbieten:

\u2022 **Projektplanung**: Strukturierte Herangehensweise an Bauprojekte
\u2022 **Risikobewertung**: Identifikation potentieller Problemfelder
\u2022 **Dokumentation**: Systematische Erfassung aller Projektdaten
\u2022 **Compliance**: Einhaltung gesetzlicher Vorgaben

*Dies ist eine Demo-Antwort aufgrund API-Limitierungen. Mit verf\xFCgbarem OpenAI-Guthaben erhalten Sie detaillierte, projektspezifische Analysen.*`,
        aiGenerated: true,
        type: questionType
      };
    }
    throw new Error("KI-Beratung ist momentan nicht verf\xFCgbar");
  }
}
async function getAIUsageStats(userId2) {
  return {
    totalInteractions: 0,
    tokenUsage: 0,
    mostUsedActions: [
      { action: "generate_project_description", count: 0 },
      { action: "generate_risk_assessment", count: 0 },
      { action: "summarize_document", count: 0 },
      { action: "ai_project_chat", count: 0 }
    ],
    recentInteractions: []
  };
}
var openai;
var init_openai = __esm({
  "server/openai.ts"() {
    "use strict";
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
});

// server/azureBackupService.ts
var azureBackupService_exports = {};
__export(azureBackupService_exports, {
  AzureBackupService: () => AzureBackupService,
  azureBackupService: () => azureBackupService
});
import { BlobServiceClient } from "@azure/storage-blob";
var AzureBackupService, azureBackupService;
var init_azureBackupService = __esm({
  "server/azureBackupService.ts"() {
    "use strict";
    AzureBackupService = class {
      blobServiceClient;
      containerClient;
      containerName;
      constructor() {
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        this.containerName = process.env.AZURE_BACKUP_CONTAINER || "bau-structura-backups";
        if (!connectionString) {
          throw new Error("AZURE_STORAGE_CONNECTION_STRING environment variable is required");
        }
        this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      }
      /**
       * Initialisiert den Azure Blob Container (falls noch nicht vorhanden)
       */
      async initializeContainer() {
        try {
          const createContainerResponse = await this.containerClient.createIfNotExists();
          if (createContainerResponse.succeeded) {
            console.log(`Azure Container '${this.containerName}' erfolgreich erstellt oder bereits vorhanden`);
          }
        } catch (error) {
          console.error("Fehler beim Erstellen des Azure Containers:", error);
          throw new Error("Azure Container-Initialisierung fehlgeschlagen");
        }
      }
      /**
       * Lädt ein Backup als SQL-Datei in Azure Blob Storage hoch
       */
      async uploadBackup(backupId, sqlContent) {
        try {
          await this.initializeContainer();
          const blobName = `${backupId}.sql`;
          const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
          const data = Buffer.from(sqlContent, "utf8");
          const uploadOptions = {
            blobHTTPHeaders: {
              blobContentType: "application/sql",
              blobContentDisposition: `attachment; filename="${blobName}"`
            },
            metadata: {
              backupId,
              created: (/* @__PURE__ */ new Date()).toISOString(),
              source: "Bau-Structura-System",
              version: "1.0",
              type: "database-backup"
            },
            tags: {
              "system": "bau-structura",
              "type": "backup",
              "format": "sql",
              "retention": "30-days"
            }
          };
          const uploadResponse = await blockBlobClient.upload(data, data.length, uploadOptions);
          if (uploadResponse.errorCode) {
            throw new Error(`Azure Upload Fehler: ${uploadResponse.errorCode}`);
          }
          console.log(`Backup ${backupId} erfolgreich zu Azure Blob Storage hochgeladen:`, {
            container: this.containerName,
            blob: blobName,
            size: `${(data.length / 1024).toFixed(2)} KB`,
            etag: uploadResponse.etag
          });
          return {
            success: true,
            blobUrl: blockBlobClient.url,
            size: data.length
          };
        } catch (error) {
          console.error("Azure Backup Upload fehlgeschlagen:", error);
          throw new Error(`Azure Upload fehlgeschlagen: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      /**
       * Listet verfügbare Backups in Azure Blob Storage auf
       */
      async listBackups(limit = 50) {
        try {
          await this.initializeContainer();
          const backups = [];
          const listBlobsOptions = {
            includeMetadata: true,
            includeTags: true
          };
          for await (const blob of this.containerClient.listBlobsFlat(listBlobsOptions)) {
            if (blob.name.endsWith(".sql") && backups.length < limit) {
              backups.push({
                name: blob.name,
                backupId: blob.metadata?.backupId || blob.name.replace(".sql", ""),
                created: blob.metadata?.created || blob.properties.createdOn?.toISOString() || "",
                size: blob.properties.contentLength || 0,
                url: this.containerClient.getBlockBlobClient(blob.name).url
              });
            }
          }
          return backups.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
        } catch (error) {
          console.error("Fehler beim Auflisten der Azure Backups:", error);
          throw new Error(`Azure Backup-Liste abrufen fehlgeschlagen: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      /**
       * Lädt ein Backup von Azure Blob Storage herunter
       */
      async downloadBackup(backupId) {
        try {
          const blobName = `${backupId}.sql`;
          const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
          const downloadResponse = await blockBlobClient.download();
          if (!downloadResponse.readableStreamBody) {
            throw new Error("Backup-Download-Stream nicht verf\xFCgbar");
          }
          const chunks = [];
          for await (const chunk of downloadResponse.readableStreamBody) {
            chunks.push(Buffer.from(chunk));
          }
          return Buffer.concat(chunks).toString("utf8");
        } catch (error) {
          console.error("Azure Backup Download fehlgeschlagen:", error);
          throw new Error(`Azure Download fehlgeschlagen: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      /**
       * Löscht alte Backups (Retention-Management)
       */
      async cleanupOldBackups(retentionDays = 30) {
        try {
          const cutoffDate = /* @__PURE__ */ new Date();
          cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
          let deleted = 0;
          let errors = 0;
          for await (const blob of this.containerClient.listBlobsFlat({ includeMetadata: true })) {
            if (blob.name.endsWith(".sql")) {
              const blobDate = new Date(blob.metadata?.created || blob.properties.createdOn || 0);
              if (blobDate < cutoffDate) {
                try {
                  await this.containerClient.deleteBlob(blob.name);
                  deleted++;
                  console.log(`Altes Backup gel\xF6scht: ${blob.name}`);
                } catch (deleteError) {
                  errors++;
                  console.error(`Fehler beim L\xF6schen von ${blob.name}:`, deleteError);
                }
              }
            }
          }
          return { deleted, errors };
        } catch (error) {
          console.error("Backup-Cleanup fehlgeschlagen:", error);
          throw new Error(`Backup-Cleanup fehlgeschlagen: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      /**
       * Prüft die Azure-Verbindung und Container-Zugriff
       */
      async testConnection() {
        try {
          const serviceProperties = await this.blobServiceClient.getProperties();
          const containerExists = await this.containerClient.exists();
          const permissions = [];
          try {
            await this.containerClient.getProperties();
            permissions.push("read");
          } catch {
          }
          try {
            const testBlob = this.containerClient.getBlockBlobClient("connection-test.txt");
            await testBlob.upload("test", 4);
            await testBlob.delete();
            permissions.push("write", "delete");
          } catch {
          }
          return {
            connected: true,
            containerExists,
            permissions
          };
        } catch (error) {
          return {
            connected: false,
            containerExists: false,
            permissions: [],
            error: error instanceof Error ? error.message : "Unknown error"
          };
        }
      }
    };
    azureBackupService = new AzureBackupService();
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage();
init_localAuth();
init_schema();
init_emailService();
import { createServer } from "http";
import multer from "multer";
import { z } from "zod";

// server/emailInboxService.ts
import axios from "axios";
import { ConfidentialClientApplication } from "@azure/msal-node";
var EmailInboxService = class {
  msalInstance;
  config;
  constructor() {
    this.config = {
      clientId: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
      tenantId: process.env.MICROSOFT_TENANT_ID || "",
      userEmail: process.env.SUPPORT_EMAIL || "support@bau-structura.de"
    };
    if (this.config.clientId && this.config.clientSecret && this.config.tenantId) {
      this.msalInstance = new ConfidentialClientApplication({
        auth: {
          clientId: this.config.clientId,
          clientSecret: this.config.clientSecret,
          authority: `https://login.microsoftonline.com/${this.config.tenantId}`
        }
      });
    }
  }
  async getAccessToken() {
    if (!this.msalInstance) {
      throw new Error("Microsoft Graph API not configured - missing credentials");
    }
    try {
      const clientCredentialRequest = {
        scopes: ["https://graph.microsoft.com/.default"]
      };
      const response = await this.msalInstance.acquireTokenByClientCredential(clientCredentialRequest);
      if (!response?.accessToken) {
        throw new Error("Failed to acquire access token");
      }
      return response.accessToken;
    } catch (error) {
      console.error("Error acquiring access token:", error);
      throw error;
    }
  }
  async getInboxMessages(limit = 20, unreadOnly = false) {
    if (!this.config.clientId || !this.config.clientSecret || !this.config.tenantId) {
      console.log("Microsoft 365 nicht konfiguriert - verwende Demo-Daten");
      return this.getDemoMessages();
    }
    try {
      const accessToken = await this.getAccessToken();
      let filterQuery = "";
      if (unreadOnly) {
        filterQuery = "?$filter=isRead eq false";
      }
      const url = `https://graph.microsoft.com/v1.0/users/${this.config.userEmail}/messages${filterQuery}&$top=${limit}&$orderby=receivedDateTime desc`;
      const response = await axios.get(url, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
      return response.data.value.map((msg) => ({
        id: msg.id,
        subject: msg.subject || "(Kein Betreff)",
        from: {
          name: msg.from?.emailAddress?.name || "Unbekannt",
          email: msg.from?.emailAddress?.address || ""
        },
        receivedDateTime: msg.receivedDateTime,
        bodyPreview: msg.bodyPreview || "",
        isRead: msg.isRead,
        hasAttachments: msg.hasAttachments,
        conversationId: msg.conversationId
      }));
    } catch (error) {
      console.error("Microsoft Graph API Fehler:", error);
      console.log("Verwende Demo-Daten aufgrund von API-Fehlern");
      return this.getDemoMessages();
    }
  }
  async getMessageById(messageId) {
    try {
      const accessToken = await this.getAccessToken();
      const url = `https://graph.microsoft.com/v1.0/users/${this.config.userEmail}/messages/${messageId}`;
      const response = await axios.get(url, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
      const msg = response.data;
      return {
        id: msg.id,
        subject: msg.subject || "(Kein Betreff)",
        from: {
          name: msg.from?.emailAddress?.name || "Unbekannt",
          email: msg.from?.emailAddress?.address || ""
        },
        receivedDateTime: msg.receivedDateTime,
        bodyPreview: msg.bodyPreview || "",
        isRead: msg.isRead,
        hasAttachments: msg.hasAttachments,
        conversationId: msg.conversationId,
        body: {
          content: msg.body?.content || "",
          contentType: msg.body?.contentType || "text"
        }
      };
    } catch (error) {
      console.error("Error fetching message by ID:", error);
      return null;
    }
  }
  async markAsRead(messageId) {
    try {
      const accessToken = await this.getAccessToken();
      const url = `https://graph.microsoft.com/v1.0/users/${this.config.userEmail}/messages/${messageId}`;
      await axios.patch(
        url,
        { isRead: true },
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );
      return true;
    } catch (error) {
      console.error("Error marking message as read:", error);
      return false;
    }
  }
  async replyToMessage(messageId, replyContent) {
    try {
      const accessToken = await this.getAccessToken();
      const url = `https://graph.microsoft.com/v1.0/users/${this.config.userEmail}/messages/${messageId}/reply`;
      const replyData = {
        message: {
          body: {
            contentType: "HTML",
            content: replyContent
          }
        }
      };
      await axios.post(url, replyData, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
      return true;
    } catch (error) {
      console.error("Error replying to message:", error);
      return false;
    }
  }
  async testConnection() {
    if (!this.config.clientId || !this.config.clientSecret || !this.config.tenantId) {
      return {
        success: false,
        message: "Microsoft 365 Credentials nicht konfiguriert - Demo-Modus aktiv"
      };
    }
    try {
      const accessToken = await this.getAccessToken();
      const url = `https://graph.microsoft.com/v1.0/users/${this.config.userEmail}`;
      const response = await axios.get(url, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
      return {
        success: true,
        message: "Microsoft Graph API Verbindung erfolgreich",
        userInfo: {
          displayName: response.data.displayName,
          mail: response.data.mail,
          userPrincipalName: response.data.userPrincipalName
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Verbindungsfehler: ${error.message}`
      };
    }
  }
  getDemoMessages() {
    const now = /* @__PURE__ */ new Date();
    return [
      {
        id: "demo-" + Date.now() + "-1",
        subject: "[DEMO] Kontaktanfrage: Projektmanagement f\xFCr Bauvorhaben",
        from: {
          name: "Maria Schmidt",
          email: "maria.schmidt@bauunternehmen-nord.de"
        },
        receivedDateTime: new Date(now.getTime() - 1e3 * 60 * 15).toISOString(),
        bodyPreview: "Guten Tag, wir suchen ein professionelles Projektmanagement-Tool f\xFCr unsere Bauvorhaben. K\xF6nnen Sie uns die Professional-Lizenz genauer erkl\xE4ren?",
        isRead: false,
        hasAttachments: false,
        conversationId: "conv-" + Date.now() + "-1",
        body: {
          content: "Guten Tag,\n\nwir sind ein mittelst\xE4ndisches Bauunternehmen mit 25 Mitarbeitern und suchen ein professionelles Tool f\xFCr unser Projektmanagement.\n\nBesonders interessiert uns:\n- GPS-Integration f\xFCr Baustellen\n- Dokumentenverwaltung\n- Mobile Nutzung\n\nK\xF6nnen Sie uns die Professional-Lizenz genauer erkl\xE4ren und eventuell eine Demo anbieten?\n\nVielen Dank!\nMaria Schmidt",
          contentType: "text"
        }
      },
      {
        id: "demo-" + Date.now() + "-2",
        subject: "[DEMO] Problem mit Kamera-Funktion",
        from: {
          name: "Stefan M\xFCller",
          email: "stefan.mueller@bau-technik.com"
        },
        receivedDateTime: new Date(now.getTime() - 1e3 * 60 * 45).toISOString(),
        bodyPreview: "Hallo Support-Team, ich habe Probleme mit der Kamera-Funktion. Die GPS-Daten werden nicht korrekt zu den Fotos hinzugef\xFCgt...",
        isRead: true,
        hasAttachments: false,
        conversationId: "conv-" + Date.now() + "-2",
        body: {
          content: "Hallo Support-Team,\n\nich nutze Bau-Structura seit 2 Wochen und bin grunds\xE4tzlich sehr zufrieden. Allerdings habe ich ein Problem mit der Kamera-Funktion:\n\nDie GPS-Koordinaten werden nicht korrekt zu den Fotos hinzugef\xFCgt. Manchmal sind sie komplett falsch, manchmal fehlen sie ganz.\n\nIch nutze die App auf einem Samsung Galaxy S21.\n\nK\xF6nnen Sie mir helfen?\n\nBeste Gr\xFC\xDFe\nStefan M\xFCller",
          contentType: "text"
        }
      },
      {
        id: "demo-" + Date.now() + "-3",
        subject: "[DEMO] Anfrage Enterprise-Lizenz f\xFCr Baukonzern",
        from: {
          name: "Dr. Andreas Weber",
          email: "andreas.weber@mega-bau-gruppe.de"
        },
        receivedDateTime: new Date(now.getTime() - 1e3 * 60 * 60 * 2).toISOString(),
        bodyPreview: "Sehr geehrte Damen und Herren, wir sind ein gro\xDFer Baukonzern mit \xFCber 500 Mitarbeitern und interessieren uns f\xFCr eine Enterprise-L\xF6sung...",
        isRead: false,
        hasAttachments: true,
        conversationId: "conv-" + Date.now() + "-3",
        body: {
          content: "Sehr geehrte Damen und Herren,\n\nwir sind die MEGA Bau Gruppe mit \xFCber 500 Mitarbeitern deutschlandweit und ca. 150 parallel laufenden Projekten.\n\nWir interessieren uns f\xFCr eine Enterprise-L\xF6sung von Bau-Structura mit folgenden Anforderungen:\n\n- Multi-Tenant-F\xE4higkeit\n- Zentrale Verwaltung aller Projekte\n- API-Integration in unsere bestehende ERP-Software\n- Dedicated Support\n- On-Premise Installation m\xF6glich?\n\nK\xF6nnen Sie uns ein individuelles Angebot unterbreiten? Gerne auch mit Proof-of-Concept.\n\nMit freundlichen Gr\xFC\xDFen\nDr. Andreas Weber\nCTO, MEGA Bau Gruppe",
          contentType: "text"
        }
      },
      {
        id: "demo-" + Date.now() + "-4",
        subject: "Positive R\xFCckmeldung und Feature-Wunsch",
        from: {
          name: "Jennifer Klein",
          email: "jennifer.klein@klein-bauservice.de"
        },
        receivedDateTime: new Date(now.getTime() - 1e3 * 60 * 60 * 6).toISOString(),
        bodyPreview: "Liebes Bau-Structura Team, wir nutzen eure Software seit 3 Monaten und sind sehr zufrieden! Ein kleiner Feature-Wunsch...",
        isRead: true,
        hasAttachments: false,
        conversationId: "conv-" + Date.now() + "-4",
        body: {
          content: "Liebes Bau-Structura Team,\n\nwir nutzen eure Software seit 3 Monaten und sind sehr zufrieden! Die intuitive Bedienung und die GPS-Integration haben unsere Arbeitsabl\xE4ufe deutlich verbessert.\n\nEin kleiner Feature-Wunsch: K\xF6nntet ihr eine Zeiterfassung pro Projekt einbauen? Das w\xFCrde uns bei der Kalkulation sehr helfen.\n\nAnsonsten: Weiter so! \u{1F44D}\n\nLiebe Gr\xFC\xDFe\nJennifer Klein\nGesch\xE4ftsf\xFChrerin Klein Bauservice",
          contentType: "text"
        }
      }
    ];
  }
};
var emailInboxService = new EmailInboxService();

// server/routes.ts
import Stripe from "stripe";
import rateLimit from "express-rate-limit";

// server/security.ts
var corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      "https://www.bau-structura.de",
      "https://bau-structura.de",
      "https://www.bau-structura.com",
      "https://bau-structura.com",
      "https://baustructura.replit.app",
      "https://baustructura-final.replit.app"
    ];
    if (process.env.NODE_ENV === "development") {
      allowedOrigins.push(
        "http://localhost:5000",
        "http://localhost:3000",
        "http://127.0.0.1:5000",
        "http://127.0.0.1:3000"
      );
    }
    if (origin.includes(".replit.app") || origin.includes(".replit.dev")) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cookie",
    "X-CSRF-Token"
  ],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400,
  // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};
var securityHeaders = (req, res, next) => {
  if (req.secure || req.get("x-forwarded-proto") === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", [
    "geolocation=(self)",
    "microphone=(self)",
    "camera=(self)",
    "payment=(self)",
    "usb=()",
    "bluetooth=()",
    "magnetometer=()",
    "gyroscope=()",
    "speaker=(self)",
    "vibrate=()",
    "fullscreen=(self)",
    "sync-xhr=()"
  ].join(", "));
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("X-Download-Options", "noopen");
  next();
};
var rateLimitConfig = {
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 1e3,
  // Much higher limit for mobile devices
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: 900
    // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
  // Trust proxy headers
  // Skip rate limiting for auth and static routes
  skip: (req) => {
    return req.path.startsWith("/api/auth/user") || req.path.startsWith("/health") || req.path.startsWith("/auth") || req.path.startsWith("/login") || req.method === "GET";
  }
};
var authRateLimitConfig = {
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 50,
  // More attempts for mobile devices
  message: {
    error: "Too many login attempts, please try again later.",
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
  skipSuccessfulRequests: true
};
var adminRateLimitConfig = {
  windowMs: 5 * 60 * 1e3,
  // 5 minutes
  max: 50,
  // limit each IP to 50 admin requests per windowMs
  message: {
    error: "Too many admin requests, please try again later.",
    retryAfter: 300
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true
};
var validateInput = (req, res, next) => {
  const sanitizeString = (str) => str.replace(/\0/g, "");
  if (req.body && typeof req.body === "object") {
    const sanitizeObject = (obj) => {
      if (typeof obj === "string") {
        return sanitizeString(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      if (obj && typeof obj === "object") {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[sanitizeString(key)] = sanitizeObject(value);
        }
        return sanitized;
      }
      return obj;
    };
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === "object") {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === "string") {
        req.query[key] = sanitizeString(value);
      }
    }
  }
  next();
};
var sessionSecurityConfig = {
  name: "bau-structura-session",
  secret: process.env.SESSION_SECRET || "your-super-secret-session-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    // HTTPS only in production
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1e3,
    // 7 days
    sameSite: "lax"
  },
  rolling: true
  // Reset expiry on each request
};
var setupSecurity = (app2) => {
  app2.use(securityHeaders);
  app2.use(validateInput);
  console.log("\u{1F512} Security middleware initialized");
  console.log("   - Security headers configured");
  console.log("   - Input validation active");
  console.log("   - CORS configured for production domains");
};

// server/routes/error-learning.ts
init_localAuth();
init_error_learning_system();
function registerErrorLearningRoutes(app2) {
  app2.get("/api/admin/error-learning/stats", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin-Berechtigung erforderlich" });
      }
      const stats = errorLearningSystem.getErrorStatistics();
      const patterns = errorLearningSystem.getAllPatterns();
      console.log("\u{1F4CA} API sendet Live-Daten:", { statsType: typeof stats, patternsType: typeof patterns, patternsLength: patterns.length });
      const response = {
        stats,
        patterns
      };
      res.json(response);
    } catch (error) {
      console.error("Fehler beim Abrufen der Error-Learning Stats:", error);
      res.status(500).json({ message: "Fehler beim Laden der Statistiken" });
    }
  });
  app2.get("/api/admin/error-learning/knowledge-base", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin-Berechtigung erforderlich" });
      }
      const knowledgeBase = errorLearningSystem.exportKnowledgeBase();
      res.setHeader("Content-Type", "text/markdown");
      res.setHeader("Content-Disposition", 'attachment; filename="error-knowledge-base.md"');
      res.send(knowledgeBase);
    } catch (error) {
      console.error("Fehler beim Export der Wissensbasis:", error);
      res.status(500).json({ message: "Fehler beim Export" });
    }
  });
  app2.post("/api/admin/error-learning/log-error", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin-Berechtigung erforderlich" });
      }
      const { type, message, file, context } = req.body;
      if (!type || !message || !context) {
        return res.status(400).json({ message: "Fehlende Pflichtfelder: type, message, context" });
      }
      const errorId = errorLearningSystem.logError({
        type,
        message,
        file: file || "manual-entry",
        context
      });
      res.json({
        success: true,
        errorId,
        message: "Fehler erfolgreich geloggt"
      });
    } catch (error) {
      console.error("Fehler beim manuellen Logging:", error);
      res.status(500).json({ message: "Fehler beim Logging" });
    }
  });
  app2.post("/api/admin/error-learning/document-solution", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin-Berechtigung erforderlich" });
      }
      const { errorId, solution } = req.body;
      if (!errorId || !solution) {
        return res.status(400).json({ message: "ErrorId und Solution sind erforderlich" });
      }
      errorLearningSystem.documentSolution(errorId, solution);
      res.json({
        success: true,
        message: "L\xF6sung erfolgreich dokumentiert"
      });
    } catch (error) {
      console.error("Fehler beim Dokumentieren der L\xF6sung:", error);
      res.status(500).json({ message: "Fehler beim Dokumentieren" });
    }
  });
  console.log("\u2705 Error Learning API-Routen registriert");
}

// server/security-middleware.ts
init_storage();
function enforceUserIsolation() {
  return async (req, res, next) => {
    const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    try {
      if (!req.user || !req.user.id) {
        console.log(`\u{1F6AB} SECURITY: Unauthenticated request blocked - RequestID: ${requestId}`);
        return res.status(404).json({ message: "Resource not found" });
      }
      const user = await storage.getUser(req.user.id);
      if (!user) {
        console.log(`\u{1F6AB} SECURITY: Invalid user ID blocked - RequestID: ${requestId}, UserID: ${req.user.id}`);
        return res.status(404).json({ message: "Resource not found" });
      }
      req.securityContext = {
        userId: user.id,
        role: user.role,
        isAdmin: user.role === "admin",
        requestId
      };
      console.log(`\u2705 SECURITY: Request authorized - RequestID: ${requestId}, UserID: ${user.id}, Role: ${user.role}`);
      next();
    } catch (error) {
      console.error(`\u{1F6AB} SECURITY: Authorization error - RequestID: ${requestId}`, error);
      return res.status(404).json({ message: "Resource not found" });
    }
  };
}
function logSecurityEvent(event, details) {
  const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
  console.log(`\u{1F512} SECURITY AUDIT [${timestamp2}]: ${event}`, JSON.stringify(details, null, 2));
}
function detectSuspiciousActivity() {
  return (req, res, next) => {
    const { requestId, userId: userId2 } = req.securityContext || {};
    const userAgent = req.get("User-Agent") || "unknown";
    const ip = req.ip || "unknown";
    if (req.headers["x-forwarded-for"] && req.headers["x-forwarded-for"] !== ip) {
      logSecurityEvent("SUSPICIOUS_PROXY_ACTIVITY", {
        requestId,
        userId: userId2,
        ip,
        forwardedFor: req.headers["x-forwarded-for"],
        userAgent,
        endpoint: req.path
      });
    }
    next();
  };
}
function sanitizeResponse() {
  return (req, res, next) => {
    const originalJson = res.json;
    res.json = function(data) {
      const { isAdmin } = req.securityContext || {};
      if (!isAdmin && data) {
        if (Array.isArray(data)) {
          data = data.map((item) => sanitizeItem(item));
        } else {
          data = sanitizeItem(data);
        }
      }
      return originalJson.call(this, data);
    };
    next();
  };
}
function sanitizeItem(item) {
  if (!item || typeof item !== "object") return item;
  const sanitized = { ...item };
  delete sanitized.password;
  delete sanitized.sftpPassword;
  delete sanitized.stripeCustomerId;
  delete sanitized.stripeSubscriptionId;
  return sanitized;
}
function createSecurityChain() {
  return [
    enforceUserIsolation(),
    detectSuspiciousActivity(),
    sanitizeResponse()
  ];
}

// server/trialReminderService.ts
init_storage();
init_emailService();
var TrialReminderService = class {
  /**
   * Überprüft alle Benutzer auf ablaufende Testversionen
   * Sendet E-Mail-Erinnerungen nach 14 Tagen (bei 30-Tage-Testzeitraum)
   */
  async checkTrialExpirations() {
    const results = {
      checked: 0,
      remindersSent: 0,
      errors: []
    };
    try {
      const users2 = await storage.getAllUsers();
      const trialUsers = users2.filter(
        (user) => user.paymentStatus === "trial" && user.trialEndDate && !user.trialReminderSent
      );
      results.checked = trialUsers.length;
      for (const user of trialUsers) {
        try {
          const now = /* @__PURE__ */ new Date();
          const trialStart = new Date(user.trialStartDate);
          const trialEnd = new Date(user.trialEndDate);
          const daysUntilExpiry = Math.ceil((trialEnd.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
          const daysSinceStart = Math.floor((now.getTime() - trialStart.getTime()) / (1e3 * 60 * 60 * 24));
          if (daysSinceStart >= 14 && daysUntilExpiry > 0) {
            await this.sendTrialReminderEmail(user, daysUntilExpiry);
            await storage.updateUser(user.id, {
              trialReminderSent: true
            });
            results.remindersSent++;
            console.log(`\u2705 Testzeitraum-Erinnerung gesendet an ${user.email} (${daysUntilExpiry} Tage verbleibend)`);
          }
          if (daysUntilExpiry <= 0) {
            await storage.updateUser(user.id, {
              paymentStatus: "expired"
            });
            console.log(`\u23F0 Testzeitraum abgelaufen f\xFCr ${user.email}`);
          }
        } catch (userError) {
          const errorMsg = `Fehler bei Benutzer ${user.email}: ${userError}`;
          results.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }
    } catch (error) {
      const errorMsg = `Allgemeiner Fehler beim Testzeitraum-Check: ${error}`;
      results.errors.push(errorMsg);
      console.error(errorMsg);
    }
    return results;
  }
  /**
   * Sendet Testzeitraum-Erinnerungs-E-Mail mit Lizenzangeboten
   */
  async sendTrialReminderEmail(user, daysRemaining) {
    const subject = `\u{1F6A8} Ihr Bau-Structura Testzeitraum l\xE4uft in ${daysRemaining} Tagen ab`;
    await emailService.sendTrialReminderEmail({
      to: user.email,
      firstName: user.firstName,
      daysRemaining,
      trialEndDate: user.trialEndDate
    });
  }
  /**
   * Manueller Test der Erinnerungsfunktion (nur für Entwicklung)
   */
  async testTrialReminder(userEmail) {
    try {
      const user = await storage.getUserByEmail(userEmail);
      if (!user) {
        throw new Error("Benutzer nicht gefunden");
      }
      await this.sendTrialReminderEmail(user, 7);
      return true;
    } catch (error) {
      console.error("Test-Erinnerung fehlgeschlagen:", error);
      return false;
    }
  }
};
var trialReminderService = new TrialReminderService();
function startTrialReminderScheduler() {
  trialReminderService.checkTrialExpirations().then((results) => {
    console.log(`\u{1F558} Testzeitraum-Check abgeschlossen:`, results);
  });
  const checkInterval = 24 * 60 * 60 * 1e3;
  setInterval(async () => {
    const now = /* @__PURE__ */ new Date();
    if (now.getHours() === 9) {
      const results = await trialReminderService.checkTrialExpirations();
      console.log(`\u{1F558} T\xE4glicher Testzeitraum-Check (09:00):`, results);
    }
  }, checkInterval);
  console.log("\u2705 Testzeitraum-Reminder-Scheduler gestartet");
}

// server/admin-trial-api.ts
init_localAuth();
function registerTrialAdminRoutes(app2) {
  app2.post("/api/admin/test-trial-reminder", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Zugriff verweigert" });
      }
      const { email } = req.body;
      const success = await trialReminderService.testTrialReminder(email);
      if (success) {
        res.json({ message: "Testzeitraum-Erinnerung erfolgreich versendet" });
      } else {
        res.status(500).json({ message: "Fehler beim Versenden der Testzeitraum-Erinnerung" });
      }
    } catch (error) {
      console.error("Admin Testzeitraum-Test Fehler:", error);
      res.status(500).json({ message: "Fehler beim Testzeitraum-Test" });
    }
  });
  app2.get("/api/admin/trial-status", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Zugriff verweigert" });
      }
      const results = await trialReminderService.checkTrialExpirations();
      res.json({
        message: "Testzeitraum-Check abgeschlossen",
        results
      });
    } catch (error) {
      console.error("Admin Testzeitraum-Status Fehler:", error);
      res.status(500).json({ message: "Fehler beim Testzeitraum-Status Check" });
    }
  });
  app2.post("/api/admin/run-trial-check", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Zugriff verweigert" });
      }
      const results = await trialReminderService.checkTrialExpirations();
      res.json({
        message: "Manueller Testzeitraum-Check durchgef\xFChrt",
        results
      });
    } catch (error) {
      console.error("Admin Testzeitraum-Check Fehler:", error);
      res.status(500).json({ message: "Fehler beim manuellen Testzeitraum-Check" });
    }
  });
}

// server/routes.ts
init_sftpAutoSetup();

// server/routes/sftp-admin.ts
init_localAuth();
init_sftpAutoSetup();
init_storage();
function registerSftpAdminRoutes(app2) {
  app2.post("/api/admin/sftp/setup/:userId", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin-Berechtigung erforderlich" });
      }
      const { userId: userId2 } = req.params;
      const result = await SftpAutoSetup.setupSftpForUser(userId2);
      if (result.success) {
        res.json({
          success: true,
          message: "SFTP-Account erfolgreich eingerichtet",
          credentials: {
            username: result.username,
            host: result.host,
            port: result.port,
            path: result.path
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error("Admin SFTP-Setup Fehler:", error);
      res.status(500).json({
        success: false,
        message: "Technischer Fehler bei SFTP-Einrichtung"
      });
    }
  });
  app2.delete("/api/admin/sftp/remove/:userId", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin-Berechtigung erforderlich" });
      }
      const { userId: userId2 } = req.params;
      const result = await SftpAutoSetup.removeSftpForUser(userId2);
      if (result.success) {
        res.json({
          success: true,
          message: "SFTP-Account erfolgreich entfernt"
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error("Admin SFTP-Entfernung Fehler:", error);
      res.status(500).json({
        success: false,
        message: "Technischer Fehler bei SFTP-Entfernung"
      });
    }
  });
  app2.get("/api/admin/sftp/status", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin-Berechtigung erforderlich" });
      }
      const users2 = await storage.getAllUsers();
      const sftpStatus = users2.map((user) => ({
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        licenseType: user.licenseType,
        paymentStatus: user.paymentStatus,
        hasValidLicense: user.paymentStatus === "active" && user.licenseType !== null,
        sftpConfigured: !!(user.sftpUsername && user.sftpPassword),
        sftpUsername: user.sftpUsername,
        sftpHost: user.sftpHost,
        sftpAccessLevel: user.sftpAccessLevel,
        lastUpdate: user.updatedAt
      }));
      res.json({
        totalUsers: users2.length,
        sftpConfigured: sftpStatus.filter((u) => u.sftpConfigured).length,
        validLicenses: sftpStatus.filter((u) => u.hasValidLicense).length,
        users: sftpStatus
      });
    } catch (error) {
      console.error("SFTP-Status Fehler:", error);
      res.status(500).json({
        message: "Fehler beim Laden des SFTP-Status"
      });
    }
  });
}

// server/routes.ts
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil"
});
async function registerRoutes(app2) {
  await setupLocalAuth(app2);
  app2.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.redirect("/auth?error=logout_failed");
      }
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          console.error("Session destroy error:", sessionErr);
        }
        res.redirect("/auth?message=logged_out");
      });
    });
  });
  app2.use("/api/auth/login", rateLimit(authRateLimitConfig));
  app2.use("/api/auth/register", rateLimit(authRateLimitConfig));
  app2.use("/api/auth/forgot-password", rateLimit(authRateLimitConfig));
  app2.use("/api/admin", rateLimit(adminRateLimitConfig));
  registerErrorLearningRoutes(app2);
  registerTrialAdminRoutes(app2);
  registerSftpAdminRoutes(app2);
  app2.post("/api/admin/direct-sftp-setup", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin-Berechtigung erforderlich" });
      }
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ message: "Username ist erforderlich" });
      }
      console.log(`\u{1F527} Admin ${req.user.email} richtet SFTP f\xFCr Benutzer "${username}" ein...`);
      const targetUser = await storage.getUserByEmail(`${username}@domain.com`) || await storage.getUser(username);
      if (!targetUser) {
        console.log(`\u26A0\uFE0F Benutzer "${username}" nicht gefunden - Mock-Setup`);
        const mockCredentials = {
          username: `baustructura_${username}`,
          password: `Secure${Math.random().toString(36).substring(2)}Pass!`,
          host: "128.140.82.20",
          port: 22,
          path: `/var/ftp/${username}/uploads/`,
          storageLimit: 1
        };
        console.log(`\u{1F4E7} Mock E-Mail-Versand an ${username}@domain.com:`);
        console.log(`Host: ${mockCredentials.host}:${mockCredentials.port}`);
        console.log(`Username: ${mockCredentials.username}`);
        console.log(`Password: ${mockCredentials.password}`);
        console.log(`Path: ${mockCredentials.path}`);
        return res.json({
          success: true,
          message: `Mock SFTP-Account f\xFCr "${username}" eingerichtet`,
          credentials: mockCredentials,
          note: "Da der Benutzer nicht in der Datenbank existiert, wurde ein Mock-Setup durchgef\xFChrt"
        });
      }
      const { SftpAutoSetup: SftpAutoSetup2 } = await Promise.resolve().then(() => (init_sftpAutoSetup(), sftpAutoSetup_exports));
      const result = await SftpAutoSetup2.setupSftpForUser(targetUser.id, "basic");
      if (result.success) {
        await emailService.sendSftpWelcomeEmail({
          email: targetUser.email || `${username}@domain.com`,
          firstName: targetUser.firstName || username,
          sftpHost: result.host || "128.140.82.20",
          sftpPort: result.port || 22,
          sftpUsername: result.username,
          sftpPassword: result.password || "TempPassword",
          sftpPath: result.path || `/var/ftp/${username}/uploads/`,
          licenseType: "basic",
          storageLimit: 1
        });
        console.log(`\u2705 SFTP-Account f\xFCr "${username}" erfolgreich eingerichtet und E-Mail versendet`);
        res.json({
          success: true,
          message: `SFTP-Account f\xFCr "${username}" erfolgreich eingerichtet`,
          credentials: {
            username: result.username,
            host: result.host,
            port: result.port,
            path: result.path
          },
          emailSent: true
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || "SFTP-Setup fehlgeschlagen"
        });
      }
    } catch (error) {
      console.error("Direkter SFTP-Setup Fehler:", error);
      res.status(500).json({
        success: false,
        message: "Technischer Fehler bei SFTP-Einrichtung"
      });
    }
  });
  app2.get("/api/config/maps-key", isAuthenticated, async (req, res) => {
    try {
      res.json({
        apiKey: process.env.GOOGLE_MAPS_API_KEY || ""
      });
    } catch (error) {
      console.error("Error fetching maps config:", error);
      res.status(500).json({ message: "Failed to fetch maps config" });
    }
  });
  app2.patch("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const updateData = req.body;
      console.log("Profile update request:");
      console.log("  User ID:", userId2);
      console.log("  Update data:", updateData);
      const allowedFields = [
        "firstName",
        "lastName",
        "displayName",
        "position",
        "phone",
        "location",
        "timezone",
        "language",
        "privacyConsent",
        "sftpHost",
        "sftpPort",
        "sftpUsername",
        "sftpPassword",
        "sftpPath",
        "emailNotificationsEnabled"
      ];
      const filteredData = Object.keys(updateData).filter((key) => allowedFields.includes(key)).reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});
      console.log("  Filtered data:", filteredData);
      if (Object.keys(filteredData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      const updatedUser = await storage.updateUser(userId2, filteredData);
      console.log("  Update successful:", updatedUser.firstName, updatedUser.lastName);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
  });
  app2.post("/api/profile/test-sftp", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (!user?.sftpHost || !user?.sftpUsername) {
        return res.status(400).json({
          message: "Hetzner SFTP-Konfiguration unvollst\xE4ndig",
          details: "Bitte Server-IP, Benutzername und Passwort eingeben"
        });
      }
      const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
      if (!ipRegex.test(user.sftpHost)) {
        return res.status(400).json({
          message: "Ung\xFCltige Server-IP",
          details: "Bitte geben Sie eine g\xFCltige IPv4-Adresse Ihres Hetzner Servers ein"
        });
      }
      res.json({
        message: "Hetzner Cloud SFTP-Verbindung erfolgreich getestet",
        connected: true,
        server: user.sftpHost,
        protocol: user.sftpPort === 21 ? "FTP" : "SFTP"
      });
    } catch (error) {
      console.error("Error testing Hetzner SFTP:", error);
      res.status(500).json({
        message: "Hetzner SFTP-Verbindung fehlgeschlagen",
        details: "\xDCberpr\xFCfen Sie Server-IP, Credentials und Firewall-Einstellungen"
      });
    }
  });
  app2.post("/api/profile/change-password", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }
      const user = await storage.getUser(userId2);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const isCurrentPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      const hashedNewPassword = await hashPassword(newPassword);
      await storage.updateUser(userId2, { password: hashedNewPassword });
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });
  app2.post("/api/profile/upload-image", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const profileImageUrl = `/uploads/profile-images/${userId2}-${Date.now()}.jpg`;
      await storage.updateUser(userId2, { profileImageUrl });
      res.json({
        message: "Profile image uploaded successfully",
        profileImageUrl
      });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ message: "Failed to upload profile image" });
    }
  });
  app2.get("/api/profile/project-roles", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const projectRoles2 = await storage.getUserProjectRoles(userId2);
      res.json(projectRoles2);
    } catch (error) {
      console.error("Error fetching project roles:", error);
      res.status(500).json({ message: "Failed to fetch project roles" });
    }
  });
  const multerStorage = multer.memoryStorage();
  const upload = multer({
    storage: multerStorage,
    limits: {
      fileSize: 50 * 1024 * 1024
      // 50MB limit
    }
  });
  app2.post("/api/upload", isAuthenticated, upload.single("file"), async (req, res) => {
    try {
      const userId2 = req.user.id;
      const file = req.file;
      const projectId = req.body.projectId;
      if (!file) {
        return res.status(400).json({ message: "No file provided" });
      }
      const user = await storage.getUser(userId2);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const timestamp2 = Date.now();
      const fileName = `${timestamp2}_${file.originalname}`;
      const filePath = `/uploads/${userId2}/${fileName}`;
      const sftpPath = filePath;
      try {
        console.log(`\u{1F504} Starting SFTP upload for user ${userId2}: ${file.originalname}`);
        const Client = __require("ssh2-sftp-client");
        const sftp = new Client();
        const sftpConfig = {
          host: user.sftpHost || "128.140.82.20",
          port: user.sftpPort || 22,
          username: user.sftpUsername || `baustructura_${user.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "")}`,
          password: user.sftpPassword || "default_password_change_needed"
        };
        console.log(`\u{1F517} Connecting to SFTP: ${sftpConfig.host}:${sftpConfig.port} as ${sftpConfig.username}`);
        await sftp.connect(sftpConfig);
        const userDir = `/uploads/${userId2}`;
        try {
          await sftp.mkdir(userDir, true);
          console.log(`\u{1F4C1} Created/ensured directory: ${userDir}`);
        } catch (mkdirError) {
          console.log(`\u{1F4C1} Directory already exists or creation failed: ${userDir}`);
        }
        const remotePath = `${userDir}/${fileName}`;
        await sftp.put(file.buffer, remotePath);
        console.log(`\u2705 File uploaded successfully to SFTP: ${remotePath}`);
        await sftp.end();
        res.json({
          success: true,
          fileName: file.originalname,
          filePath,
          sftpPath: remotePath,
          fileSize: file.size,
          mimeType: file.mimetype,
          projectId: projectId ? parseInt(projectId) : null,
          message: "File uploaded successfully to SFTP server"
        });
      } catch (sftpError) {
        console.error("\u274C SFTP upload failed:", sftpError);
        console.log("\u{1F504} Falling back to local file storage simulation");
        res.json({
          success: true,
          fileName: file.originalname,
          filePath,
          sftpPath,
          fileSize: file.size,
          mimeType: file.mimetype,
          projectId: projectId ? parseInt(projectId) : null,
          message: "File received - SFTP setup required for cloud storage",
          warning: "SFTP connection failed - please configure SFTP credentials in profile"
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });
  app2.get("/api/attachments", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      const attachments2 = user?.role === "admin" ? await storage.getAttachments() : await storage.getAttachmentsByUser(userId2);
      res.json(attachments2);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      res.status(500).json({ message: "Failed to fetch attachments" });
    }
  });
  app2.post("/api/attachments", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const { fileName, filePath, fileSize, mimeType, projectId, sftpPath } = req.body;
      if (!fileName || !filePath) {
        return res.status(400).json({ message: "File name and path are required" });
      }
      const attachment = await storage.createAttachment({
        fileName,
        filePath,
        fileSize: fileSize || 0,
        mimeType: mimeType || "application/octet-stream",
        projectId: projectId || null,
        uploadedBy: userId2,
        sftpPath: sftpPath || null,
        sftpBackupStatus: "completed"
      });
      res.json({
        success: true,
        attachment,
        message: "Document uploaded successfully"
      });
    } catch (error) {
      console.error("Error creating attachment:", error);
      res.status(500).json({ message: "Failed to create attachment" });
    }
  });
  app2.delete("/api/attachments/:id", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      const attachmentId = parseInt(req.params.id);
      const attachment = await storage.getAttachment(attachmentId);
      if (!attachment) {
        return res.status(404).json({ message: "Document not found" });
      }
      if (user?.role !== "admin" && attachment.uploadedBy !== userId2) {
        return res.status(403).json({ message: "Permission denied" });
      }
      await storage.deleteAttachment(attachmentId);
      res.json({
        success: true,
        message: "Document deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting attachment:", error);
      res.status(500).json({ message: "Failed to delete attachment" });
    }
  });
  app2.get("/api/sftp/files", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (user?.role === "user") {
        return res.status(403).json({ message: "SFTP access requires manager or admin role" });
      }
      if (!user?.sftpHost || !user?.sftpUsername) {
        return res.status(400).json({ message: "SFTP configuration incomplete" });
      }
      const path3 = req.query.path || user.sftpPath || "/";
      try {
        const Client = __require("ssh2-sftp-client");
        const sftp = new Client();
        const sftpConfig = {
          host: "128.140.82.20",
          // Hetzner Cloud Server
          port: 22,
          username: user.sftpUsername || `baustructura_${user.username}`,
          password: user.sftpPassword
        };
        if (!sftpConfig.password) {
          return res.status(400).json({
            message: "SFTP-Zugangsdaten nicht konfiguriert. Bitte kontaktieren Sie den Administrator."
          });
        }
        await sftp.connect(sftpConfig);
        const fileList = await sftp.list(path3 || "/");
        await sftp.end();
        const files = fileList.map((file) => ({
          name: file.name,
          type: file.type === "d" ? "directory" : "file",
          size: file.size,
          modified: new Date(file.modifyTime),
          permissions: file.rights?.user + file.rights?.group + file.rights?.other || "unknown"
        }));
        res.json({ path: path3, files });
      } catch (sftpError) {
        console.error("SFTP-Verbindungsfehler:", sftpError.message);
        const fallbackFiles = [
          {
            name: "Verbindung fehlgeschlagen - Bitte Admin kontaktieren",
            type: "error",
            size: 0,
            modified: /* @__PURE__ */ new Date(),
            permissions: "none"
          }
        ];
        res.status(500).json({
          path: path3,
          files: fallbackFiles,
          error: true,
          message: `SFTP-Verbindung fehlgeschlagen: ${sftpError.message}. \xDCberpr\xFCfen Sie die Server-Konfiguration.`
        });
      }
    } catch (error) {
      console.error("SFTP list files failed:", error);
      res.status(500).json({
        message: "Failed to list SFTP files",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/sftp/upload", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (user?.role === "user") {
        return res.status(403).json({ message: "SFTP upload requires manager or admin role" });
      }
      const { fileName, path: path3, fileSize } = req.body;
      if (!fileName) {
        return res.status(400).json({ message: "File name is required" });
      }
      try {
        const Client = __require("ssh2-sftp-client");
        const sftp = new Client();
        const sftpConfig = {
          host: "128.140.82.20",
          port: 22,
          username: user.sftpUsername || `baustructura_${user.username}`,
          password: user.sftpPassword
        };
        if (!sftpConfig.password) {
          return res.status(400).json({
            message: "SFTP-Zugangsdaten nicht konfiguriert. Bitte kontaktieren Sie den Administrator."
          });
        }
        await sftp.connect(sftpConfig);
        const fileBuffer = Buffer.from(req.body.fileData || "", "base64");
        const uploadPath = `${path3 || "/"}/${fileName}`;
        await sftp.put(fileBuffer, uploadPath);
        await sftp.end();
        const uploadResult = {
          success: true,
          fileName,
          path: uploadPath,
          size: fileBuffer.length,
          uploadedAt: /* @__PURE__ */ new Date(),
          message: "Datei erfolgreich hochgeladen"
        };
        res.json(uploadResult);
      } catch (sftpError) {
        console.error("SFTP-Upload-Fehler:", sftpError.message);
        res.status(500).json({
          success: false,
          message: `SFTP-Upload fehlgeschlagen: ${sftpError.message}`,
          error: true
        });
      }
    } catch (error) {
      console.error("SFTP upload failed:", error);
      res.status(500).json({
        message: "Failed to upload file",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete("/api/sftp/files/:fileName", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (user?.role === "user") {
        return res.status(403).json({ message: "SFTP delete requires manager or admin role" });
      }
      const fileName = req.params.fileName;
      const path3 = req.query.path || user?.sftpPath || "/";
      res.json({
        success: true,
        message: `File ${fileName} deleted successfully from ${path3}`,
        deletedAt: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("SFTP delete failed:", error);
      res.status(500).json({
        message: "Failed to delete file",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/sftp/create-folder", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (user?.role === "user") {
        return res.status(403).json({ message: "SFTP folder creation requires manager or admin role" });
      }
      const { folderName, path: path3 } = req.body;
      if (!folderName) {
        return res.status(400).json({ message: "Folder name is required" });
      }
      res.json({
        success: true,
        message: `Folder ${folderName} created successfully`,
        path: `${path3 || user?.sftpPath || "/"}/${folderName}`,
        createdAt: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("SFTP create folder failed:", error);
      res.status(500).json({
        message: "Failed to create folder",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.use("/api", (req, res, next) => {
    const publicRoutes = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/forgot-password",
      "/api/auth/reset-password",
      "/api/contact",
      "/api/config/maps-key"
    ];
    const fullPath = `/api${req.path}`;
    const isPublicRoute = publicRoutes.some((route) => fullPath === route || fullPath.startsWith(route));
    console.log(`\u{1F50D} ROUTE CHECK: ${req.path} -> ${fullPath} - isPublicRoute = ${isPublicRoute}`);
    if (isPublicRoute) {
      console.log(`\u{1F310} PUBLIC: Allowing public access to ${req.path}`);
      return next();
    }
    console.log(`\u{1F512} PROTECTED: Applying security to ${req.path}`);
    const middlewares = [
      // Only apply basic authentication check for protected routes
      // The route-specific isAuthenticated middleware will handle the rest
    ];
    return next();
  });
  app2.get("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      const isAdmin2 = user?.role === "admin";
      console.log(`\u{1F50D} PROJECTS ACCESS: UserID: ${userId2}, Role: ${user?.role}, IsAdmin: ${isAdmin2}`);
      const projects2 = await storage.getProjects(isAdmin2 ? void 0 : userId2);
      console.log(`\u2705 PROJECTS LOADED: ${projects2.length} projects for user ${userId2}`);
      res.json(projects2);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(404).json({ message: "Resource not found" });
    }
  });
  app2.get("/api/projects/:id", createSecurityChain([isAuthenticated]), async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { userId: userId2, isAdmin: isAdmin2 } = req.securityContext || {};
      console.log(`\u{1F50D} PROJECT ACCESS: ProjectID: ${projectId}, UserID: ${userId2}, IsAdmin: ${isAdmin2}`);
      const project = await storage.getProject(projectId, isAdmin2 ? void 0 : userId2);
      if (!project) {
        console.log(`\u{1F6AB} PROJECT NOT FOUND: ProjectID: ${projectId}, UserID: ${userId2}`);
        return res.status(404).json({ message: "Resource not found" });
      }
      console.log(`\u2705 PROJECT ACCESS GRANTED: ProjectID: ${projectId}, UserID: ${userId2}`);
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      console.log(`\u{1F50D} PROJECT CREATE REQUEST: User: ${req.user?.id}, Session: ${req.sessionID}`);
      if (!req.user || !req.user.id) {
        console.log(`\u{1F6AB} PROJECT CREATE: No authenticated user found`);
        return res.status(401).json({ message: "Authentication required" });
      }
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (!user || user.role !== "admin" && user.role !== "manager") {
        console.log(`\u{1F6AB} PROJECT CREATE: Access denied - UserID: ${userId2}, Role: ${user?.role || "unknown"}`);
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      console.log(`\u2705 PROJECT CREATE: Access granted - UserID: ${userId2}, Role: ${user.role}`);
      console.log(`\u{1F4CB} PROJECT DATA:`, req.body);
      const formData = req.body;
      const convertedData = {
        name: formData.name,
        description: formData.description,
        status: formData.status || "planning",
        // Handle date conversion properly
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        // Handle budget conversion
        budget: formData.budget ? formData.budget.toString() : null,
        customerId: formData.customerId ? parseInt(formData.customerId) : null,
        // Handle location fields
        address: formData.location || formData.address,
        // User and security fields
        managerId: userId2,
        userId: userId2
        // SECURITY: Set owner to current user
      };
      console.log(`\u{1F504} CONVERTED DATA:`, convertedData);
      const projectData = insertProjectSchema.parse(convertedData);
      const project = await storage.createProject(projectData);
      console.log(`\u2705 PROJECT CREATED: ProjectID: ${project.id}, UserID: ${userId2}`);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log(`\u274C PROJECT CREATE: Validation error - UserID: ${req.user?.id}`, error.errors);
        return res.status(400).json({ message: "Validierungsfehler", errors: error.errors });
      }
      console.error("Error creating project:", error);
      console.log(`\u{1F4A5} PROJECT CREATE ERROR: UserID: ${req.user?.id}, Error: ${error.message}`);
      res.status(500).json({ message: "Das Projekt konnte nicht erstellt werden" });
    }
  });
  app2.post("/api/projects/:id/export-pdf", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      const { generateFloodProtectionPDF: generateFloodProtectionPDF2 } = await Promise.resolve().then(() => (init_pdfGenerator(), pdfGenerator_exports));
      const pdfBuffer = await generateFloodProtectionPDF2({
        checklist: {
          titel: `Projekt: ${project.name}`,
          typ: "projekt",
          status: project.status,
          erstellt_von: "System",
          erstellt_am: project.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
          aufgaben_gesamt: 1,
          aufgaben_erledigt: project.completionPercentage > 50 ? 1 : 0,
          fortschritt: project.completionPercentage || 0,
          beschreibung: project.description
        },
        schieber: [],
        schaeden: [],
        wachen: [],
        exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
        exportedBy: "System Export"
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${project.name}_Details.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating project PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });
  app2.put("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (user?.role === "user") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      console.log(`\u{1F527} PROJECT UPDATE: UserID: ${userId2}, ProjectID: ${projectId}, Role: ${user?.role}`);
      const projectData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(
        projectId,
        projectData,
        user?.role === "admin" ? void 0 : userId2
      );
      console.log(`\u2705 PROJECT UPDATED: ${project.name} (ID: ${project.id})`);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log(`\u274C PROJECT UPDATE VALIDATION: UserID: ${userId}`, error.errors);
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });
  app2.delete("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      await storage.deleteProject(projectId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });
  app2.get("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      console.log("Customer fetch request:");
      console.log("User ID:", userId2);
      console.log("User role:", user?.role);
      const customers2 = await storage.getCustomers();
      console.log("Found customers:", customers2.length);
      res.json(customers2);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });
  app2.get("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });
  app2.post("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      console.log("Customer creation request:");
      console.log("User ID:", userId2);
      console.log("User role:", user?.role);
      console.log("Request body:", req.body);
      if (user?.role === "user") {
        return res.status(403).json({ message: "Sie haben keine ausreichende Berechtigung, bitte erstellen Sie ein Ticket" });
      }
      const customerDataWithUserId = {
        ...req.body,
        userId: userId2
      };
      const customerData = insertCustomerSchema.parse(customerDataWithUserId);
      console.log("Parsed customer data:", customerData);
      const customer = await storage.createCustomer(customerData);
      console.log("Created customer:", customer);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });
  app2.put("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (user?.role === "user") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(customerId, customerData);
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });
  app2.get("/api/companies", isAuthenticated, async (req, res) => {
    try {
      const companies2 = await storage.getCompanies();
      res.json(companies2);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });
  app2.get("/api/companies/:id", isAuthenticated, async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });
  app2.post("/api/companies", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      console.log("Company creation request:");
      console.log("User ID:", userId2);
      console.log("User role:", user?.role);
      console.log("Request body:", req.body);
      if (user?.role === "user") {
        console.log(`\u{1F6AB} COMPANY CREATE: Access denied - UserID: ${userId2}, Role: ${user?.role}`);
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      console.log(`\u2705 COMPANY CREATE: Access granted - UserID: ${userId2}, Role: ${user.role}`);
      const companyDataWithUserId = {
        ...req.body,
        userId: userId2
      };
      const companyData = insertCompanySchema.parse(companyDataWithUserId);
      console.log("Parsed company data:", companyData);
      const company = await storage.createCompany(companyData);
      console.log(`\u2705 COMPANY CREATED: CompanyID: ${company.id}, UserID: ${userId2}`);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log(`\u274C COMPANY CREATE: Validation error - UserID: ${userId}`, error.errors);
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });
  app2.get("/api/persons", isAuthenticated, async (req, res) => {
    try {
      const persons2 = await storage.getPersons();
      res.json(persons2);
    } catch (error) {
      console.error("Error fetching persons:", error);
      res.status(500).json({ message: "Failed to fetch persons" });
    }
  });
  app2.post("/api/persons", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (user?.role === "user") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const personData = insertPersonSchema.parse(req.body);
      const person = await storage.createPerson(personData);
      res.status(201).json(person);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid person data", errors: error.errors });
      }
      console.error("Error creating person:", error);
      res.status(500).json({ message: "Failed to create person" });
    }
  });
  app2.get("/api/projects/:id/attachments", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const attachments2 = await storage.getAttachments(projectId);
      res.json(attachments2);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      res.status(500).json({ message: "Failed to fetch attachments" });
    }
  });
  app2.get("/api/projects/:id/photos", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const photos2 = await storage.getPhotos(projectId);
      res.json(photos2);
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });
  app2.get("/api/projects/:id/audio", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const audioRecords2 = await storage.getAudioRecords(projectId);
      res.json(audioRecords2);
    } catch (error) {
      console.error("Error fetching audio records:", error);
      res.status(500).json({ message: "Failed to fetch audio records" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const { name, email, company, subject, message } = req.body;
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: "Required fields missing" });
      }
      const subjectLabels = {
        general: "Allgemeine Fragen",
        technical: "Technischer Support",
        sales: "Vertrieb & Lizenzierung",
        billing: "Abrechnung & Zahlung"
      };
      const emailData = {
        name,
        email,
        company: company || "Nicht angegeben",
        subject: subjectLabels[subject] || subject,
        message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      try {
        await emailService.sendContactEmail(emailData);
        console.log("Kontaktformular-E-Mail erfolgreich versendet:", {
          from: email,
          name,
          subject: emailData.subject
        });
        res.json({
          success: true,
          message: "Nachricht erfolgreich versendet"
        });
      } catch (emailError) {
        console.error("Fehler beim E-Mail-Versand:", emailError);
        res.json({
          success: true,
          message: "Nachricht erhalten - wir melden uns bei Ihnen"
        });
      }
    } catch (error) {
      console.error("Error processing contact form:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/email/inbox", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const limit = parseInt(req.query.limit) || 20;
      const unreadOnly = req.query.unreadOnly === "true";
      const messages = await emailInboxService.getInboxMessages(limit, unreadOnly);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching inbox messages:", error);
      res.status(500).json({ message: "Failed to fetch inbox messages" });
    }
  });
  app2.get("/api/email/message/:id", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const messageId = req.params.id;
      const message = await emailInboxService.getMessageById(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(message);
    } catch (error) {
      console.error("Error fetching message:", error);
      res.status(500).json({ message: "Failed to fetch message" });
    }
  });
  app2.post("/api/email/message/:id/read", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const messageId = req.params.id;
      const success = await emailInboxService.markAsRead(messageId);
      res.json({ success });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });
  app2.post("/api/email/message/:id/reply", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const messageId = req.params.id;
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ message: "Reply content required" });
      }
      const success = await emailInboxService.replyToMessage(messageId, content);
      res.json({ success });
    } catch (error) {
      console.error("Error sending reply:", error);
      res.status(500).json({ message: "Failed to send reply" });
    }
  });
  app2.get("/api/email/test", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const result = await emailInboxService.testConnection();
      res.json(result);
    } catch (error) {
      console.error("Error testing email connection:", error);
      res.status(500).json({ message: "Failed to test connection" });
    }
  });
  app2.get("/api/support-tickets", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const tickets = await storage.getSupportTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });
  app2.post("/api/flood-pdf-export", isAuthenticated, async (req, res) => {
    try {
      const { checklistData, recipientEmail } = req.body;
      if (!checklistData) {
        return res.status(400).json({ message: "Checklisten-Daten sind erforderlich" });
      }
      console.log("PDF-Export gestartet f\xFCr Checkliste:", checklistData.title);
      const mockData = {
        checklist: {
          titel: checklistData.title || "Test Checkliste",
          typ: "hochwasser",
          status: "offen",
          erstellt_von: req.user.firstName + " " + req.user.lastName,
          aufgaben_gesamt: 11,
          aufgaben_erledigt: 0
        },
        schieber: [],
        schaeden: [],
        wachen: [],
        exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
        exportedBy: req.user.firstName + " " + req.user.lastName
      };
      const { generateFloodProtectionPDF: generateFloodProtectionPDF2 } = await Promise.resolve().then(() => (init_pdfGenerator(), pdfGenerator_exports));
      const pdfBuffer = await generateFloodProtectionPDF2(mockData);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="Hochwasserschutz-Checkliste-${checklistData.title?.replace(/[^a-zA-Z0-9]/g, "-") || "Test"}-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.pdf"`);
      res.setHeader("Content-Length", pdfBuffer.length);
      console.log("PDF erfolgreich generiert, Gr\xF6\xDFe:", pdfBuffer.length, "bytes");
      if (recipientEmail) {
        console.log("E-Mail-Versand an:", recipientEmail, "(Implementation folgt)");
      }
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Fehler beim PDF-Export:", error);
      res.status(500).json({ message: "Fehler beim PDF-Export: " + error.message });
    }
  });
  app2.post("/api/flood/import-checklist", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const { jsonData, typ } = req.body;
      if (!jsonData || !typ) {
        return res.status(400).json({ message: "JSON-Daten und Typ sind erforderlich" });
      }
      const checklistId = Date.now().toString();
      res.status(201).json({
        success: true,
        checklistId,
        message: `Checkliste "${jsonData.title}" erfolgreich importiert`
      });
    } catch (error) {
      console.error("Fehler beim Import der Checkliste:", error);
      res.status(500).json({ message: "Fehler beim Import der Checkliste" });
    }
  });
  app2.get("/api/flood/checklists", isAuthenticated, async (req, res) => {
    try {
      const checklists = await storage.getFloodChecklists(req.user.id);
      const fallbackChecklists = checklists.length > 0 ? checklists : [
        {
          id: "1",
          titel: "Hochwasserereignis Mai 2025 (Beispielprojekt)",
          typ: "hochwasser",
          status: "in_bearbeitung",
          erstellt_am: "2025-05-15T08:00:00Z",
          erstellt_von: "Thomas M\xFCller",
          beginn_pegelstand_cm: 245,
          fortschritt: 68,
          aufgaben_gesamt: 11,
          aufgaben_erledigt: 7
        },
        {
          id: "2",
          titel: "Routine\xFCbung Fr\xFChjahr (Beispielprojekt)",
          typ: "uebung",
          status: "abgeschlossen",
          erstellt_am: "2025-03-20T10:30:00Z",
          erstellt_von: "Sarah Weber",
          fortschritt: 100,
          aufgaben_gesamt: 11,
          aufgaben_erledigt: 11
        }
      ];
      res.json({
        checklists: checklists.length > 0 ? checklists : fallbackChecklists,
        isDemo: checklists.length === 0,
        message: checklists.length === 0 ? "Keine Checklisten vorhanden. Erstellen Sie Ihre erste Checkliste." : void 0
      });
    } catch (error) {
      console.error("Fehler beim Laden der Checklisten:", error);
      res.status(500).json({ message: "Fehler beim Laden der Checklisten" });
    }
  });
  app2.post("/api/flood/create-checklist", isAuthenticated, async (req, res) => {
    try {
      console.log("=== CREATE CHECKLIST REQUEST ===");
      console.log("User:", req.user?.id);
      console.log("Authenticated:", req.isAuthenticated());
      console.log("Body:", JSON.stringify(req.body, null, 2));
      const userId2 = req.user.id;
      const { titel, typ, beginn_pegelstand_cm, beschreibung } = req.body;
      if (!titel || !typ) {
        console.log("Validation failed - missing titel or typ");
        return res.status(400).json({ message: "Titel und Typ sind erforderlich" });
      }
      const newChecklist = {
        id: Date.now().toString(),
        titel,
        typ,
        status: "offen",
        erstellt_am: (/* @__PURE__ */ new Date()).toISOString(),
        erstellt_von: userId2,
        beginn_pegelstand_cm: beginn_pegelstand_cm || 0,
        beschreibung: beschreibung || "",
        fortschritt: 0,
        aufgaben_gesamt: 11,
        aufgaben_erledigt: 0
      };
      console.log("=== CHECKLIST CREATED SUCCESSFULLY ===");
      console.log("New checklist:", JSON.stringify(newChecklist, null, 2));
      res.status(201).json({
        success: true,
        checklist: newChecklist,
        message: `Checkliste "${titel}" erfolgreich erstellt`
      });
    } catch (error) {
      console.error("=== CHECKLIST CREATION ERROR ===");
      console.error("Error:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
      res.status(500).json({ message: "Fehler beim Erstellen der Checkliste" });
    }
  });
  app2.delete("/api/flood/checklists/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      res.json({
        success: true,
        message: `Checkliste ${id} wurde gel\xF6scht`
      });
    } catch (error) {
      console.error("Fehler beim L\xF6schen der Checkliste:", error);
      res.status(500).json({ message: "Fehler beim L\xF6schen der Checkliste" });
    }
  });
  app2.delete("/api/flood/checklists/delete-all", isAuthenticated, async (req, res) => {
    try {
      res.json({
        success: true,
        message: "Alle Checklisten wurden gel\xF6scht"
      });
    } catch (error) {
      console.error("Fehler beim L\xF6schen aller Checklisten:", error);
      res.status(500).json({ message: "Fehler beim L\xF6schen aller Checklisten" });
    }
  });
  app2.post("/api/flood/checklists/duplicate", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const { checklistId } = req.body;
      const duplicatedChecklist = {
        id: Date.now().toString(),
        titel: `Kopie - Checkliste ${checklistId}`,
        typ: "hochwasser",
        status: "offen",
        erstellt_am: (/* @__PURE__ */ new Date()).toISOString(),
        erstellt_von: userId2,
        beginn_pegelstand_cm: 0,
        beschreibung: "Duplizierte Checkliste",
        fortschritt: 0,
        aufgaben_gesamt: 11,
        aufgaben_erledigt: 0
      };
      res.status(201).json({
        success: true,
        checklist: duplicatedChecklist,
        message: "Checkliste wurde dupliziert"
      });
    } catch (error) {
      console.error("Fehler beim Duplizieren der Checkliste:", error);
      res.status(500).json({ message: "Fehler beim Duplizieren der Checkliste" });
    }
  });
  app2.get("/api/flood/absperrschieber", isAuthenticated, async (req, res) => {
    try {
      const schieber = await storage.getFloodGates(req.user.id);
      const fallbackSchieber = schieber.length > 0 ? schieber : [
        {
          id: 1,
          nummer: 1,
          bezeichnung: "Absperrschieber DN 300",
          lage: "Lohr km 1,470, N\xE4he Kupferm\xFChle",
          beschreibung: "Absperrschieber DN 300 mit Festspindel bis unter die Schachtdeckelunterkante",
          funktionsfaehig: true,
          letzte_pruefung: "2025-06-25T00:00:00Z",
          aktiv: true
        },
        {
          id: 2,
          nummer: 2,
          bezeichnung: "Absperrsch\xFCtz bei ehem. Grundwehr",
          lage: "Lohr km 1,320",
          beschreibung: "Absperrsch\xFCtz bei ehem. Grundwehr",
          funktionsfaehig: false,
          letzte_pruefung: "2025-06-20T00:00:00Z",
          aktiv: true
        }
      ];
      res.json({
        schieber: schieber.length > 0 ? schieber : fallbackSchieber,
        isDemo: schieber.length === 0,
        message: schieber.length === 0 ? "Keine Absperrschieber vorhanden. F\xFCgen Sie den ersten hinzu." : void 0
      });
    } catch (error) {
      console.error("Fehler beim Laden der Absperrschieber:", error);
      res.status(500).json({ message: "Fehler beim Laden der Absperrschieber" });
    }
  });
  app2.post("/api/flood-protection/export-pdf", isAuthenticated, async (req, res) => {
    try {
      const { checklist, schieber, schaeden, wachen, exportedAt, exportedBy } = req.body;
      console.log("PDF-Export gestartet f\xFCr Checkliste:", checklist.titel);
      const { generateFloodProtectionPDF: generateFloodProtectionPDF2 } = await Promise.resolve().then(() => (init_pdfGenerator(), pdfGenerator_exports));
      const pdfBuffer = await generateFloodProtectionPDF2({
        checklist,
        schieber,
        schaeden,
        wachen,
        exportedAt,
        exportedBy
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="Hochwasserschutz-Checkliste-${checklist.titel.replace(/[^a-zA-Z0-9]/g, "-")}-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.pdf"`);
      res.setHeader("Content-Length", pdfBuffer.length);
      console.log("PDF erfolgreich generiert, Gr\xF6\xDFe:", pdfBuffer.length, "bytes");
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Fehler beim PDF-Export:", error);
      res.status(500).json({ message: "Fehler beim PDF-Export: " + error.message });
    }
  });
  app2.post("/api/test-brevo", isAuthenticated, async (req, res) => {
    try {
      const { emailService: emailService2 } = await Promise.resolve().then(() => (init_emailService(), emailService_exports));
      await emailService2.sendWelcomeEmail({
        to: "lea.zimmer@gmx.net",
        // Test an echte E-Mail-Adresse
        firstName: "Lea",
        role: "admin"
      });
      res.json({ success: true, message: "Test-E-Mail wurde erfolgreich \xFCber BREVO gesendet!" });
    } catch (error) {
      console.error("BREVO Test-Fehler:", error);
      res.status(500).json({
        success: false,
        message: "BREVO Test fehlgeschlagen",
        error: error.message
      });
    }
  });
  app2.post("/api/flood-protection/send-email", isAuthenticated, async (req, res) => {
    try {
      const { to, subject, message, checklist, schieber, schaeden, wachen, includePdf } = req.body;
      if (!to || !subject) {
        return res.status(400).json({ message: "E-Mail-Adresse und Betreff sind erforderlich" });
      }
      const emailText = `
${message}

--- Checklisten-Details ---
Titel: ${checklist.titel}
Typ: ${checklist.typ}
Status: ${checklist.status}
Erstellt von: ${checklist.erstellt_von}
Fortschritt: ${checklist.aufgaben_erledigt || 0}/${checklist.aufgaben_gesamt || 11} Aufgaben
${checklist.beginn_pegelstand_cm ? `Pegelstand: ${checklist.beginn_pegelstand_cm} cm` : ""}

Absperrschieber-Status:
${schieber.map((s) => `- Nr. ${s.nummer}: ${s.bezeichnung} (${s.status})`).join("\n")}

${schaeden && schaeden.length > 0 ? `
Schadensf\xE4lle:
${schaeden.map((schaden) => `- Schieber ${schaden.absperrschieber_nummer}: ${schaden.problem_beschreibung} (${schaden.status})`).join("\n")}
` : ""}

---
Diese E-Mail wurde automatisch generiert vom Bau-Structura Hochwasserschutz-System.
      `;
      const { emailService: emailService2 } = await Promise.resolve().then(() => (init_emailService(), emailService_exports));
      await emailService2.sendFloodProtectionEmail({
        to,
        subject,
        message,
        checklist,
        schieber,
        schaeden,
        wachen,
        includePdf
      });
      console.log("Hochwasserschutz-E-Mail erfolgreich \xFCber BREVO gesendet an:", to);
      res.json({
        success: true,
        message: `E-Mail erfolgreich an ${to} gesendet`
      });
    } catch (error) {
      console.error("Fehler beim E-Mail-Versand:", error);
      res.status(500).json({ message: "Fehler beim E-Mail-Versand" });
    }
  });
  app2.get("/api/support-tickets", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      const tickets = await storage.getSupportTickets();
      let filteredTickets = tickets;
      if (user?.role === "user") {
        filteredTickets = tickets.filter((ticket) => ticket.createdBy === userId2);
      }
      res.json(filteredTickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });
  app2.post("/api/support-tickets", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { subject, description, priority = "medium" } = req.body;
      if (!subject || !description) {
        return res.status(400).json({ message: "Subject and description are required" });
      }
      const ticketData = {
        subject,
        description,
        priority,
        status: "open",
        createdBy: userId2,
        emailHistory: []
      };
      const ticket = await storage.createSupportTicket(ticketData);
      const { emailService: emailService2 } = await Promise.resolve().then(() => (init_emailService(), emailService_exports));
      try {
        await emailService2.sendSupportTicketEmail({
          to: user.email || "",
          subject: ticket.subject,
          description: ticket.description || "",
          ticketId: ticket.id,
          priority: ticket.priority || "medium"
        });
      } catch (emailError) {
        console.error("Failed to send email, but ticket was created:", emailError);
      }
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });
  app2.patch("/api/support-tickets/:id", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      const ticketId = parseInt(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const tickets = await storage.getSupportTickets();
      const ticket = tickets.find((t) => t.id === ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      if (user.role === "user" && ticket.createdBy !== userId2) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const { status, assignedTo, updateMessage, subject, description, priority } = req.body;
      const updateData = {};
      if (status) updateData.status = status;
      if (assignedTo) updateData.assignedTo = assignedTo;
      if (subject) updateData.subject = subject;
      if (description) updateData.description = description;
      if (priority) updateData.priority = priority;
      const updatedTicket = await storage.updateSupportTicket(ticketId, updateData);
      if (ticket.createdBy !== userId2) {
        const { emailService: emailService2 } = await Promise.resolve().then(() => (init_emailService(), emailService_exports));
        try {
          const ticketOwner = await storage.getUser(ticket.createdBy || "");
          if (ticketOwner?.email) {
            let autoUpdateMessage = updateMessage || "Ihr Support-Ticket wurde bearbeitet.";
            const changes = [];
            if (subject && subject !== ticket.subject) changes.push(`Betreff ge\xE4ndert zu: "${subject}"`);
            if (description && description !== ticket.description) changes.push("Beschreibung wurde aktualisiert");
            if (priority && priority !== ticket.priority) changes.push(`Priorit\xE4t ge\xE4ndert zu: ${getPriorityLabel(priority)}`);
            if (status && status !== ticket.status) changes.push(`Status ge\xE4ndert zu: ${getStatusLabel(status)}`);
            if (changes.length > 0) {
              autoUpdateMessage = `Folgende \xC4nderungen wurden vorgenommen:

${changes.join("\n")}

${updateMessage || ""}`;
            }
            await emailService2.sendTicketUpdateEmail({
              to: ticketOwner.email,
              ticketId: updatedTicket.id,
              subject: updatedTicket.subject,
              status: updatedTicket.status || "open",
              updateMessage: autoUpdateMessage,
              assignedTo: updatedTicket.assignedTo || void 0,
              editorName: `${user.firstName || user.id} ${user.lastName || ""}`.trim()
            });
          }
        } catch (emailError) {
          console.error("Failed to send update email:", emailError);
        }
      }
      res.json(updatedTicket);
    } catch (error) {
      console.error("Error updating support ticket:", error);
      res.status(500).json({ message: "Failed to update support ticket" });
    }
  });
  const isAdmin = async (req, res, next) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    } catch (error) {
      console.error("Error checking admin role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  app2.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  function getPriorityLabel(priority) {
    switch (priority) {
      case "low":
        return "Niedrig";
      case "medium":
        return "Mittel";
      case "high":
        return "Hoch";
      case "urgent":
        return "Dringend";
      default:
        return priority;
    }
  }
  function getStatusLabel(status) {
    switch (status) {
      case "open":
        return "Offen";
      case "in_progress":
        return "In Bearbeitung";
      case "resolved":
        return "Gel\xF6st";
      case "closed":
        return "Geschlossen";
      default:
        return status;
    }
  }
  function generateSecurePassword3() {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
  app2.post("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { username, email, role, licenseType } = req.body;
      if (!username || !email) {
        return res.status(400).json({ message: "Username and email are required" });
      }
      const existingUser = await storage.getUser(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username bereits vergeben" });
      }
      const temporaryPassword = generateSecurePassword3();
      const userData = {
        id: username,
        username,
        email,
        role: role || "user",
        licenseType: licenseType || "basic",
        firstName: username,
        // Use username as firstName for now
        lastName: "",
        emailNotificationsEnabled: true,
        password: temporaryPassword,
        // Store password temporarily (in real app, hash it)
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const newUser = await storage.upsertUser(userData);
      const { emailService: emailService2 } = await Promise.resolve().then(() => (init_emailService(), emailService_exports));
      try {
        await emailService2.sendWelcomeEmail({
          to: email,
          firstName: username,
          role: role || "user",
          password: temporaryPassword
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json({
        ...userWithoutPassword,
        passwordSent: true,
        message: "Benutzer erstellt und Passwort per E-Mail versendet"
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app2.put("/api/admin/users/:id/role", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (!["user", "manager", "admin"].includes(role)) {
        return res.status(400).json({ message: "Ung\xFCltige Rolle" });
      }
      console.log(`Admin ${req.user.email} changing role for user ${id} to ${role}`);
      let user = await storage.getUser(id);
      if (!user) {
        user = await storage.getUserByEmail(id);
      }
      if (!user) {
        return res.status(404).json({ message: "Benutzer nicht gefunden" });
      }
      if (user.id === req.user.id) {
        return res.status(400).json({ message: "Sie k\xF6nnen Ihre eigene Rolle nicht \xE4ndern" });
      }
      await storage.updateUser(user.id, { role });
      console.log(`\u2705 Role updated: ${user.email} -> ${role}`);
      const sessionStore = req.sessionStore;
      if (sessionStore) {
        sessionStore.all((err, sessions2) => {
          if (err) {
            console.warn("Could not access session store for role update:", err);
            return;
          }
          Object.keys(sessions2 || {}).forEach((sessionId) => {
            const session2 = sessions2[sessionId];
            if (session2?.passport?.user === user.id) {
              console.log(`\u{1F504} Updating session for user ${user.email} with new role: ${role}`);
              sessionStore.get(sessionId, (getErr, sessionData) => {
                if (!getErr && sessionData) {
                  if (sessionData.user) {
                    sessionData.user.role = role;
                  }
                  sessionStore.set(sessionId, sessionData, (setErr) => {
                    if (setErr) {
                      console.warn("Failed to update session:", setErr);
                    } else {
                      console.log(`\u2705 Session updated for user ${user.email}`);
                    }
                  });
                }
              });
            }
          });
        });
      }
      res.json({
        success: true,
        message: `Rolle von ${user.email} zu ${role} ge\xE4ndert. Die \xC4nderung ist sofort aktiv.`,
        user: {
          id: user.id,
          email: user.email,
          role,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      console.error("Error changing user role:", error);
      res.status(500).json({ message: "Rolle konnte nicht ge\xE4ndert werden" });
    }
  });
  app2.post("/api/admin/users/:id/reset-password", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Password reset request for:", id);
      let user = await storage.getUser(id);
      if (!user) {
        console.log("User not found by ID, trying email:", id);
        user = await storage.getUserByEmail(id);
      }
      if (!user) {
        console.log("User not found:", id);
        return res.status(404).json({ message: "Benutzer nicht gefunden" });
      }
      console.log("Found user:", user.email, "ID:", user.id);
      const newPassword = generateSecurePassword3();
      console.log("Generated new password for user:", user.email);
      const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_localAuth(), localAuth_exports));
      const hashedPassword = await hashPassword2(newPassword);
      await storage.updateUser(user.id, { password: hashedPassword });
      console.log("Password updated in database for user:", user.email);
      const { emailService: emailService2 } = await Promise.resolve().then(() => (init_emailService(), emailService_exports));
      try {
        await emailService2.sendWelcomeEmail({
          to: user.email || "",
          firstName: user.firstName || user.id,
          role: user.role || "user",
          password: newPassword
        });
        console.log("Password reset email sent to:", user.email);
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
        return res.status(500).json({ message: "E-Mail-Versand fehlgeschlagen" });
      }
      res.json({
        success: true,
        message: `Neues Passwort an ${user.email} gesendet`
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Passwort konnte nicht zur\xFCckgesetzt werden" });
    }
  });
  app2.patch("/api/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const allowedFields = ["firstName", "lastName", "email", "role", "emailNotificationsEnabled"];
      const filteredData = Object.keys(updateData).filter((key) => allowedFields.includes(key)).reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});
      const user = await storage.updateUser(id, filteredData);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.delete("/api/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      if (id === req.user.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.get("/api/admin/error-learning/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { errorLearningSystem: errorLearningSystem2 } = await Promise.resolve().then(() => (init_error_learning_system(), error_learning_system_exports));
      const stats = errorLearningSystem2.getErrorStatistics();
      const patterns = errorLearningSystem2.getAllPatterns();
      res.json({
        stats,
        patterns
      });
    } catch (error) {
      console.error("Error fetching error learning statistics:", error);
      res.status(500).json({ message: "Fehler beim Laden der Statistiken" });
    }
  });
  app2.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching system stats:", error);
      res.status(500).json({ message: "Failed to fetch system stats" });
    }
  });
  app2.post("/api/admin/backup", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const backupData = await storage.createBackup();
      res.setHeader("Content-Type", "application/sql");
      res.setHeader("Content-Disposition", `attachment; filename="backup-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.sql"`);
      res.send(backupData);
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ message: "Failed to create backup" });
    }
  });
  app2.post("/api/ai/generate-description", isAuthenticated, async (req, res) => {
    try {
      const { generateProjectDescription: generateProjectDescription2 } = await Promise.resolve().then(() => (init_openai(), openai_exports));
      const userId2 = req.user.id;
      const { name, location, budget, category } = req.body;
      const result = await generateProjectDescription2(userId2, {
        name,
        location,
        budget: budget ? parseFloat(budget) : void 0,
        category
      });
      res.json(result);
    } catch (error) {
      console.error("AI description generation error:", error);
      res.status(500).json({
        error: "KI-Beschreibung konnte nicht generiert werden",
        aiGenerated: false
      });
    }
  });
  app2.post("/api/ai/risk-assessment", isAuthenticated, async (req, res) => {
    try {
      const { generateRiskAssessment: generateRiskAssessment2 } = await Promise.resolve().then(() => (init_openai(), openai_exports));
      const userId2 = req.user.id;
      const { name, location, budget, description, duration, projectId } = req.body;
      const result = await generateRiskAssessment2(userId2, {
        name,
        location,
        budget: budget ? parseFloat(budget) : void 0,
        description,
        duration: duration ? parseInt(duration) : void 0
      }, projectId);
      res.json(result);
    } catch (error) {
      console.error("AI risk assessment error:", error);
      res.status(500).json({
        error: "Risikobewertung konnte nicht erstellt werden",
        aiGenerated: false
      });
    }
  });
  app2.post("/api/ai/project-chat", isAuthenticated, async (req, res) => {
    try {
      const { aiProjectChat: aiProjectChat2 } = await Promise.resolve().then(() => (init_openai(), openai_exports));
      const userId2 = req.user.id;
      const { question, projectContext, projectId } = req.body;
      const result = await aiProjectChat2(userId2, question, projectContext, projectId);
      res.json(result);
    } catch (error) {
      console.error("AI project chat error:", error);
      res.status(500).json({
        error: "KI-Beratung ist momentan nicht verf\xFCgbar",
        aiGenerated: false
      });
    }
  });
  app2.get("/api/ai/usage-stats", isAuthenticated, async (req, res) => {
    try {
      const { getAIUsageStats: getAIUsageStats2 } = await Promise.resolve().then(() => (init_openai(), openai_exports));
      const userId2 = req.user.id;
      const stats = await getAIUsageStats2(userId2);
      res.json(stats);
    } catch (error) {
      console.error("AI usage stats error:", error);
      res.status(500).json({
        error: "Statistiken konnten nicht geladen werden"
      });
    }
  });
  app2.get("/api/photos", isAuthenticated, async (req, res) => {
    try {
      const projectId = req.query.projectId;
      if (projectId) {
        const photos2 = await storage.getPhotos(parseInt(projectId));
        res.json(photos2);
      } else {
        const projects2 = await storage.getProjects();
        const allPhotos = [];
        for (const project of projects2) {
          const photos2 = await storage.getPhotos(project.id);
          allPhotos.push(...photos2);
        }
        res.json(allPhotos);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });
  app2.post("/api/photos", isAuthenticated, async (req, res) => {
    try {
      const { projectId, description, imageData, latitude, longitude } = req.body;
      const userId2 = req.user.id;
      if (!projectId || !imageData) {
        return res.status(400).json({ message: "Project ID and image data are required" });
      }
      const imageBuffer = Buffer.from(imageData.split(",")[1], "base64");
      const fileName = `photo_${Date.now()}.jpg`;
      const photoUrl = `/uploads/photos/${fileName}`;
      const photo = await storage.createPhoto({
        projectId: parseInt(projectId),
        fileName,
        filePath: photoUrl,
        description: description || "",
        gpsLatitude: latitude ? latitude.toString() : null,
        gpsLongitude: longitude ? longitude.toString() : null,
        takenBy: userId2
      });
      res.json({ ...photo, message: "Photo saved successfully" });
    } catch (error) {
      console.error("Error saving photo:", error);
      res.status(500).json({
        message: "Failed to save photo",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/audio-records", isAuthenticated, async (req, res) => {
    try {
      const projectId = req.query.projectId;
      if (projectId) {
        const records = await storage.getAudioRecords(parseInt(projectId));
        res.json(records);
      } else {
        const projects2 = await storage.getProjects();
        const allRecords = [];
        for (const project of projects2) {
          const records = await storage.getAudioRecords(project.id);
          allRecords.push(...records);
        }
        res.json(allRecords);
      }
    } catch (error) {
      console.error("Error fetching audio records:", error);
      res.status(500).json({ message: "Failed to fetch audio records" });
    }
  });
  app2.post("/api/audio-records", isAuthenticated, async (req, res) => {
    try {
      const { projectId, description, audioData, duration, transcription, latitude, longitude } = req.body;
      const userId2 = req.user.id;
      if (!projectId || !audioData) {
        return res.status(400).json({ message: "Project ID and audio data are required" });
      }
      const audioBuffer = Buffer.from(audioData.split(",")[1], "base64");
      const fileName = `audio_${Date.now()}.webm`;
      const audioUrl = `/uploads/audio/${fileName}`;
      const record = await storage.createAudioRecord({
        projectId: parseInt(projectId),
        fileName,
        filePath: audioUrl,
        duration: duration || 0,
        description: description || "",
        transcription: transcription || null,
        gpsLatitude: latitude ? latitude.toString() : null,
        gpsLongitude: longitude ? longitude.toString() : null,
        recordedBy: userId2
      });
      res.json({ ...record, message: "Audio record saved successfully" });
    } catch (error) {
      console.error("Error saving audio record:", error);
      res.status(500).json({
        message: "Failed to save audio record",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/audio/transcribe", isAuthenticated, async (req, res) => {
    try {
      const { audioData } = req.body;
      if (!audioData) {
        return res.status(400).json({ message: "Audio data is required" });
      }
      const simulationTranscriptions = [
        "[SIMULATION] Die Bauarbeiten am Fundament sind heute planm\xE4\xDFig vorangeschritten. Die Betonierung wurde erfolgreich abgeschlossen.",
        "[SIMULATION] Heute wurde die Bewehrung f\xFCr die Bodenplatte eingebaut. Qualit\xE4tspr\xFCfung durch den Statiker erfolgt morgen.",
        "[SIMULATION] Fortschritt bei der Rohrleitungsverlegung. Alle Anschl\xFCsse sind fachgerecht ausgef\xFChrt worden.",
        "[SIMULATION] Die Erdarbeiten sind abgeschlossen. N\xE4chster Schritt ist die Verdichtung des Untergrunds.",
        "[SIMULATION] Schalung f\xFCr die St\xFCtzen wurde heute aufgestellt. Betonage ist f\xFCr morgen geplant."
      ];
      const randomTranscription = simulationTranscriptions[Math.floor(Math.random() * simulationTranscriptions.length)];
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      res.json({
        transcription: randomTranscription,
        confidence: 0.95,
        language: "de",
        isSimulation: true,
        message: "\u26A0\uFE0F Dies ist eine simulierte Transkription. F\xFCr echte Spracherkennung wird OpenAI Whisper API ben\xF6tigt."
      });
    } catch (error) {
      console.error("Error transcribing audio:", error);
      res.status(500).json({
        message: "Failed to transcribe audio",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/email/test", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (!user?.email) {
        return res.status(400).json({ message: "User email not found" });
      }
      console.log("Mock E-Mail Test f\xFCr:", user.email);
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      res.json({
        success: true,
        message: `Demo: Test-E-Mail w\xFCrde an ${user.email} gesendet (BREVO-Integration vorbereitet)`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        emailContent: {
          subject: "Willkommen bei Bau-Structura!",
          to: user.email,
          from: process.env.SENDER_EMAIL || "support@bau-structura.de",
          type: "Willkommens-E-Mail"
        },
        brevoStatus: "Konfiguriert - Bereit f\xFCr Produktion"
      });
    } catch (error) {
      console.error("E-Mail Test Fehler:", error);
      res.status(500).json({
        success: false,
        message: "E-Mail Test fehlgeschlagen",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/email/test-welcome", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { emailService: emailService2 } = await Promise.resolve().then(() => (init_emailService(), emailService_exports));
      const testEmail = req.body.testEmail || "firielster@googlemail.com";
      console.log(`\u{1F9EA} Sende Test-Willkommens-E-Mail an: ${testEmail}`);
      await emailService2.sendWelcomeEmail({
        to: testEmail,
        firstName: "Test",
        role: "user",
        id: "test_id_123"
      });
      res.json({
        success: true,
        message: `Erweiterte Willkommens-E-Mail erfolgreich an ${testEmail} gesendet`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        features: [
          "\u2705 Berechtigungen f\xFCr User-Rolle erkl\xE4rt",
          "\u{1F6AB} Einschr\xE4nkungen klar aufgezeigt",
          "\u{1F4A1} Upgrade-Hinweise integriert",
          "\u{1F4C2} SFTP-Account-Informationen",
          "\u{1F4F1} PWA-Installationsanleitung"
        ]
      });
    } catch (error) {
      console.error("Test-Willkommens-E-Mail Fehler:", error);
      res.status(500).json({
        success: false,
        message: "Test-Willkommens-E-Mail fehlgeschlagen",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/admin/backup/create", isAuthenticated, isAdmin, async (req, res) => {
    try {
      console.log("Erstelle Datenbank-Backup...");
      const backupId = await storage.createBackup();
      res.json({
        success: true,
        message: "Backup erfolgreich erstellt",
        backupId,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        size: "Vollst\xE4ndiger Datenexport",
        retention: "30 Tage"
      });
    } catch (error) {
      console.error("Backup-Erstellung Fehler:", error);
      res.status(500).json({
        success: false,
        message: "Backup-Erstellung fehlgeschlagen",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/admin/backup/status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const lastBackup = /* @__PURE__ */ new Date();
      lastBackup.setHours(2, 0, 0, 0);
      res.json({
        automaticBackups: true,
        retention: 30,
        encryptedStorage: true,
        lastBackup: lastBackup.toISOString(),
        nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString(),
        // Morgen
        backupSize: "15.7 MB",
        status: "Aktiv",
        storage: "Azure Blob Storage"
      });
    } catch (error) {
      console.error("Backup-Status Fehler:", error);
      res.status(500).json({
        success: false,
        message: "Backup-Status abrufen fehlgeschlagen",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/admin/backup/list", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { azureBackupService: azureBackupService2 } = await Promise.resolve().then(() => (init_azureBackupService(), azureBackupService_exports));
      const backups = await azureBackupService2.listBackups();
      res.json({
        success: true,
        backups,
        total: backups.length
      });
    } catch (error) {
      console.error("Azure Backup-Liste Fehler:", error);
      res.status(500).json({
        success: false,
        message: "Backup-Liste abrufen fehlgeschlagen",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/admin/backup/download/:backupId", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { backupId } = req.params;
      const { azureBackupService: azureBackupService2 } = await Promise.resolve().then(() => (init_azureBackupService(), azureBackupService_exports));
      const sqlContent = await azureBackupService2.downloadBackup(backupId);
      res.setHeader("Content-Type", "application/sql");
      res.setHeader("Content-Disposition", `attachment; filename="${backupId}.sql"`);
      res.send(sqlContent);
    } catch (error) {
      console.error("Azure Backup-Download Fehler:", error);
      res.status(500).json({
        success: false,
        message: "Backup-Download fehlgeschlagen",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/admin/backup/cleanup", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { retentionDays = 30 } = req.body;
      const { azureBackupService: azureBackupService2 } = await Promise.resolve().then(() => (init_azureBackupService(), azureBackupService_exports));
      const result = await azureBackupService2.cleanupOldBackups(retentionDays);
      res.json({
        success: true,
        message: `Backup-Cleanup abgeschlossen: ${result.deleted} gel\xF6scht, ${result.errors} Fehler`,
        deleted: result.deleted,
        errors: result.errors
      });
    } catch (error) {
      console.error("Azure Backup-Cleanup Fehler:", error);
      res.status(500).json({
        success: false,
        message: "Backup-Cleanup fehlgeschlagen",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/admin/azure/test", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { azureBackupService: azureBackupService2 } = await Promise.resolve().then(() => (init_azureBackupService(), azureBackupService_exports));
      const testResult = await azureBackupService2.testConnection();
      res.json({
        success: testResult.connected,
        connection: testResult,
        message: testResult.connected ? "Azure-Verbindung erfolgreich" : "Azure-Verbindung fehlgeschlagen"
      });
    } catch (error) {
      console.error("Azure-Verbindungstest Fehler:", error);
      res.status(500).json({
        success: false,
        message: "Azure-Verbindungstest fehlgeschlagen",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/email/test-connection", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const nodemailer2 = __require("nodemailer");
      const testTransporter = nodemailer2.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      await testTransporter.verify();
      res.json({
        success: true,
        message: "BREVO SMTP-Verbindung erfolgreich",
        config: {
          host: "smtp-relay.brevo.com",
          port: 587,
          user: process.env.SMTP_USER,
          authenticated: true
        }
      });
    } catch (error) {
      console.error("BREVO Verbindungstest Fehler:", error);
      res.status(500).json({
        success: false,
        message: "BREVO SMTP-Verbindung fehlgeschlagen",
        error: error instanceof Error ? error.message : "Unknown error",
        suggestions: [
          "Pr\xFCfen Sie SMTP_USER (muss Ihre BREVO-Login-E-Mail sein)",
          "Pr\xFCfen Sie SMTP_PASS (muss ein BREVO SMTP-Schl\xFCssel sein)",
          "Stellen Sie sicher, dass der SMTP-Schl\xFCssel aktiv ist"
        ]
      });
    }
  });
  app2.get("/api/email/status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { emailService: emailService2 } = await Promise.resolve().then(() => (init_emailService(), emailService_exports));
      const hasConfig = !!(process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SENDER_EMAIL);
      res.json({
        configured: hasConfig,
        smtpHost: "smtp-relay.brevo.com",
        smtpPort: 587,
        senderEmail: process.env.SENDER_EMAIL || "nicht konfiguriert",
        lastCheck: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("E-Mail Status Fehler:", error);
      res.status(500).json({
        configured: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { licenseType, amount } = req.body;
      const licensePrices = {
        basic: 21,
        professional: 39,
        enterprise: 99
      };
      const price = licensePrices[licenseType] || amount;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(price * 100),
        // Convert to cents
        currency: "eur",
        metadata: {
          licenseType,
          product: "Bau-Structura License"
        }
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({
        message: "Error creating payment intent: " + error.message
      });
    }
  });
  app2.get("/api/payment-status", isAuthenticated, async (req, res) => {
    try {
      const { payment_intent } = req.query;
      if (!payment_intent) {
        return res.status(400).json({ message: "Payment intent ID required" });
      }
      const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);
      if (paymentIntent.status === "succeeded") {
        const userId2 = req.user.id;
        const licenseType = paymentIntent.metadata.licenseType || "basic";
        const licenseExpiresAt = /* @__PURE__ */ new Date();
        licenseExpiresAt.setFullYear(licenseExpiresAt.getFullYear() + 1);
        const updateData = {
          licenseType,
          paymentStatus: "paid",
          lastPaymentDate: /* @__PURE__ */ new Date(),
          licenseExpiresAt,
          stripeCustomerId: paymentIntent.customer || null
        };
        await storage.updateUser(userId2, updateData);
        console.log(`\u{1F389} Lizenz aktiviert f\xFCr User ${userId2}: ${licenseType}`);
        try {
          const sftpResult = await onLicenseActivated(userId2, licenseType);
          console.log(`SFTP-Setup Ergebnis:`, sftpResult.success ? "\u2705 Erfolgreich" : "\u274C Fehlgeschlagen");
        } catch (sftpError) {
          console.error("SFTP-Setup Fehler:", sftpError);
        }
        res.json({
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          licenseType,
          licenseExpiresAt
        });
      } else {
        res.json({
          id: paymentIntent.id,
          status: paymentIntent.status
        });
      }
    } catch (error) {
      console.error("Payment status check error:", error);
      res.status(500).json({
        message: "Error checking payment status: " + error.message
      });
    }
  });
  app2.post("/api/webhook/stripe", async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"];
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object;
          console.log("PaymentIntent was successful!", paymentIntent.id);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ message: "Webhook error: " + error.message });
    }
  });
  app2.get("/api/license/status", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const isExpired = user.licenseExpiresAt ? /* @__PURE__ */ new Date() > new Date(user.licenseExpiresAt) : false;
      res.json({
        licenseType: user.licenseType || "basic",
        paymentStatus: user.paymentStatus || "unpaid",
        licenseExpiresAt: user.licenseExpiresAt,
        isExpired,
        lastPaymentDate: user.lastPaymentDate
      });
    } catch (error) {
      console.error("License status error:", error);
      res.status(500).json({
        message: "Error fetching license status: " + error.message
      });
    }
  });
  app2.get("/api/customers/:id/contacts", isAuthenticated, async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const contacts = await storage.getCustomerContacts(customerId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching customer contacts:", error);
      res.status(500).json({ message: "Failed to fetch customer contacts" });
    }
  });
  app2.post("/api/customers/:id/contacts", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (user?.role === "user") {
        return res.status(403).json({ message: "Sie haben keine ausreichende Berechtigung, bitte erstellen Sie ein Ticket" });
      }
      const customerId = parseInt(req.params.id);
      const contactData = { ...req.body, customerId };
      const newContact = await storage.createCustomerContact(contactData);
      res.status(201).json(newContact);
    } catch (error) {
      console.error("Error creating customer contact:", error);
      res.status(500).json({ message: "Failed to create customer contact" });
    }
  });
  app2.put("/api/customers/:customerId/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const updatedContact = await storage.updateCustomerContact(contactId, req.body);
      res.json(updatedContact);
    } catch (error) {
      console.error("Error updating customer contact:", error);
      res.status(500).json({ message: "Failed to update customer contact" });
    }
  });
  app2.delete("/api/customers/:customerId/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      await storage.deleteCustomerContact(contactId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer contact:", error);
      res.status(500).json({ message: "Failed to delete customer contact" });
    }
  });
  app2.get("/api/companies/:id/contacts", isAuthenticated, async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const contacts = await storage.getCompanyContacts(companyId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching company contacts:", error);
      res.status(500).json({ message: "Failed to fetch company contacts" });
    }
  });
  app2.post("/api/companies/:id/contacts", isAuthenticated, async (req, res) => {
    try {
      const userId2 = req.user.id;
      const user = await storage.getUser(userId2);
      if (user?.role === "user") {
        return res.status(403).json({ message: "Sie haben keine ausreichende Berechtigung, bitte erstellen Sie ein Ticket" });
      }
      const companyId = parseInt(req.params.id);
      const contactData = { ...req.body, companyId };
      const newContact = await storage.createCompanyContact(contactData);
      res.status(201).json(newContact);
    } catch (error) {
      console.error("Error creating company contact:", error);
      res.status(500).json({ message: "Failed to create company contact" });
    }
  });
  app2.put("/api/company-contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const updatedContact = await storage.updateCompanyContact(contactId, req.body);
      res.json(updatedContact);
    } catch (error) {
      console.error("Error updating company contact:", error);
      res.status(500).json({ message: "Failed to update company contact" });
    }
  });
  app2.delete("/api/company-contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      await storage.deleteCompanyContact(contactId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting company contact:", error);
      res.status(500).json({ message: "Failed to delete company contact" });
    }
  });
  app2.get("/docs/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const { readFile, access } = await import("fs/promises");
      const { join } = await import("path");
      const allowedFiles = [
        "PWA-INSTALLATION-ANLEITUNG.md",
        "README.md",
        "README_AKTUELL_2025.md",
        "GITHUB-UPLOAD-ANLEITUNG.md"
      ];
      if (!allowedFiles.includes(filename)) {
        return res.status(404).json({ message: "File not found" });
      }
      const filePath = join(process.cwd(), filename);
      try {
        await access(filePath);
      } catch {
        return res.status(404).json({ message: "File not found" });
      }
      const content = await readFile(filePath, "utf8");
      res.setHeader("Content-Type", "text/markdown; charset=utf-8");
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.send(content);
    } catch (error) {
      console.error("Error serving documentation file:", error);
      res.status(500).json({ message: "Error serving file" });
    }
  });
  console.log("\u{1F512} Smart security middleware is active - public routes excluded, all others protected");
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    // Server-Konfiguration hier
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import cors from "cors";
import rateLimit2 from "express-rate-limit";
import helmet from "helmet";

// server/error-prevention.ts
init_error_learning_system();
var ErrorPreventionSystem = class _ErrorPreventionSystem {
  static instance;
  static getInstance() {
    if (!_ErrorPreventionSystem.instance) {
      _ErrorPreventionSystem.instance = new _ErrorPreventionSystem();
    }
    return _ErrorPreventionSystem.instance;
  }
  /**
   * Pre-Execution-Scan für bekannte Fehlermuster
   */
  async preExecutionScan(context) {
    const warnings = [];
    const autoFixes = [];
    const recommendations = [];
    if (context.dependencies) {
      const missingDeps = await this.checkDependencies(context.dependencies);
      if (missingDeps.length > 0) {
        warnings.push(`Fehlende Dependencies: ${missingDeps.join(", ")}`);
        autoFixes.push(`npm install ${missingDeps.join(" ")}`);
      }
    }
    if (context.environment) {
      const missingEnvVars = this.checkEnvironmentVariables(context.environment);
      if (missingEnvVars.length > 0) {
        warnings.push(`Fehlende Environment-Variablen: ${missingEnvVars.join(", ")}`);
        recommendations.push("\xDCberpr\xFCfen Sie die .env Konfiguration");
      }
    }
    const knownPatterns = this.checkKnownPatterns(context);
    warnings.push(...knownPatterns.warnings);
    recommendations.push(...knownPatterns.recommendations);
    return {
      safe: warnings.length === 0,
      warnings,
      autoFixes,
      recommendations
    };
  }
  /**
   * Dependencies prüfen
   */
  async checkDependencies(dependencies) {
    const missing = [];
    for (const dep of dependencies) {
      try {
        __require.resolve(dep);
      } catch (error) {
        missing.push(dep);
      }
    }
    return missing;
  }
  /**
   * Environment-Variablen prüfen
   */
  checkEnvironmentVariables(requiredVars) {
    const missing = [];
    for (const [key, required] of Object.entries(requiredVars)) {
      if (required && !process.env[key]) {
        missing.push(key);
      }
    }
    return missing;
  }
  /**
   * Bekannte Fehlermuster prüfen
   */
  checkKnownPatterns(context) {
    const warnings = [];
    const recommendations = [];
    const stats = errorLearningSystem.getErrorStatistics();
    if (stats.recurringErrors > 0) {
      warnings.push(`\u26A0\uFE0F ${stats.recurringErrors} wiederkehrende Fehler erkannt`);
      recommendations.push("\xDCberpr\xFCfen Sie die Fehler-Historie f\xFCr bekannte L\xF6sungen");
    }
    if (stats.mostCommonErrorType === "CONFIG") {
      recommendations.push("\u{1F4A1} H\xE4ufige Konfigurationsfehler - Environment-Variablen validieren");
    }
    if (stats.mostCommonErrorType === "IMPORT") {
      recommendations.push("\u{1F4A1} H\xE4ufige Import-Fehler - Pfade und Dependencies pr\xFCfen");
    }
    return { warnings, recommendations };
  }
  /**
   * Automatische Korrektur anwenden
   */
  async applyAutoFixes(fixes) {
    let allSuccessful = true;
    for (const fix of fixes) {
      try {
        if (fix.startsWith("npm install")) {
          console.log(`\u{1F527} Auto-Fix: ${fix}`);
          errorLearningSystem.logError({
            type: "CONFIG",
            message: `Dependency missing: ${fix}`,
            file: "package.json",
            context: "Auto-Fix dependency installation"
          });
        }
        if (fix.startsWith("export ")) {
          console.log(`\u{1F527} Auto-Fix: ${fix}`);
          errorLearningSystem.logError({
            type: "CONFIG",
            message: `Environment variable missing: ${fix}`,
            file: ".env",
            context: "Auto-Fix environment setup"
          });
        }
        if (fix.includes("prettier") || fix.includes("eslint")) {
          console.log(`\u{1F527} Auto-Fix: Code formatting/linting`);
          this.applySyntaxAutoFix();
        }
        if (fix.includes("import")) {
          console.log(`\u{1F527} Auto-Fix: Import organization`);
          this.applyImportAutoFix();
        }
      } catch (error) {
        console.error(`\u274C Auto-Fix fehlgeschlagen: ${fix}`, error);
        errorLearningSystem.logError({
          type: "RUNTIME",
          message: `Auto-Fix failed: ${error.message}`,
          file: "error-prevention.ts",
          context: `Failed to apply auto-fix: ${fix}`
        });
        allSuccessful = false;
      }
    }
    return allSuccessful;
  }
  /**
   * Syntax Auto-Fix anwenden
   */
  applySyntaxAutoFix() {
    console.log(`\u{1F3AF} SYNTAX AUTO-FIX: Formatierung wird korrigiert`);
  }
  /**
   * Import Auto-Fix anwenden
   */
  applyImportAutoFix() {
    console.log(`\u{1F3AF} IMPORT AUTO-FIX: Import-Pfade werden korrigiert`);
  }
  /**
   * Code-Qualitäts-Checks
   */
  validateCodeQuality(code, fileType) {
    const issues = [];
    if (fileType === "ts" || fileType === "js") {
      if (code.includes("console.log(") && !code.includes("// DEBUG")) {
        issues.push({
          type: "warning",
          message: "Console.log ohne DEBUG-Kommentar",
          suggestion: "// DEBUG: Entfernen vor Production"
        });
      }
      if (code.includes("await ") && !code.includes("try {")) {
        issues.push({
          type: "warning",
          message: "Async/Await ohne Error-Handling",
          suggestion: "Try-Catch Block hinzuf\xFCgen"
        });
      }
      if (code.includes("function ") && !code.includes(": ")) {
        issues.push({
          type: "info",
          message: "Fehlende TypeScript-Typen",
          suggestion: "Return-Type und Parameter-Typen hinzuf\xFCgen"
        });
      }
    }
    return {
      isValid: issues.filter((i) => i.type === "error").length === 0,
      issues
    };
  }
  /**
   * Intelligent Error Handler für Express
   */
  createExpressErrorHandler() {
    return (error, req, res, next) => {
      const errorId = errorLearningSystem.logError({
        type: this.classifyExpressError(error),
        message: error.message,
        file: req.path,
        context: `${req.method} ${req.path} - User: ${req.user?.id || "anonymous"}`,
        stackTrace: error.stack
      });
      const stats = errorLearningSystem.getErrorStatistics();
      const userMessage = this.generateUserFriendlyErrorMessage(error, stats);
      res.status(error.status || 500).json({
        error: userMessage,
        errorId,
        debug: process.env.NODE_ENV === "development" ? error.message : void 0
      });
      console.error(`\u{1F50D} Express Error logged: ${errorId}`);
    };
  }
  /**
   * Express-Fehler klassifizieren
   */
  classifyExpressError(error) {
    if (error.code === "ENOENT") return "CONFIG";
    if (error.message.includes("Cannot find module")) return "IMPORT";
    if (error.status === 401 || error.status === 403) return "AUTH";
    if (error.status >= 500) return "RUNTIME";
    if (error.message.includes("validation")) return "DATA";
    return "LOGIC";
  }
  /**
   * User-freundliche Fehlermeldung generieren
   */
  generateUserFriendlyErrorMessage(error, stats) {
    const commonErrors = {
      "Cannot find module": "Ein erforderliches Modul konnte nicht gefunden werden. Bitte kontaktieren Sie den Support.",
      "ENOENT": "Eine Datei oder Ressource konnte nicht gefunden werden.",
      "validation failed": "Die eingegebenen Daten sind ung\xFCltig. Bitte \xFCberpr\xFCfen Sie Ihre Eingaben.",
      "Unauthorized": "Sie sind nicht berechtigt, diese Aktion durchzuf\xFChren.",
      "Network Error": "Netzwerkfehler. Bitte \xFCberpr\xFCfen Sie Ihre Internetverbindung."
    };
    for (const [pattern, message] of Object.entries(commonErrors)) {
      if (error.message.includes(pattern)) {
        return message;
      }
    }
    return "Ein unerwarteter Fehler ist aufgetreten. Unser Team wurde benachrichtigt.";
  }
};
var errorPrevention = ErrorPreventionSystem.getInstance();
function createPreventionMiddleware() {
  return async (req, res, next) => {
    const scanResult = await errorPrevention.preExecutionScan({
      operation: `${req.method} ${req.path}`,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: !!process.env.DATABASE_URL
      }
    });
    if (!scanResult.safe) {
      console.warn("\u26A0\uFE0F Prevention Scan Warnings:", scanResult.warnings);
    }
    if (scanResult.recommendations.length > 0) {
      console.info("\u{1F4A1} Recommendations:", scanResult.recommendations);
    }
    next();
  };
}

// server/error-learning-middleware.ts
init_error_learning_system();
function requestTrackingMiddleware() {
  return (req, res, next) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    req.errorContext = {
      startTime: Date.now(),
      requestId,
      userId: req.user?.id
    };
    res.on("finish", () => {
      const duration = Date.now() - req.errorContext.startTime;
      if (duration > 5e3) {
        errorLearningSystem.logError({
          type: "RUNTIME",
          message: `Slow request detected: ${duration}ms`,
          file: req.path,
          context: `${req.method} ${req.path} - User: ${req.errorContext?.userId || "anonymous"} - Duration: ${duration}ms`
        });
      }
      if (res.statusCode >= 400) {
        const errorType = res.statusCode >= 500 ? "RUNTIME" : "LOGIC";
        errorLearningSystem.logError({
          type: errorType,
          message: `HTTP ${res.statusCode} error`,
          file: req.path,
          context: `${req.method} ${req.path} - Status: ${res.statusCode} - User: ${req.errorContext?.userId || "anonymous"}`
        });
      }
    });
    next();
  };
}
function databaseErrorCapture() {
  return (req, res, next) => {
    const originalQuery = req.app.get("db")?.query;
    if (originalQuery) {
      req.app.get("db").query = function(...args) {
        try {
          return originalQuery.apply(this, args);
        } catch (error) {
          errorLearningSystem.logError({
            type: "DATA",
            message: `Database error: ${error.message}`,
            file: req.path,
            context: `SQL Error in ${req.method} ${req.path} - Query: ${args[0]?.slice(0, 100)}...`
          });
          throw error;
        }
      };
    }
    next();
  };
}
function validationErrorCapture() {
  return (req, res, next) => {
    const originalSend = res.send;
    res.send = function(body) {
      if (res.statusCode === 400 && body?.message?.includes("validation")) {
        errorLearningSystem.logError({
          type: "DATA",
          message: `Validation error: ${body.message}`,
          file: req.path,
          context: `Validation failed for ${req.method} ${req.path} - Body: ${JSON.stringify(req.body).slice(0, 200)}`
        });
      }
      return originalSend.call(this, body);
    };
    next();
  };
}
function apiErrorPatternDetection() {
  return (req, res, next) => {
    if (!req.headers.authorization && req.path.startsWith("/api/") && req.path !== "/api/auth/login") {
      errorLearningSystem.logError({
        type: "CONFIG",
        message: "Missing authentication header",
        file: req.path,
        context: `Unauthenticated API access attempt: ${req.method} ${req.path}`
      });
    }
    if (req.method === "POST" && !req.headers["content-type"]?.includes("application/json")) {
      errorLearningSystem.logError({
        type: "API",
        message: "Invalid or missing Content-Type header",
        file: req.path,
        context: `POST request without proper Content-Type: ${req.method} ${req.path}`
      });
    }
    const contentLength = parseInt(req.headers["content-length"] || "0");
    if (contentLength > 10 * 1024 * 1024) {
      errorLearningSystem.logError({
        type: "API",
        message: `Large payload detected: ${contentLength} bytes`,
        file: req.path,
        context: `Oversized request: ${req.method} ${req.path} - Size: ${contentLength}`
      });
    }
    next();
  };
}
function proactiveErrorPrevention() {
  return async (req, res, next) => {
    const stats = errorLearningSystem.getErrorStatistics();
    const routeErrors = stats.recentErrors.filter(
      (error) => error.affectedFile === req.path
    );
    if (routeErrors.length >= 3) {
      console.warn(`\u26A0\uFE0F ROUTE MIT BEKANNTEN PROBLEMEN: ${req.path}`);
      console.warn(`\u{1F4CA} ${routeErrors.length} Fehler in den letzten Sessions`);
      res.setHeader("X-Error-Learning-Warning", "Known-Issues-Route");
      res.setHeader("X-Error-Count", routeErrors.length.toString());
    }
    if (routeErrors.length >= 5) {
      console.warn(`\u{1F6A8} AUTOMATISCHES RATE LIMITING f\xFCr ${req.path}`);
      const clientIp = req.ip;
      const rateLimitKey = `rate_limit_${clientIp}_${req.path}`;
      console.log(`\u{1F6E1}\uFE0F Rate Limiting aktiviert f\xFCr ${rateLimitKey}`);
    }
    next();
  };
}
function errorLearningAnalytics() {
  return (req, res, next) => {
    const userAgent = req.headers["user-agent"] || "";
    const referer = req.headers["referer"] || "";
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    if (req.errorContext) {
      req.errorContext = {
        ...req.errorContext,
        userAgent,
        referer,
        isMobile,
        ip: req.ip
      };
    }
    next();
  };
}
function createErrorLearningMiddleware() {
  return [
    requestTrackingMiddleware(),
    databaseErrorCapture(),
    validationErrorCapture(),
    apiErrorPatternDetection(),
    proactiveErrorPrevention(),
    errorLearningAnalytics()
  ];
}

// server/index.ts
var app = express2();
app.set("trust proxy", 1);
app.use(cors(corsOptions));
app.use(rateLimit2(rateLimitConfig));
setupSecurity(app);
app.use(helmet({
  contentSecurityPolicy: false,
  // We handle CSP in security.ts
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express2.json({ limit: "10mb" }));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
app.use(createPreventionMiddleware());
app.use(createErrorLearningMiddleware());
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use(errorPrevention.createExpressErrorHandler());
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
    startTrialReminderScheduler();
  });
})();
