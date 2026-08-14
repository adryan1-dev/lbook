import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

if (!process.env.DATABASE_URL) {
  console.error(
    "Missing DATABASE_URL. Copy server/.env.example to server/.env and set your Postgres URL.",
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      image_url TEXT,
      story INTEGER DEFAULT 0,
      characters INTEGER DEFAULT 0,
      edition INTEGER DEFAULT 0,
      final_score INTEGER DEFAULT 0,
      review TEXT,
      final_rating VARCHAR(10) DEFAULT '0.0',
      status VARCHAR(20) NOT NULL DEFAULT 'biblioteca',
      current_page INTEGER DEFAULT 0,
      total_pages INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(
    `ALTER TABLE books ADD COLUMN IF NOT EXISTS characters INTEGER DEFAULT 0`,
  );
  await pool.query(
    `ALTER TABLE books ADD COLUMN IF NOT EXISTS edition INTEGER DEFAULT 0`,
  );
  await pool.query(
    `ALTER TABLE books ADD COLUMN IF NOT EXISTS final_score INTEGER DEFAULT 0`,
  );
  await pool.query(`ALTER TABLE books ADD COLUMN IF NOT EXISTS review TEXT`);
  await pool.query(`ALTER TABLE books ADD COLUMN IF NOT EXISTS status VARCHAR(20)`);
  await pool.query(`UPDATE books SET status = 'lido' WHERE status IS NULL`);
  await pool.query(
    `UPDATE books SET status = 'quero_comprar' WHERE status = 'quero_ler'`,
  );
  await pool.query(
    `UPDATE books SET status = 'biblioteca' WHERE status = 'para_ler'`,
  );
  await pool.query(
    `ALTER TABLE books ALTER COLUMN status SET DEFAULT 'biblioteca'`,
  );
  await pool.query(`ALTER TABLE books ALTER COLUMN status SET NOT NULL`);
  await pool.query(
    `ALTER TABLE books ADD COLUMN IF NOT EXISTS current_page INTEGER DEFAULT 0`,
  );
  await pool.query(
    `ALTER TABLE books ADD COLUMN IF NOT EXISTS total_pages INTEGER DEFAULT 0`,
  );

  console.log("Tabela books pronta.");
  await pool.end();
}

initDatabase().catch((error) => {
  console.error("Erro ao inicializar o banco:", error);
  process.exit(1);
});
