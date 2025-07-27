import {
  users,
  projects,
  customers,
  companies,
  persons,
  attachments,
  projectLocations,
  audioRecords,
  photos,
  supportTickets,
  aiLog,
  customerContacts,
  companyContacts,
  trialNotifications,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type Customer,
  type InsertCustomer,
  type Company,
  type InsertCompany,
  type Person,
  type InsertPerson,
  type Attachment,
  type InsertAttachment,
  type ProjectLocation,
  type InsertProjectLocation,
  type AudioRecord,
  type InsertAudioRecord,
  type Photo,
  type InsertPhoto,
  type SupportTicket,
  type InsertSupportTicket,
  type AILog,
  type InsertAILog,
  type CustomerContact,
  type InsertCustomerContact,
  type CompanyContact,
  type InsertCompanyContact,
  type TrialNotification,
  type InsertTrialNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Auth)
  getUser(id: string): Promise<User | undefined>; // Sucht nach externalId für Kompatibilität
  getUserById(id: number): Promise<User | undefined>; // Sucht nach numerischer ID
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>; // Nutzt externalId
  getUserProjectRoles(userId: string): Promise<any[]>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
  getSystemStats(): Promise<any>;
  createBackup(): Promise<string>;
  
  // Project operations - SECURITY: All include user isolation
  getProjects(userId?: string): Promise<Project[]>; // Admin gets all, users get filtered

  getProject(id: number, userId?: string): Promise<Project | undefined>; // Validates ownership
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>, userId?: string): Promise<Project>;
  deleteProject(id: number, userId?: string): Promise<void>;
  
  // Customer operations - SECURITY: All include user isolation
  getCustomers(userId?: string): Promise<Customer[]>; // Admin gets all, users get filtered
  getCustomer(id: number, userId?: string): Promise<Customer | undefined>; // Validates ownership
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>, userId?: string): Promise<Customer>;
  
  // Company operations - SECURITY: All include user isolation
  getCompanies(userId?: string): Promise<Company[]>; // Admin gets all, users get filtered
  getCompany(id: number, userId?: string): Promise<Company | undefined>; // Validates ownership
  createCompany(company: InsertCompany): Promise<Company>;
  
  // Person operations - SECURITY: All include user isolation
  getPersons(userId?: string): Promise<Person[]>; // Admin gets all, users get filtered
  getPerson(id: number, userId?: string): Promise<Person | undefined>; // Validates ownership
  createPerson(person: InsertPerson): Promise<Person>;
  
  // Attachment operations
  getAttachments(projectId?: number): Promise<Attachment[]>;
  getAttachmentsByUser(userId: string): Promise<Attachment[]>;
  getAttachment(id: number): Promise<Attachment | undefined>;
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  deleteAttachment(id: number): Promise<void>;
  
  // Project location operations
  getProjectLocations(projectId: number): Promise<ProjectLocation[]>;
  createProjectLocation(location: InsertProjectLocation): Promise<ProjectLocation>;
  
  // Audio record operations
  getAudioRecords(projectId: number): Promise<AudioRecord[]>;
  createAudioRecord(record: InsertAudioRecord): Promise<AudioRecord>;
  
  // Photo operations
  getPhotos(projectId: number): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  
  // Support ticket operations
  getSupportTickets(): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, updateData: Partial<InsertSupportTicket>): Promise<SupportTicket>;
  
  // AI Log operations (EU AI Act Compliance)
  createAILog(log: InsertAILog): Promise<AILog>;
  getAIUsageStats(userId?: string): Promise<{
    totalInteractions: number;
    tokenUsage: number;
    mostUsedActions: Array<{ action: string; count: number }>;
    recentInteractions: Array<{ action: string; timestamp: Date; projectId?: number }>;
  }>;

  // Customer contact operations
  getCustomerContacts(customerId: number): Promise<CustomerContact[]>;
  createCustomerContact(contact: InsertCustomerContact): Promise<CustomerContact>;
  updateCustomerContact(id: number, contact: Partial<InsertCustomerContact>): Promise<CustomerContact>;
  deleteCustomerContact(id: number): Promise<void>;

  // Company contact operations
  getCompanyContacts(companyId: number): Promise<CompanyContact[]>;
  createCompanyContact(contact: InsertCompanyContact): Promise<CompanyContact>;
  updateCompanyContact(id: number, contact: Partial<InsertCompanyContact>): Promise<CompanyContact>;
  deleteCompanyContact(id: number): Promise<void>;

  // Trial Notification operations
  getTrialNotifications(userId: string): Promise<TrialNotification[]>;
  getAllTrialNotifications(): Promise<TrialNotification[]>;
  createTrialNotification(notification: InsertTrialNotification): Promise<TrialNotification>;
  getTrialNotificationStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    // Kompatibilität: Suche nach externalId (alte Text-IDs)
    const [user] = await db.select().from(users).where(eq(users.externalId, id));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    // Neue Methode: Suche nach numerischer ID
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    return allUsers;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    // Kompatibilität: Update basierend auf externalId
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.externalId, id))
      .returning();
    
    if (!user) {
      throw new Error(`User with external ID ${id} not found`);
    }
    
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.externalId,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations - SECURITY IMPLEMENTED
  async getProjects(userId?: string): Promise<Project[]> {
    if (!userId) {
      // Admin context - return all projects
      return await db.select().from(projects).orderBy(desc(projects.createdAt));
    }
    
    // User context - only return their projects
    return await db.select().from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));
  }



  async getProject(id: number, userId?: string): Promise<Project | undefined> {
    if (!userId) {
      // Admin context - can access any project
      const [project] = await db.select().from(projects).where(eq(projects.id, id));
      return project;
    }
    
    // User context - validate ownership
    const [project] = await db.select().from(projects)
      .where(and(
        eq(projects.id, id),
        eq(projects.userId, userId)
      ));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>, userId?: string): Promise<Project> {
    if (!userId) {
      // Admin context - can update any project
      const [updatedProject] = await db
        .update(projects)
        .set({ ...project, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning();
      return updatedProject;
    }
    
    // User context - validate ownership
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(and(
        eq(projects.id, id),
        eq(projects.userId, userId)
      ))
      .returning();
    
    if (!updatedProject) {
      throw new Error(`Project with ID ${id} not found or access denied`);
    }
    
    return updatedProject;
  }

  async deleteProject(id: number, userId?: string): Promise<void> {
    if (!userId) {
      // Admin context - can delete any project
      await db.delete(projects).where(eq(projects.id, id));
      return;
    }
    
    // User context - validate ownership
    const result = await db
      .delete(projects)
      .where(and(
        eq(projects.id, id),
        eq(projects.userId, userId)
      ));
    
    if (result.rowCount === 0) {
      throw new Error(`Project with ID ${id} not found or access denied`);
    }
  }

  // Customer operations - SECURITY IMPLEMENTED
  async getCustomers(userId?: string): Promise<Customer[]> {
    if (!userId) {
      // Admin context - return all customers
      return await db.select().from(customers).orderBy(desc(customers.createdAt));
    }
    
    // User context - only return their customers
    return await db.select().from(customers)
      .where(eq(customers.userId, userId))
      .orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number, userId?: string): Promise<Customer | undefined> {
    if (!userId) {
      // Admin context - can access any customer
      const [customer] = await db.select().from(customers).where(eq(customers.id, id));
      return customer;
    }
    
    // User context - validate ownership
    const [customer] = await db.select().from(customers)
      .where(and(
        eq(customers.id, id),
        eq(customers.userId, userId)
      ));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>, userId?: string): Promise<Customer> {
    if (!userId) {
      // Admin context - can update any customer
      const [updatedCustomer] = await db
        .update(customers)
        .set({ ...customer, updatedAt: new Date() })
        .where(eq(customers.id, id))
        .returning();
      return updatedCustomer;
    }
    
    // User context - validate ownership
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(and(
        eq(customers.id, id),
        eq(customers.userId, userId)
      ))
      .returning();
    
    if (!updatedCustomer) {
      throw new Error(`Customer with ID ${id} not found or access denied`);
    }
    
    return updatedCustomer;
  }

  // Company operations - SECURITY IMPLEMENTED
  async getCompanies(userId?: string): Promise<Company[]> {
    if (!userId) {
      // Admin context - return all companies
      return await db.select().from(companies).orderBy(desc(companies.createdAt));
    }
    
    // User context - only return their companies
    return await db.select().from(companies)
      .where(eq(companies.userId, userId))
      .orderBy(desc(companies.createdAt));
  }

  async getCompany(id: number, userId?: string): Promise<Company | undefined> {
    if (!userId) {
      // Admin context - can access any company
      const [company] = await db.select().from(companies).where(eq(companies.id, id));
      return company;
    }
    
    // User context - validate ownership
    const [company] = await db.select().from(companies)
      .where(and(
        eq(companies.id, id),
        eq(companies.userId, userId)
      ));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  // Person operations - SECURITY IMPLEMENTED
  async getPersons(userId?: string): Promise<Person[]> {
    if (!userId) {
      // Admin context - return all persons
      return await db.select().from(persons).orderBy(desc(persons.createdAt));
    }
    
    // User context - only return their persons
    return await db.select().from(persons)
      .where(eq(persons.userId, userId))
      .orderBy(desc(persons.createdAt));
  }

  async getPerson(id: number, userId?: string): Promise<Person | undefined> {
    if (!userId) {
      // Admin context - can access any person
      const [person] = await db.select().from(persons).where(eq(persons.id, id));
      return person;
    }
    
    // User context - validate ownership
    const [person] = await db.select().from(persons)
      .where(and(
        eq(persons.id, id),
        eq(persons.userId, userId)
      ));
    return person;
  }

  async createPerson(person: InsertPerson): Promise<Person> {
    const [newPerson] = await db.insert(persons).values(person).returning();
    return newPerson;
  }

  // Attachment operations
  async getAttachments(projectId?: number): Promise<Attachment[]> {
    if (projectId) {
      return await db
        .select()
        .from(attachments)
        .where(eq(attachments.projectId, projectId))
        .orderBy(desc(attachments.createdAt));
    }
    
    // Return all attachments (admin view)
    return await db
      .select()
      .from(attachments)
      .orderBy(desc(attachments.createdAt));
  }

  async getAttachmentsByUser(userId: string): Promise<Attachment[]> {
    return await db
      .select()
      .from(attachments)
      .where(eq(attachments.uploadedBy, userId))
      .orderBy(desc(attachments.createdAt));
  }

  async getAttachment(id: number): Promise<Attachment | undefined> {
    const [attachment] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, id));
    return attachment;
  }

  async createAttachment(attachment: InsertAttachment): Promise<Attachment> {
    const [newAttachment] = await db.insert(attachments).values(attachment).returning();
    return newAttachment;
  }

  async deleteAttachment(id: number): Promise<void> {
    await db.delete(attachments).where(eq(attachments.id, id));
  }

  // Project location operations
  async getProjectLocations(projectId: number): Promise<ProjectLocation[]> {
    return await db
      .select()
      .from(projectLocations)
      .where(eq(projectLocations.projectId, projectId));
  }

  async createProjectLocation(location: InsertProjectLocation): Promise<ProjectLocation> {
    const [newLocation] = await db.insert(projectLocations).values(location).returning();
    return newLocation;
  }

  // Audio record operations
  async getAudioRecords(projectId: number): Promise<AudioRecord[]> {
    return await db
      .select()
      .from(audioRecords)
      .where(eq(audioRecords.projectId, projectId))
      .orderBy(desc(audioRecords.createdAt));
  }

  async createAudioRecord(record: InsertAudioRecord): Promise<AudioRecord> {
    const [newRecord] = await db.insert(audioRecords).values(record).returning();
    return newRecord;
  }

  // Photo operations
  async getPhotos(projectId: number): Promise<Photo[]> {
    return await db
      .select()
      .from(photos)
      .where(eq(photos.projectId, projectId))
      .orderBy(desc(photos.createdAt));
  }

  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const [newPhoto] = await db.insert(photos).values(photo).returning();
    return newPhoto;
  }

  // Support ticket operations
  async getSupportTickets(): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [newTicket] = await db.insert(supportTickets).values(ticket).returning();
    return newTicket;
  }

  async updateSupportTicket(id: number, updateData: Partial<InsertSupportTicket>): Promise<SupportTicket> {
    const [updatedTicket] = await db
      .update(supportTickets)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return updatedTicket;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.externalId, id));
  }

  async getSystemStats(): Promise<any> {
    // Get user count
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    
    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [recentUserCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`created_at >= ${thirtyDaysAgo.toISOString()}`);

    // Get user counts by role
    const [adminCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'admin'));

    const [managerCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'manager'));

    const [regularUserCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'user'));

    // Get project count
    const [projectCount] = await db.select({ count: sql<number>`count(*)` }).from(projects);

    // License statistics
    const [basicLicenseCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.licenseType, 'basic'));

    const [professionalLicenseCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.licenseType, 'professional'));

    const [enterpriseLicenseCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.licenseType, 'enterprise'));

    // Active licenses (paid users)
    const [paidLicenseCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`payment_status = 'paid'`);

    // Expiring licenses (trial users within 7 days of expiry)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const [expiringCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`payment_status = 'trial' AND trial_end_date <= ${sevenDaysFromNow.toISOString()}`);

    // Calculate totals safely
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

    // Mock payment data for now (would need real Stripe integration)
    const paymentsThisMonth = 0;
    const totalRevenue = 0;

    return {
      // Frontend expects these field names:
      activeUsers: totalUsers,
      newUsersThisMonth: recentUsers,
      totalProjects: totalProjects,
      adminUsers: admins,
      managerUsers: managers,
      regularUsers: regularUsers,
      dbSize: "45.2 MB", // Mock data
      lastBackup: "2025-07-15 19:00:00", // Mock data
      activeLicenses: activeLicenses,
      expiringLicenses: expiringLicenses,
      availableLicenses: 999, // Unlimited
      basicLicenses: basicLicenses,
      professionalLicenses: professionalLicenses,
      enterpriseLicenses: enterpriseLicenses,
      paymentsThisMonth: paymentsThisMonth,
      totalRevenue: totalRevenue,
      lastUpdated: new Date().toISOString()
    };
  }

  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `backup_${timestamp}`;
    
    // In a real implementation, this would create a database backup
    console.log(`Creating backup with ID: ${backupId}`);
    
    return backupId;
  }

  async createAILog(log: InsertAILog): Promise<AILog> {
    const [newLog] = await db.insert(aiLog).values(log).returning();
    return newLog;
  }

  async getAIUsageStats(userId?: string): Promise<{
    totalInteractions: number;
    tokenUsage: number;
    mostUsedActions: Array<{ action: string; count: number }>;
    recentInteractions: Array<{ action: string; timestamp: Date; projectId?: number }>;
  }> {
    // Implementation would query AI logs table
    return {
      totalInteractions: 0,
      tokenUsage: 0,
      mostUsedActions: [],
      recentInteractions: []
    };
  }

  async getCustomerContacts(customerId: number): Promise<CustomerContact[]> {
    return await db
      .select()
      .from(customerContacts)
      .where(eq(customerContacts.customerId, customerId));
  }

  async createCustomerContact(contact: InsertCustomerContact): Promise<CustomerContact> {
    const [newContact] = await db.insert(customerContacts).values(contact).returning();
    return newContact;
  }

  async updateCustomerContact(id: number, contact: Partial<InsertCustomerContact>): Promise<CustomerContact> {
    const [updatedContact] = await db
      .update(customerContacts)
      .set(contact)
      .where(eq(customerContacts.id, id))
      .returning();
    return updatedContact;
  }

  async deleteCustomerContact(id: number): Promise<void> {
    await db.delete(customerContacts).where(eq(customerContacts.id, id));
  }

  async getCompanyContacts(companyId: number): Promise<CompanyContact[]> {
    return await db
      .select()
      .from(companyContacts)
      .where(eq(companyContacts.companyId, companyId));
  }

  async createCompanyContact(contact: InsertCompanyContact): Promise<CompanyContact> {
    const [newContact] = await db.insert(companyContacts).values(contact).returning();
    return newContact;
  }

  async updateCompanyContact(id: number, contact: Partial<InsertCompanyContact>): Promise<CompanyContact> {
    const [updatedContact] = await db
      .update(companyContacts)
      .set(contact)
      .where(eq(companyContacts.id, id))
      .returning();
    return updatedContact;
  }

  async deleteCompanyContact(id: number): Promise<void> {
    await db.delete(companyContacts).where(eq(companyContacts.id, id));
  }

  // Trial Notification operations
  async getTrialNotifications(userId: string): Promise<TrialNotification[]> {
    return await db
      .select()
      .from(trialNotifications)
      .where(eq(trialNotifications.userId, userId))
      .orderBy(desc(trialNotifications.sentAt));
  }

  async getAllTrialNotifications(): Promise<TrialNotification[]> {
    return await db
      .select()
      .from(trialNotifications)
      .orderBy(desc(trialNotifications.sentAt));
  }

  async createTrialNotification(notification: InsertTrialNotification): Promise<TrialNotification> {
    const [newNotification] = await db.insert(trialNotifications).values(notification).returning();
    return newNotification;
  }

  async getTrialNotificationStats(): Promise<any> {
    const stats = await db
      .select({
        total: sql<number>`count(*)`,
        sent: sql<number>`sum(case when status = 'sent' then 1 else 0 end)`,
        failed: sql<number>`sum(case when status = 'failed' then 1 else 0 end)`,
        last24h: sql<number>`sum(case when sent_at >= now() - interval '24 hours' then 1 else 0 end)`
      })
      .from(trialNotifications);
    
    return stats[0] || { total: 0, sent: 0, failed: 0, last24h: 0 };
  }

  // Hochwasserschutz-Checklisten abrufen
  async getFloodChecklists(userId: string): Promise<any[]> {
    try {
      // TODO: Implementiere echte Datenbankabfrage für Hochwasserschutz-Checklisten
      // Beispiel für zukünftige Implementierung:
      // const result = await this.db.select().from(floodChecklists).where(eq(floodChecklists.userId, userId));
      // return result;
      
      // Aktuell: Leere Array zurückgeben bis echte Tabelle implementiert ist
      return [];
    } catch (error) {
      console.error('Error getting flood checklists:', error);
      return [];
    }
  }

  // Absperrschieber abrufen
  async getFloodGates(userId: string): Promise<any[]> {
    try {
      // TODO: Implementiere echte Datenbankabfrage für Absperrschieber
      // Beispiel für zukünftige Implementierung:
      // const result = await this.db.select().from(floodGates).where(eq(floodGates.userId, userId));
      // return result;
      
      // Aktuell: Leere Array zurückgeben bis echte Tabelle implementiert ist
      return [];
    } catch (error) {
      console.error('Error getting flood gates:', error);
      return [];
    }
  }

  async getUserProjectRoles(userId: string): Promise<any[]> {
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
      WHERE pr.user_id = ${userId}
      ORDER BY pr.assigned_at DESC
    `);
    
    return result.rows.map((row: any) => ({
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
}

export const storage = new DatabaseStorage();