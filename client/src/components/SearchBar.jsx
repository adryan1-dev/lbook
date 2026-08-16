function SearchBar({ value, onChange }) {
  return (
    <label className="block">
      <span className="sr-only">Buscar na estante</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar por título ou autor…"
        autoComplete="off"
        className="w-full border-0 border-b-2 border-mist-400 bg-transparent px-0 py-2.5 text-sm text-ink-900 transition duration-150 ease-out placeholder:text-ink-400 focus:border-mist-700 focus:outline-none focus:ring-0"
      />
    </label>
  );
}

export default SearchBar;
