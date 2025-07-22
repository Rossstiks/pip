import { useEffect, useState } from 'react';
import Fuse from 'fuse.js';

export default function Home() {
  const [templates, setTemplates] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const fuse = new Fuse(templates, { keys: ['title', 'tags'] });

  useEffect(() => {
    fetch('/api/templates/index')
      .then(res => res.json())
      .then(setTemplates)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    setResults(fuse.search(query).map(r => r.item));
  }, [query, templates]);

  return (
    <div>
      <h1>Legal Templates</h1>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <ul>
        {results.map(t => (
          <li key={t.id}>{t.title} ({t.tags.join(', ')})</li>
        ))}
      </ul>
    </div>
  );
}
