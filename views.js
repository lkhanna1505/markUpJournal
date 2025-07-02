function getJournal() {
    let data = localStorage.getItem('journal.json');
    if (!data) return [];
    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString();
}

function renderEntries() {
    const entriesDiv = document.getElementById('entries');
    const journal = getJournal();
    if (journal.length === 0) {
        entriesDiv.innerHTML = '<p>No entries yet.</p>';
        return;
    }
    // Show in reverse chronological order
    const html = journal.slice().reverse().map(entry => `
    <div class="entry">
      <div class="entry-date">${formatDate(entry.date)}</div>
      <div class="entry-content">${entry.content}</div>
    </div>
  `).join('');
    entriesDiv.innerHTML = html;
}

// Allow HTML tags for formatting (b, i, u)
window.onload = renderEntries;
