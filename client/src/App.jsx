import { useCallback, useEffect, useState } from "react";
import {
  createReading,
  deleteReading,
  listReadings,
  readingToFormData,
  updateReading,
  usesLocalData,
  usesSupabase,
} from "./lib/store";
import { useAuth } from "./lib/auth";
import { countByStatus, filterBySearch, labelOfStatus } from "./lib/readings";
import AuthScreen from "./components/AuthScreen";
import ConfirmDialog from "./components/ConfirmDialog";
import Header from "./components/Header";
import ReadingDetailModal from "./components/ReadingDetailModal";
import ReadingFormModal from "./components/ReadingFormModal";
import SearchBar from "./components/SearchBar";
import Shelf from "./components/Shelf";
import StatusTabs from "./components/StatusTabs";

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [formTarget, setFormTarget] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const selectedReading = readings.find((item) => item.id === selectedId);
  const statusCounts = countByStatus(readings);
  const hasSearch = Boolean(searchQuery.trim());
  const byStatus =
    statusFilter === "all"
      ? readings
      : readings.filter((item) => item.status === statusFilter);
  const visibleReadings = filterBySearch(byStatus, searchQuery);

  const loadShelf = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setReadings(await listReadings());
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (usesSupabase && (authLoading || !user)) {
      return;
    }
    loadShelf();
  }, [loadShelf, authLoading, user]);

  useEffect(() => {
    if (!feedback) {
      return;
    }
    const timer = setTimeout(() => setFeedback(""), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleSubmit = async (payload) => {
    const editing = formTarget?.reading;

    if (editing) {
      await updateReading(editing.id, payload);
      setFeedback(`“${editing.title}” foi atualizado.`);
    } else {
      await createReading(payload);
      setFeedback("Leitura adicionada à estante.");
    }

    setFormTarget(null);
    setSelectedId(null);
    await loadShelf();
  };

  const handleStatusChange = async (reading, nextStatus) => {
    await updateReading(
      reading.id,
      readingToFormData(reading, { status: nextStatus }),
    );
    setFeedback(
      `“${reading.title}” agora está em ${labelOfStatus(nextStatus)}.`,
    );
    await loadShelf();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteReading(pendingDelete.id);
      setFeedback(`“${pendingDelete.title}” saiu da estante.`);
      setPendingDelete(null);
      setSelectedId(null);
      await loadShelf();
    } catch (error) {
      setFeedback(error.message);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setReadings([]);
      setSelectedId(null);
      setFormTarget(null);
      setPendingDelete(null);
    } catch (error) {
      setFeedback(error.message);
    }
  };

  if (usesSupabase) {
    if (authLoading) {
      return (
        <div className="flex min-h-dvh items-center justify-center text-sm text-ink-500">
          Abrindo…
        </div>
      );
    }

    if (!user) {
      return <AuthScreen />;
    }
  }

  return (
    <div className="min-h-dvh">
      <a
        href="#estante"
        className="sr-only focus:not-sr-only focus:absolute focus:z-20 focus:m-3 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink-900 focus:shadow-panel"
      >
        Pular para a estante
      </a>

      <Header
        count={readings.length}
        localDemo={usesLocalData}
        userEmail={usesSupabase ? user?.email : null}
        onSignOut={usesSupabase ? handleSignOut : null}
        onNewReading={() => setFormTarget({ reading: null })}
      />

      <main
        id="estante"
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8"
      >
        <p role="status" className="sr-only">
          {feedback}
        </p>

        {feedback ? (
          <p
            aria-hidden="true"
            className="mb-6 rounded-2xl border border-blush-200 bg-blush-100 px-4 py-3 text-sm text-ink-700"
          >
            {feedback}
          </p>
        ) : null}

        {loading ? (
          <p className="py-16 text-center text-sm text-ink-500">
            Abrindo sua estante…
          </p>
        ) : loadError ? (
          <div className="rounded-3xl border border-berry-500/30 bg-berry-500/8 px-6 py-10 text-center">
            <p className="font-display text-lg font-semibold text-ink-900">
              A estante não carregou
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
              {loadError}
              {usesLocalData
                ? ""
                : usesSupabase
                  ? " Verifique sua conexão e tente de novo."
                  : " Verifique se o servidor está rodando e tente de novo."}
            </p>
            <button
              type="button"
              onClick={loadShelf}
              className="mt-6 rounded-full border border-ink-400/50 px-5 py-2.5 text-sm font-semibold text-ink-700 transition duration-150 ease-out hover:bg-white"
            >
              Tentar de novo
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {readings.length > 0 ? (
              <>
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
                <StatusTabs
                  active={statusFilter}
                  counts={statusCounts}
                  onChange={setStatusFilter}
                />
              </>
            ) : null}

            <Shelf
              readings={visibleReadings}
              statusFilter={statusFilter}
              hasSearch={hasSearch}
              showStatusBadge={statusFilter === "all"}
              onOpenReading={(reading) => setSelectedId(reading.id)}
              onNewReading={() => setFormTarget({ reading: null })}
            />
          </div>
        )}
      </main>

      {selectedReading ? (
        <ReadingDetailModal
          reading={selectedReading}
          onEdit={(reading) => {
            setSelectedId(null);
            setFormTarget({ reading });
          }}
          onDelete={(reading) => setPendingDelete(reading)}
          onStatusChange={handleStatusChange}
          onClose={() => setSelectedId(null)}
        />
      ) : null}

      {formTarget ? (
        <ReadingFormModal
          reading={formTarget.reading}
          onSubmit={handleSubmit}
          onClose={() => setFormTarget(null)}
        />
      ) : null}

      {pendingDelete ? (
        <ConfirmDialog
          title="Remover esta leitura?"
          description={`“${pendingDelete.title}” sai da estante junto com as notas e a resenha. Não dá para desfazer.`}
          confirmLabel="Excluir"
          busyLabel="Removendo…"
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      ) : null}
    </div>
  );
}

export default App;
