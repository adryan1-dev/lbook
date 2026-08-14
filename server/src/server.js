import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";
import fs from "fs";
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

const ALLOWED_STATUSES = [
  "quero_comprar",
  "biblioteca",
  "lendo",
  "lido",
  "abandonei",
];
const STATUSES_WITH_RATINGS = new Set(["lido", "lendo"]);

const app = express();
const defaultPort = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function parseStatus(raw) {
  if (!ALLOWED_STATUSES.includes(raw)) {
    return null;
  }
  return raw;
}

function averageRating(story, characters, edition, finalValue) {
  return (
    (Number(story) + Number(characters) + Number(edition) + Number(finalValue)) /
    4
  ).toFixed(1);
}

function ratingsForWrite(status, body, existing) {
  if (STATUSES_WITH_RATINGS.has(status)) {
    return {
      story: Number(body.story) || 0,
      characters: Number(body.characters) || 0,
      edition: Number(body.edition) || 0,
      final: Number(body.final) || 0,
    };
  }

  if (existing) {
    return {
      story: Number(existing.story) || 0,
      characters: Number(existing.characters) || 0,
      edition: Number(existing.edition) || 0,
      final: Number(existing.final_score) || 0,
    };
  }

  return { story: 0, characters: 0, edition: 0, final: 0 };
}

function parsePageCount(raw) {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.floor(value);
}

function pagesForWrite(body, existing) {
  const hasCurrent = body.current_page !== undefined && body.current_page !== "";
  const hasTotal = body.total_pages !== undefined && body.total_pages !== "";

  let currentPage = hasCurrent
    ? parsePageCount(body.current_page)
    : existing
      ? Number(existing.current_page) || 0
      : 0;
  let totalPages = hasTotal
    ? parsePageCount(body.total_pages)
    : existing
      ? Number(existing.total_pages) || 0
      : 0;

  if (totalPages > 0 && currentPage > totalPages) {
    currentPage = totalPages;
  }

  return { currentPage, totalPages };
}

async function ensureSchema() {
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
}

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/books", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, author, image_url, story, characters, edition, final_score AS final, review, final_rating, status, current_page, total_pages, created_at FROM books ORDER BY id DESC",
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar livros." });
  }
});

app.post("/api/books", upload.single("image"), async (req, res) => {
  try {
    const { title, author, review } = req.body;
    const status = parseStatus(req.body.status);
    if (!status) {
      return res.status(400).json({
        error:
          "Status inválido. Use quero_comprar, biblioteca, lendo, lido ou abandonei.",
      });
    }

    const ratings = ratingsForWrite(status, req.body, null);
    const pages = pagesForWrite(req.body, null);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const finalRating = averageRating(
      ratings.story,
      ratings.characters,
      ratings.edition,
      ratings.final,
    );

    const result = await pool.query(
      `INSERT INTO books (title, author, image_url, story, characters, edition, final_score, review, final_rating, status, current_page, total_pages)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        title,
        author,
        imageUrl,
        ratings.story,
        ratings.characters,
        ratings.edition,
        ratings.final,
        review || "",
        finalRating,
        status,
        pages.currentPage,
        pages.totalPages,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar livro." });
  }
});

app.put("/api/books/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, review } = req.body;
    const status = parseStatus(req.body.status);
    if (!status) {
      return res.status(400).json({
        error:
          "Status inválido. Use quero_comprar, biblioteca, lendo, lido ou abandonei.",
      });
    }

    const existing = await pool.query(
      "SELECT story, characters, edition, final_score, current_page, total_pages FROM books WHERE id = $1",
      [id],
    );
    if (existing.rowCount === 0) {
      return res.status(404).json({ error: "Livro não encontrado." });
    }

    const ratings = ratingsForWrite(status, req.body, existing.rows[0]);
    const pages = pagesForWrite(req.body, existing.rows[0]);
    const finalRating = averageRating(
      ratings.story,
      ratings.characters,
      ratings.edition,
      ratings.final,
    );
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `UPDATE books
       SET title = $1,
           author = $2,
           story = $3,
           characters = $4,
           edition = $5,
           final_score = $6,
           review = $7,
           final_rating = $8,
           status = $9,
           current_page = $10,
           total_pages = $11,
           image_url = COALESCE($12, image_url)
       WHERE id = $13
       RETURNING *`,
      [
        title,
        author,
        ratings.story,
        ratings.characters,
        ratings.edition,
        ratings.final,
        review || "",
        finalRating,
        status,
        pages.currentPage,
        pages.totalPages,
        imageUrl,
        id,
      ],
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar livro." });
  }
});

app.delete("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM books WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Livro não encontrado." });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar livro." });
  }
});

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      // O Vite proxy aponta só para VITE_API_TARGET (default :3000).
      // Pular de porta deixa a API "no ar" mas o client falha ao salvar.
      console.error(
        `Porta ${port} ocupada. Liberte-a ou defina PORT / VITE_API_TARGET para a mesma porta.`,
      );
      process.exit(1);
    }

    console.error(error);
    process.exit(1);
  });
}

ensureSchema()
  .then(() => startServer(defaultPort))
  .catch((error) => {
    console.error("Erro ao preparar o banco:", error);
    process.exit(1);
  });
