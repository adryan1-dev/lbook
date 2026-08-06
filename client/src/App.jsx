import { useEffect, useState } from "react";
import StarRating from "./components/StarRating";

const initialForm = {
  title: "",
  author: "",
  review: "",
  story: 0,
  characters: 0,
  edition: 0,
  final: 0,
};

const API_URLS = ["http://localhost:3000", "http://localhost:3001"];

async function requestJson(path, options = {}) {
  let lastError = null;

  for (const baseUrl of API_URLS) {
    try {
      const response = await fetch(`${baseUrl}${path}`, options);
      if (response.ok || response.status === 404) {
        return response;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Não foi possível conectar à API.");
}

function App() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const loadBooks = async () => {
    const response = await requestJson("/api/books");
    const data = await response.json();
    setBooks(data);
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleRatingChange = (category, value) => {
    setForm((current) => ({ ...current, [category]: value }));
  };

  const calculateFinalRating = () => {
    const values = [form.story, form.characters, form.edition, form.final];
    const sum = values.reduce((acc, current) => acc + current, 0);
    return values.every((value) => value > 0)
      ? (sum / values.length).toFixed(1)
      : "0.0";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("author", form.author);
    payload.append("story", form.story);
    payload.append("characters", form.characters);
    payload.append("edition", form.edition);
    payload.append("final", form.final);
    payload.append("review", form.review);

    if (image) {
      payload.append("image", image);
    }

    const path = editingId ? `/api/books/${editingId}` : "/api/books";
    const method = editingId ? "PUT" : "POST";

    const response = await requestJson(path, { method, body: payload });
    const data = await response.json();

    if (response.ok) {
      setMessage(
        editingId
          ? "Livro atualizado com sucesso!"
          : "Livro salvo com sucesso!",
      );
      setForm(initialForm);
      setImage(null);
      setEditingId(null);
      document.getElementById("image-input").value = "";
      loadBooks();
    } else {
      setMessage(data.error || "Não foi possível salvar o livro.");
    }
  };

  const handleEdit = (book) => {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      review: book.review || "",
      story: book.story || 0,
      characters: book.characters || 0,
      edition: book.edition || 0,
      final: book.final || 0,
    });
    setMessage(`Editando ${book.title}`);
  };

  const handleDelete = async (id) => {
    const response = await requestJson(`/api/books/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setMessage("Livro removido.");
      loadBooks();
    }
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Lbook</p>
          <h1>Seu caderno de leituras</h1>
          <p className="hero-copy">
            Organize cada leitura com notas claras, uma resenha pessoal e uma
            coleção que cresce com você.
          </p>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel form-panel">
          <div className="panel-intro">
            <p className="eyebrow">Cadastro</p>
            <h2>{editingId ? "Editar leitura" : "Registrar nova leitura"}</h2>
            <p className="panel-copy">
              Avalie o livro.
            </p>
          </div>
          {message ? <p className="message">{message}</p> : null}

          <form onSubmit={handleSubmit} className="book-form">
            <label>
              Título
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Autor
              <input
                name="author"
                value={form.author}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Foto do livro
              <input
                id="image-input"
                type="file"
                accept="image/*"
                onChange={(event) => setImage(event.target.files[0])}
              />
            </label>

            <div className="rating-grid">
              <StarRating
                label="Edição"
                hint="A leitura flui bem?"
                value={form.edition}
                onChange={(value) => handleRatingChange("edition", value)}
              />
              <StarRating
                label="Enredo"
                hint="A trama é envolvente?"
                value={form.story}
                onChange={(value) => handleRatingChange("story", value)}
              />
              <StarRating
                label="Personagens"
                hint="Os personagens são marcantes?"
                value={form.characters}
                onChange={(value) => handleRatingChange("characters", value)}
              />
              <StarRating
                label="Final"
                hint="O encerramento ficou forte?"
                value={form.final}
                onChange={(value) => handleRatingChange("final", value)}
              />
            </div>

            <div className="summary-box">
              <span>Média da leitura</span>
              <strong>{calculateFinalRating()}</strong>
            </div>

            <label className="review-label">
              Resenha
              <textarea
                name="review"
                rows="5"
                value={form.review}
                onChange={handleChange}
                placeholder="Escreva o que marcou nessa leitura..."
              />
            </label>

            <button type="submit" className="primary-button">
              {editingId ? "Salvar alterações" : "Salvar livro"}
            </button>
          </form>
        </section>

        <section className="panel panel-list">
          <div className="panel-head">
            <div>
              <h2>Minha coleção</h2>
              <p className="panel-copy">Seu painel pessoal de leituras.</p>
            </div>
            <span className="pill">{books.length} livros</span>
          </div>

          <div className="book-list">
            {books.length === 0 ? (
              <p className="empty-state">Ainda não há livros na sua coleção.</p>
            ) : (
              books.map((book) => (
                <article key={book.id} className="book-card">
                  {book.image_url ? (
                    <img
                      src={`http://localhost:3000${book.image_url}`}
                      alt={book.title}
                      className="book-cover"
                    />
                  ) : (
                    <div className="book-cover placeholder">Sem foto</div>
                  )}

                  <div className="book-info">
                    <h3>{book.title}</h3>
                    <p>{book.author}</p>
                    <div className="mini-rating">
                      <span>Nota média</span>
                      <strong>{book.final_rating || "0.0"}</strong>
                    </div>
                    {book.review ? (
                      <p className="review-snippet">
                        “{book.review.slice(0, 90)}
                        {book.review.length > 90 ? "..." : ""}”
                      </p>
                    ) : null}
                    <div className="card-actions">
                      <button onClick={() => handleEdit(book)}>Editar</button>
                      <button onClick={() => handleDelete(book.id)}>
                        Excluir
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
