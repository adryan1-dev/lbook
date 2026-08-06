import { Pool } from "pg";

const pool = new Pool({
  connectionString: "postgresql://postgres:postgres@localhost:5432/lbook",
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

  console.log("Tabela books pronta.");
  await pool.end();
}

initDatabase().catch((error) => {
  console.error("Erro ao inicializar o banco:", error);
  process.exit(1);
});
