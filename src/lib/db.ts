import { Pool } from "pg";
import crypto from "crypto";
import type { ClientRequest, Database, Freelancer, FreelancerStatus } from "./types";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize database tables
async function initializeTables() {
  const client = await pool.connect();
  try {
    // Create tables with sequential integer primary keys if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS client_requests (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        company_name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        event_type VARCHAR(255),
        event_date VARCHAR(255),
        location VARCHAR(255),
        ushers_needed INT,
        notes TEXT,
        is_row_deleted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS freelancers (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        age INT,
        gender VARCHAR(50),
        phone VARCHAR(20),
        email VARCHAR(255),
        city VARCHAR(255),
        experience TEXT,
        languages TEXT,
        availability TEXT,
        profile_photo VARCHAR(255),
        profile_photo_data BYTEA,
        cv VARCHAR(255),
        cv_data BYTEA,
        status VARCHAR(50) DEFAULT 'Pending',
        is_row_deleted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure existing schema allows nullable emails for freelancers
    // (some registration flows don't require email; make column nullable)
    try {
      await client.query(`ALTER TABLE freelancers ALTER COLUMN email DROP NOT NULL`);
    } catch (e) {
      // ignore if column doesn't exist or cannot be altered
    }
    // Ensure binary columns exist for storing uploaded files
    try {
      await client.query(`ALTER TABLE freelancers ADD COLUMN IF NOT EXISTS profile_photo_data BYTEA`);
      await client.query(`ALTER TABLE freelancers ADD COLUMN IF NOT EXISTS cv_data BYTEA`);
    } catch (e) {
      // ignore
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT,
        password_plain TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure existing tables have the soft-delete column
    await client.query(`ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS is_row_deleted BOOLEAN DEFAULT false`);
    await client.query(`ALTER TABLE freelancers ADD COLUMN IF NOT EXISTS is_row_deleted BOOLEAN DEFAULT false`);
    // preserve legacy hashed password support and ensure plaintext column exists
    await client.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS password_hash TEXT`);
    await client.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS password_plain TEXT`);
    // seed admin from env if provided
    try {
      const adminUser = process.env.ADMIN_USERNAME;
      const adminPass = process.env.ADMIN_PASSWORD;
      if (adminUser && adminPass) {
        await client.query(`INSERT INTO admins (username, password_plain) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING`, [adminUser, adminPass]);
      }
    } catch {
      // ignore seeding errors
    }
  } finally {
    client.release();
  }
}

export async function addAdmin(username: string, password: string) {
  const normalizedUsername = username.trim().toLowerCase();
  const result = await pool.query(
    `INSERT INTO admins (username, password_plain) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING RETURNING id, username`,
    [normalizedUsername, password],
  );

  return result.rows[0] || null;
}

export async function getAdminByUsername(username: string) {
  const normalizedUsername = username.trim();
  const result = await pool.query(
    `SELECT id, username, password_hash, password_plain FROM admins WHERE LOWER(username) = LOWER($1)`,
    [normalizedUsername],
  );
  return result.rows[0] || null;
}

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyHash(password: string, stored: string) {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
  } catch {
    return false;
  }
}

export async function verifyAdminCredentials(username: string, password: string) {
  const row = await getAdminByUsername(username);
  if (!row) return false;
  if (row.password_plain) {
    return row.password_plain === password;
  }

  return row.password_hash ? verifyHash(password, row.password_hash) : false;
}

export async function getAllAdmins() {
  const result = await pool.query(`SELECT id, username, created_at as "createdAt" FROM admins ORDER BY id`);
  return result.rows;
}

// Initialize tables on module load
initializeTables().catch(console.error);

export async function readDb(): Promise<Database> {
  const [clientsResult, freelancersResult] = await Promise.all([
    pool.query(`
      SELECT 
        id,
        full_name as "fullName",
        company_name as "companyName",
        email,
        phone,
        event_type as "eventType",
        event_date as "eventDate",
        location,
        ushers_needed as "ushersNeeded",
        notes,
        is_row_deleted as "isRowDeleted",
        created_at as "createdAt"
      FROM client_requests
      WHERE is_row_deleted = false
      ORDER BY created_at DESC
    `),
    pool.query(`
      SELECT 
        id,
        full_name as "fullName",
        age,
        gender,
        phone,
        email,
        city,
        experience,
        languages,
        availability,
        profile_photo as "profilePhoto",
        cv,
        status,
        is_row_deleted as "isRowDeleted",
        created_at as "createdAt"
      FROM freelancers
      WHERE is_row_deleted = false
      ORDER BY created_at DESC
    `),
  ]);

  return {
    clients: clientsResult.rows as ClientRequest[],
    freelancers: freelancersResult.rows as Freelancer[],
  };
}

export async function addClientRequest(
  input: Omit<ClientRequest, "id" | "createdAt">,
) {
  const result = await pool.query(
    `
    INSERT INTO client_requests (full_name, company_name, email, phone, event_type, event_date, location, ushers_needed, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING 
      id,
      full_name as "fullName",
      company_name as "companyName",
      email,
      phone,
      event_type as "eventType",
      event_date as "eventDate",
      location,
      ushers_needed as "ushersNeeded",
      notes,
      created_at as "createdAt"
    `,
    [
      input.fullName,
      input.companyName,
      input.email,
      input.phone,
      input.eventType,
      input.eventDate,
      input.location,
      input.ushersNeeded,
      input.notes,
    ],
  );

  return result.rows[0] as ClientRequest;
}

export async function addFreelancer(
  input: Omit<Freelancer, "id" | "createdAt" | "status">,
) {
  const result = await pool.query(
    `
    INSERT INTO freelancers (full_name, age, gender, phone, email, city, experience, languages, availability, profile_photo, profile_photo_data, cv, cv_data, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'Pending')
    RETURNING 
      id,
      full_name as "fullName",
      age,
      gender,
      phone,
      email,
      city,
      experience,
      languages,
      availability,
      profile_photo as "profilePhoto",
      /* profile_photo_data omitted from RETURNING for performance */
      cv,
      /* cv_data omitted from RETURNING for performance */
      status,
      created_at as "createdAt"
    `,
    [
      input.fullName,
      input.age,
      input.gender,
      input.phone,
      input.email,
      input.city,
      input.experience,
      input.languages,
      input.availability,
      input.profilePhoto,
      (input as any).profilePhotoData || null,
      input.cv,
      (input as any).cvData || null,
    ],
  );

  return result.rows[0] as Freelancer;
}

export async function updateFreelancerStatus(
  id: number,
  status: FreelancerStatus,
) {
  const result = await pool.query(
    `
    UPDATE freelancers
    SET status = $1
    WHERE id = $2
    RETURNING 
      id,
      full_name as "fullName",
      age,
      gender,
      phone,
      email,
      city,
      experience,
      languages,
      availability,
      profile_photo as "profilePhoto",
      cv,
      status,
      created_at as "createdAt"
    `,
    [status, id],
  );

  return result.rows[0] || null;
}

export async function deleteFreelancer(id: number) {
  const result = await pool.query(
    `UPDATE freelancers SET is_row_deleted = true WHERE id = $1`,
    [id],
  );

  return (result.rowCount ?? 0) > 0;
}

export async function deleteClient(id: number) {
  const result = await pool.query(
    `UPDATE client_requests SET is_row_deleted = true WHERE id = $1`,
    [id],
  );

  return (result.rowCount ?? 0) > 0;
}

// Ensure reads in other helpers also respect is_row_deleted when necessary

export async function getSummary() {
  const [clientsCount, freelancersCount, pendingCount, approvedCount] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM client_requests WHERE is_row_deleted = false`),
    pool.query(`SELECT COUNT(*) FROM freelancers WHERE is_row_deleted = false`),
    pool.query(`SELECT COUNT(*) FROM freelancers WHERE status = 'Pending' AND is_row_deleted = false`),
    pool.query(`SELECT COUNT(*) FROM freelancers WHERE status = 'Approved' AND is_row_deleted = false`),
  ]);

  return {
    totalClients: parseInt(clientsCount.rows[0].count),
    totalFreelancers: parseInt(freelancersCount.rows[0].count),
    pendingApplications: parseInt(pendingCount.rows[0].count),
    approvedUshers: parseInt(approvedCount.rows[0].count),
  };
}
