function SearchBar({ value, onChange }) {
  return (
    <label className="block">
      <span className="sr-only">Buscar na biblioteca</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar por título ou autor…"
        autoComplete="off"
        className="w-full rounded-full border border-mist-200 bg-white px-4 py-2.5 text-sm text-ink-900 shadow-sm transition duration-150 ease-out placeholder:text-ink-400 focus:border-mist-500 focus:outline-none focus:ring-3 focus:ring-mist-400/35"
      />
    </label>
  );
}

export default SearchBar;
