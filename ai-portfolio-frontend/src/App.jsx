import React, { useState } from 'react';
import axios from 'axios';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHtml(null);
    try {
      const res = await axios.post('/api/generate', { prompt });
      setHtml(res.data.html);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '2rem' }}>
      <h1>AI Portfolio Builder</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows="4"
          placeholder="Describe your desired portfolio..."
          style={{ width: '100%', padding: '0.5rem' }}
        />
        <button type="submit" disabled={loading} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          {loading ? 'Generating...' : 'Generate Portfolio'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {html && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Generated Portfolio</h2>
          <iframe
            title="Generated Portfolio"
            srcDoc={html}
            style={{ width: '100%', height: '500px', border: '1px solid #ccc' }}
          />
        </div>
      )}
    </div>
  );
}