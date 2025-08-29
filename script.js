let journalData = [];

// Theme management
function initTheme() {
    const savedTheme = localStorage.getItem("journal-theme") || "dark";
    setTheme(savedTheme);
}

function setTheme(theme) {
    const body = document.body;
    const themeToggle = document.getElementById("themeToggle");

    body.className = theme;

    if (theme === "dark") {
        themeToggle.innerHTML = "🌙";
        themeToggle.title = "Switch to light theme";
    } else {
        themeToggle.innerHTML = "☀️";
        themeToggle.title = "Switch to dark theme";
    }

    localStorage.setItem("journal-theme", theme);
}

function toggleTheme() {
    const currentTheme = document.body.className;
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
}

// Function to display messages to the user
function showMessage(message, type = "success") {
    const messageBox = document.getElementById("messageBox");
    messageBox.textContent = message;
    messageBox.className = "message-box"; // Reset classes
    if (type === "error") {
        messageBox.style.backgroundColor = "#f44336"; // Red for error
    } else {
        messageBox.style.backgroundColor = "#4CAF50"; // Green for success
    }
    messageBox.classList.add("show");

    setTimeout(() => {
        messageBox.classList.remove("show");
    }, 3000); // Hide after 3 seconds
}

// Function to extract date from timestamp
function extractDate(timestamp) {
    return timestamp.split(" ")[0]; // Assumes format like "2024-01-15 10:30:00"
}

// Function to format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

// Function to extract time from timestamp
function extractTime(timestamp) {
    const timePart = timestamp.split(" ")[1];
    if (timePart) {
        return timePart.substring(0, 5); // Return HH:MM format
    }
    return "";
}

// Function to render main journal entries
function renderMainEntries() {
    const journalEntriesContainer =
        document.getElementById("journalEntries");
    journalEntriesContainer.innerHTML = "";

    if (journalData.length === 0) {
        journalEntriesContainer.innerHTML =
            '<p class="text-center text-secondary text-lg mt-4">No journal entries found yet.</p>';
        return;
    }

    // Sort entries in reverse chronological order (most recent first)
    const sortedData = [...journalData].sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB - dateA; // Sort descending
    });

    // Render each journal entry
    sortedData.forEach((entry) => {
        const entryDiv = document.createElement("div");
        entryDiv.className = "journal-entry";

        const timestampDiv = document.createElement("div");
        timestampDiv.className = "entry-timestamp";
        timestampDiv.textContent = entry.timestamp;

        const contentDiv = document.createElement("div");
        contentDiv.className = "entry-content";
        contentDiv.innerHTML = entry.entry;

        entryDiv.appendChild(timestampDiv);
        entryDiv.appendChild(contentDiv);
        journalEntriesContainer.appendChild(entryDiv);

        // Enhance iframes in this entry
        enhanceIframes(contentDiv);
    });
}

// Function to render date list
function renderDateList() {
    const datesList = document.getElementById("datesList");
    datesList.innerHTML = "";

    // Group entries by date
    const entriesByDate = {};
    journalData.forEach((entry) => {
        const date = extractDate(entry.timestamp);
        if (!entriesByDate[date]) {
            entriesByDate[date] = [];
        }
        entriesByDate[date].push(entry);
    });

    // Sort dates in reverse chronological order
    const sortedDates = Object.keys(entriesByDate).sort(
        (a, b) => new Date(b) - new Date(a)
    );

    sortedDates.forEach((date) => {
        const dateItem = document.createElement("div");
        dateItem.className = "date-item";
        dateItem.onclick = () => showDayView(date, entriesByDate[date]);

        const dateInfo = document.createElement("div");
        dateInfo.innerHTML = `
            <div class="text-lg font-semibold text-primary">${formatDate(
            date
        )}</div>
            <div class="text-sm text-secondary">${date}</div>
          `;

        const entryCount = document.createElement("div");
        entryCount.className = "text-sm text-muted font-medium";
        entryCount.textContent = `${entriesByDate[date].length} ${entriesByDate[date].length === 1 ? "entry" : "entries"
            }`;

        dateItem.appendChild(dateInfo);
        dateItem.appendChild(entryCount);
        datesList.appendChild(dateItem);
    });
}

// Function to show day view
function showDayView(date, entries) {
    const fullScreenView = document.getElementById("fullScreenView");
    const dayContent = document.getElementById("dayContent");

    // Sort entries for this day in chronological order
    const sortedEntries = entries.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    dayContent.innerHTML = `
          <div class="day-header">
            <h1 class="text-3xl font-bold mb-2 responsive-subtitle">${formatDate(
        date
    )}</h1>
            <p class="text-lg opacity-90">${sortedEntries.length} ${sortedEntries.length === 1 ? "entry" : "entries"
        } for this day</p>
          </div>
        `;

    sortedEntries.forEach((entry) => {
        const entryDiv = document.createElement("div");
        entryDiv.className = "day-entry";

        const timeDiv = document.createElement("div");
        timeDiv.className = "day-entry-time";
        timeDiv.textContent =
            extractTime(entry.timestamp) || "No time specified";

        const contentDiv = document.createElement("div");
        contentDiv.className = "entry-content";
        contentDiv.innerHTML = entry.entry;

        entryDiv.appendChild(timeDiv);
        entryDiv.appendChild(contentDiv);
        dayContent.appendChild(entryDiv);

        // Enhance iframes in this entry
        enhanceIframes(contentDiv);
    });

    fullScreenView.style.display = "block";
    document.body.style.overflow = "hidden"; // Prevent background scrolling
}

// Function to hide day view
function hideDayView() {
    const fullScreenView = document.getElementById("fullScreenView");
    fullScreenView.style.display = "none";
    document.body.style.overflow = "auto"; // Restore background scrolling
}

// Function to show date list view
function showDateListView() {
    document.getElementById("mainView").style.display = "none";
    document.getElementById("dateListView").style.display = "block";
    renderDateList();
}

// Function to show main view
function showMainView() {
    document.getElementById("mainView").style.display = "block";
    document.getElementById("dateListView").style.display = "none";
    hideDayView();
}

document.addEventListener("DOMContentLoaded", () => {
    // Initialize theme
    initTheme();

    const loadingMessage = document.getElementById("loadingMessage");
    const jsonFilePath = "journal.json";

    // Event listeners
    document
        .getElementById("themeToggle")
        .addEventListener("click", toggleTheme);
    document
        .getElementById("viewByDateBtn")
        .addEventListener("click", showDateListView);
    document
        .getElementById("allEntriesBtn")
        .addEventListener("click", showMainView);
    document
        .getElementById("backToMainBtn")
        .addEventListener("click", showMainView);
    document
        .getElementById("backToDateListBtn")
        .addEventListener("click", () => {
            hideDayView();
            showDateListView();
        });

    // Load journal data
    fetch(jsonFilePath)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            loadingMessage.style.display = "none";
            journalData = data;
            renderMainEntries();
            showMessage("Journal entries loaded successfully!");
        })
        .catch((error) => {
            loadingMessage.textContent = "Failed to load journal entries.";
            loadingMessage.className = "text-center text-red-600 text-lg mt-4";
            console.error("Error fetching or parsing journal.json:", error);
            showMessage(
                `Error: ${error.message}. Make sure 'journal.json' is accessible and valid JSON, and you are running a local server.`,
                "error"
            );
        });
});

// Add this function to your <script> section

function enhanceIframes(container) {
    const iframes = container.querySelectorAll("iframe");
    iframes.forEach((iframe) => {
        // Skip if already wrapped
        if (iframe.parentElement.classList.contains("iframe-preview")) return;

        // Create preview wrapper
        const preview = document.createElement("div");
        preview.className = "iframe-preview";
        preview.title = "Click to enlarge preview";

        // Clone the iframe for preview (smaller size)
        const previewIframe = iframe.cloneNode(true);
        previewIframe.style.width = "100%";
        previewIframe.style.height = "200px";
        previewIframe.style.pointerEvents = "none"; // Prevent interaction in preview

        preview.appendChild(previewIframe);

        // Replace original iframe with preview
        iframe.parentElement.replaceChild(preview, iframe);

        // On click, show modal
        preview.addEventListener("click", () => {
            showIframeModal(iframe);
        });
    });
}

function showIframeModal(iframe) {
    const modal = document.getElementById("iframeModal");
    modal.innerHTML = `
          <div class="iframe-modal-overlay">
            <div class="iframe-modal-content">
              <button class="iframe-modal-close" title="Close">&times;</button>
              <iframe src="${iframe.src}" allowfullscreen></iframe>
            </div>
          </div>
        `;
    modal.style.display = "block";

    // Close button
    modal.querySelector(".iframe-modal-close").onclick = () => {
        modal.style.display = "none";
        modal.innerHTML = "";
    };

    // Close on overlay click
    modal.querySelector(".iframe-modal-overlay").onclick = (e) => {
        if (e.target === modal.querySelector(".iframe-modal-overlay")) {
            modal.style.display = "none";
            modal.innerHTML = "";
        }
    };
}