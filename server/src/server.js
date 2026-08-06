import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  connectionString: "postgresql://postgres:postgres@localhost:5432/lbook",
});

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
}

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/books", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, author, image_url, story, characters, edition, final_score AS final, review, final_rating, created_at FROM books ORDER BY id DESC",
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar livros." });
  }
});

app.post("/api/books", upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      author,
      story,
      characters,
      edition,
      final: finalValue,
      review,
    } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const finalRating = (
      (Number(story) +
        Number(characters) +
        Number(edition) +
        Number(finalValue)) /
      4
    ).toFixed(1);

    const result = await pool.query(
      `INSERT INTO books (title, author, image_url, story, characters, edition, final_score, review, final_rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        title,
        author,
        imageUrl,
        Number(story),
        Number(characters),
        Number(edition),
        Number(finalValue),
        review || "",
        finalRating,
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
    const {
      title,
      author,
      story,
      characters,
      edition,
      final: finalValue,
      review,
    } = req.body;
    const finalRating = (
      (Number(story) +
        Number(characters) +
        Number(edition) +
        Number(finalValue)) /
      4
    ).toFixed(1);
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
           image_url = COALESCE($9, image_url)
       WHERE id = $10
       RETURNING *`,
      [
        title,
        author,
        Number(story),
        Number(characters),
        Number(edition),
        Number(finalValue),
        review || "",
        finalRating,
        imageUrl,
        id,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Livro não encontrado." });
    }

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
      const nextPort = port + 1;
      console.log(`Porta ${port} ocupada. Tentando ${nextPort}...`);
      startServer(nextPort);
      return;
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
