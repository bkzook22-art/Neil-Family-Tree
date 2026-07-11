// Declare the variable globally so all files can see it
let genealogyData = [];

// 1. Fetch the data from the JSON file as soon as the file loads
fetch('data.json')
    .then(response => {
        if (!response.ok) throw new Error("Could not load data.json");
        return response.json();
    })
    .then(data => {
        // Save the data to our global variable
        genealogyData = data;
        
        // Announce that the data is ready!
        document.dispatchEvent(new Event('DataLoaded'));
    })
    .catch(error => console.error("Error loading genealogy data:", error));


// 2. Wait for the data to load before setting up the Main Page
document.addEventListener('DataLoaded', () => {
    
    // Search and filter function (Main Page Only)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const category = document.getElementById('searchCategory').value;

            const filtered = genealogyData.filter(person => {
                const valueToSearch = person[category];
                if (valueToSearch == null) return false;
                return String(valueToSearch).toLowerCase().includes(searchTerm);
            });

            displayData(filtered);
        });
    }

    // Default display for the main portal page (if results div exists but dropdown doesn't)
    if (document.getElementById('results') && !document.getElementById('personSelect')) {
        displayData(genealogyData);
    }
});


// 3. Generic fall-back display style (Main Page)
function displayData(data) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = data.map(person => `
        <div class="card">
            <h3>${person["First Name"]} ${person["Last Name"]}</h3>
            <p>Born: ${person["Born"] || 'Unknown'}</p>
            <p>Died: ${person["Died"] || 'Present'}</p>
            <p>Relationship: ${person["Relationship"] || 'Self'}</p>
            <p>Notes: ${person["Notes"] || ''}</p>
        </div>
    `).join('');
}