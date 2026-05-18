export function RecentProjects({ items, onLoad }) {
  if (!items.length) return null;

  return (
    <section className="recent-projects" aria-label="Poslednji projekti">
      <span>Poslednje</span>
      {items.map((item) => (
        <button key={`${item.boardName}-${item.savedAt}`} type="button" className="ghost" onClick={() => onLoad(item.project)}>
          {item.objectName || item.boardName}
        </button>
      ))}
    </section>
  );
}
