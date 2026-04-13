import { Pool } from "pg";
import fs from "fs";
import path from "path";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const result = await pool.query(text, params);
  return (result.rows[0] as T) || null;
}

export async function execute(
  text: string,
  params?: unknown[]
): Promise<number> {
  const result = await pool.query(text, params);
  return result.rowCount || 0;
}

// Initialize database schema
export async function initDb() {
  const schemaPath = path.join(process.cwd(), "src", "lib", "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  await pool.query(schema);
}

// --- User operations ---

interface User {
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
  role: string;
  totp_secret: string | null;
  totp_enabled: boolean;
}

export async function getUserCount(): Promise<number> {
  const row = await queryOne<{ count: string }>(
    "SELECT COUNT(*) as count FROM users"
  );
  return parseInt(row?.count || "0", 10);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return queryOne<User>("SELECT * FROM users WHERE email = $1", [email]);
}

export async function getUserById(id: string): Promise<User | null> {
  return queryOne<User>("SELECT * FROM users WHERE id = $1", [id]);
}

export async function createUser(
  email: string,
  displayName: string,
  passwordHash: string,
  role: "owner" | "household"
): Promise<User> {
  const result = await queryOne<User>(
    "INSERT INTO users (email, display_name, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *",
    [email, displayName, passwordHash, role]
  );
  return result!;
}

export async function setTotpSecret(
  userId: string,
  encryptedSecret: string
): Promise<void> {
  await execute(
    "UPDATE users SET totp_secret = $1 WHERE id = $2",
    [encryptedSecret, userId]
  );
}

export async function enableTotp(userId: string): Promise<void> {
  await execute(
    "UPDATE users SET totp_enabled = true WHERE id = $1",
    [userId]
  );
}

export async function disableTotp(userId: string): Promise<void> {
  await execute(
    "UPDATE users SET totp_enabled = false, totp_secret = NULL WHERE id = $1",
    [userId]
  );
}

// --- Session operations ---

interface Session {
  id: string;
  user_id: string;
  expires_at: string;
  email: string;
  display_name: string;
  role: string;
}

export async function createSession(
  userId: string,
  expiresAt: Date
): Promise<Session> {
  const result = await queryOne<Session>(
    `INSERT INTO sessions (user_id, expires_at) VALUES ($1, $2)
     RETURNING id, user_id, expires_at`,
    [userId, expiresAt.toISOString()]
  );
  return result!;
}

export async function getSession(id: string): Promise<Session | null> {
  return queryOne<Session>(
    `SELECT s.id, s.user_id, s.expires_at, u.email, u.display_name, u.role
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.id = $1 AND s.expires_at > NOW()`,
    [id]
  );
}

export async function deleteSession(id: string) {
  await execute("DELETE FROM sessions WHERE id = $1", [id]);
}

export async function cleanExpiredSessions() {
  await execute("DELETE FROM sessions WHERE expires_at <= NOW()");
}

// --- Audit log ---

export async function logAudit(
  userId: string,
  action: string,
  resource?: string,
  details?: string,
  ip?: string
) {
  await execute(
    "INSERT INTO audit_log (user_id, action, resource, details, ip) VALUES ($1, $2, $3, $4, $5)",
    [userId, action, resource || null, details || null, ip || null]
  );
}

// --- Financial data ---

export interface IncomeEntry {
  id: number;
  source: string;
  period: string;
  gross_amount: number;
  net_amount: number | null;
  tax_withheld: number | null;
  details: Record<string, unknown> | null;
}

export async function getIncomeByPeriod(
  year: number
): Promise<IncomeEntry[]> {
  return query<IncomeEntry>(
    "SELECT * FROM income_entries WHERE period LIKE $1 ORDER BY period, source",
    [`${year}-%`]
  );
}

export async function getIncomeYTD(year: number) {
  return queryOne<{ total_gross: string; total_net: string; total_tax: string }>(
    `SELECT
       COALESCE(SUM(gross_amount), 0) as total_gross,
       COALESCE(SUM(net_amount), 0) as total_net,
       COALESCE(SUM(tax_withheld), 0) as total_tax
     FROM income_entries
     WHERE period LIKE $1`,
    [`${year}-%`]
  );
}

export async function getExpensesByMonth(
  year: number,
  month: number
): Promise<{ category: string; total: string }[]> {
  return query(
    `SELECT category, SUM(amount) as total
     FROM expenses
     WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2
     GROUP BY category`,
    [year, month]
  );
}

export async function createExpense(
  date: string,
  description: string,
  amount: number,
  category: string,
  paymentMethod: string | null,
  personalOrBusiness: string,
  notes: string | null,
  createdBy: string
) {
  return queryOne(
    `INSERT INTO expenses (date, description, amount, category, payment_method, personal_or_business, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [date, description, amount, category, paymentMethod, personalOrBusiness, notes, createdBy]
  );
}

export async function getRecurringBills() {
  return query(
    "SELECT * FROM recurring_bills WHERE active = true ORDER BY due_day"
  );
}

export async function getTaxDeadlines() {
  return query(
    "SELECT * FROM tax_deadlines ORDER BY deadline"
  );
}

export async function getActiveAlerts() {
  return query(
    "SELECT * FROM alerts WHERE resolved = false ORDER BY created_at DESC"
  );
}

// --- Conversation operations ---

export interface Project {
  id: string;
  user_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  shared_with: string | null;
  project_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  tool_calls: unknown | null;
  token_usage: unknown | null;
  created_at: string;
}

export async function createConversation(
  userId: string,
  title?: string
): Promise<Conversation> {
  const result = await queryOne<Conversation>(
    "INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *",
    [userId, title || "New Conversation"]
  );
  return result!;
}

export async function getConversations(
  userId: string,
  limit = 50
): Promise<Conversation[]> {
  return query<Conversation>(
    `SELECT * FROM conversations
     WHERE user_id = $1 OR shared_with = $1
     ORDER BY updated_at DESC LIMIT $2`,
    [userId, limit]
  );
}

export async function getConversation(
  id: string,
  userId: string
): Promise<Conversation | null> {
  return queryOne<Conversation>(
    "SELECT * FROM conversations WHERE id = $1 AND (user_id = $2 OR shared_with = $2)",
    [id, userId]
  );
}

export async function updateConversationTitle(
  id: string,
  title: string
): Promise<void> {
  await execute(
    "UPDATE conversations SET title = $1, updated_at = NOW() WHERE id = $2",
    [title, id]
  );
}

export async function touchConversation(id: string): Promise<void> {
  await execute("UPDATE conversations SET updated_at = NOW() WHERE id = $1", [id]);
}

export async function deleteConversation(
  id: string,
  userId: string
): Promise<void> {
  await execute(
    "DELETE FROM conversations WHERE id = $1 AND (user_id = $2 OR shared_with = $2)",
    [id, userId]
  );
}

export async function shareConversation(
  id: string,
  ownerId: string,
  shareWithUserId: string | null
): Promise<void> {
  await execute(
    "UPDATE conversations SET shared_with = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3",
    [shareWithUserId, id, ownerId]
  );
}

export async function getAllUsers(): Promise<{ id: string; display_name: string; email: string }[]> {
  return query<{ id: string; display_name: string; email: string }>(
    "SELECT id, display_name, email FROM users ORDER BY display_name"
  );
}

export async function createMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  toolCalls?: unknown,
  tokenUsage?: unknown
): Promise<Message> {
  const result = await queryOne<Message>(
    `INSERT INTO messages (conversation_id, role, content, tool_calls, token_usage)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [
      conversationId,
      role,
      content,
      toolCalls ? JSON.stringify(toolCalls) : null,
      tokenUsage ? JSON.stringify(tokenUsage) : null,
    ]
  );
  return result!;
}

export async function getMessages(
  conversationId: string,
  limit = 50
): Promise<Message[]> {
  return query<Message>(
    "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC LIMIT $2",
    [conversationId, limit]
  );
}

// --- Project operations ---

export async function createProject(
  userId: string,
  name: string
): Promise<Project> {
  const maxPos = await queryOne<{ max: string }>(
    "SELECT COALESCE(MAX(position), -1) as max FROM projects WHERE user_id = $1",
    [userId]
  );
  const position = parseInt(maxPos?.max || "-1", 10) + 1;
  const result = await queryOne<Project>(
    "INSERT INTO projects (user_id, name, position) VALUES ($1, $2, $3) RETURNING *",
    [userId, name, position]
  );
  return result!;
}

export async function getProjects(userId: string): Promise<Project[]> {
  return query<Project>(
    "SELECT * FROM projects WHERE user_id = $1 ORDER BY position ASC, created_at ASC",
    [userId]
  );
}

export async function updateProjectName(
  id: string,
  userId: string,
  name: string
): Promise<void> {
  await execute(
    "UPDATE projects SET name = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3",
    [name, id, userId]
  );
}

export async function deleteProject(
  id: string,
  userId: string
): Promise<void> {
  await execute(
    "DELETE FROM projects WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
}

export async function moveConversationToProject(
  conversationId: string,
  userId: string,
  projectId: string | null
): Promise<void> {
  await execute(
    "UPDATE conversations SET project_id = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3",
    [projectId, conversationId, userId]
  );
}

// --- Budget operations ---

export async function getBudgetProgress(year: number, month: number) {
  return query(
    `SELECT
       bc.code, bc.name, bc.monthly_budget,
       COALESCE(SUM(e.amount), 0) as spent
     FROM budget_categories bc
     LEFT JOIN expenses e ON e.category = bc.code
       AND EXTRACT(YEAR FROM e.date) = $1
       AND EXTRACT(MONTH FROM e.date) = $2
     WHERE bc.active = true AND bc.monthly_budget > 0
     GROUP BY bc.code, bc.name, bc.monthly_budget
     ORDER BY bc.code`,
    [year, month]
  );
}
