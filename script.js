// Helper: Get and set journal entries in localStorage (as "journal.json")
function getJournal() {
    let data = localStorage.getItem('journal.json');
    if (!data) return [];
    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function saveJournal(entries) {
    localStorage.setItem('journal.json', JSON.stringify(entries));
}

// Formatting helpers
function wrapSelection(textarea, tagOpen, tagClose) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    if (start === end) return; // Nothing selected
    const before = value.substring(0, start);
    const selected = value.substring(start, end);
    const after = value.substring(end);
    textarea.value = before + tagOpen + selected + tagClose + after;
    // Restore selection
    textarea.selectionStart = start;
    textarea.selectionEnd = end + tagOpen.length + tagClose.length;
    textarea.focus();
}

// Button events
document.getElementById('boldBtn').onclick = () => {
    wrapSelection(document.getElementById('journalInput'), '<b>', '</b>');
};
document.getElementById('italicBtn').onclick = () => {
    wrapSelection(document.getElementById('journalInput'), '<i>', '</i>');
};
document.getElementById('underlineBtn').onclick = () => {
    wrapSelection(document.getElementById('journalInput'), '<u>', '</u>');
};

// Submit event
document.getElementById('submitBtn').onclick = () => {
    const textarea = document.getElementById('journalInput');
    const message = textarea.value.trim();
    if (!message) {
        alert('Please enter a message.');
        return;
    }
    const entry = {
        content: message,
        date: new Date().toISOString()
    };
    const journal = getJournal();
    journal.push(entry);
    saveJournal(journal);
    textarea.value = '';
    alert('Entry saved!');
};

// View event
document.getElementById('viewBtn').onclick = () => {
    window.location.href = 'view.html';
};
