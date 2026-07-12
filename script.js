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
    // Updated block: only run if we aren't on the family or hierarchy page
const isSpecialPage = window.location.pathname.includes('family.html') || 
                      window.location.pathname.includes('hierarchy.html');

if (document.getElementById('results') && !document.getElementById('personSelect') && !isSpecialPage) {
    displayData(genealogyData);
}
});


// 3. Generic fall-back display style (Main Page)
function displayData(data, container = document.getElementById('results')) {
    console.log("displayData called with count:", data.length); // <--- ADD THIS
    if (!container) return;
    
    container.innerHTML = data.map(person => `
        <div class="card">
            <h4>${person["Name Array"]}</h4>
            <p><small>Born: ${person["Born"] || "Unknown"}, Died: ${person["Died"] || "Unknown"}</small></p>
            <p><small>Notes: ${person["Notes"] || "None"}</small></p>
            <p><small>Partner(s): ${person["Partner Array"] || "None"}</small></p>
        </div>
    `).join('');
}

// Calculate the generation level for a person
function getGeneration(person, allData, depth = 0) {
    // Safety break: if we go deeper than 20 generations, stop to prevent infinite loops
    if (depth > 20) return 20;

    // A "root" person is someone whose parents are not in the database
    const parent1 = allData.find(p => p.IndividualUID == person.ParentUID);
    const parent2 = allData.find(p => p.IndividualUID == person.PartnerUID);

    if (!parent1 && !parent2) {
        return depth; // This is a root ancestor
    }

    // Otherwise, return 1 + the generation of the parent(s)
    const parent = parent1 || parent2;
    return getGeneration(parent, allData, depth + 1);
}

// Add this to the bottom of script.js
function onDataReady(callback) {
    if (genealogyData.length > 0) {
        // Data is already loaded, run immediately
        callback();
    } else {
        // Data is still loading, wait for the event
        document.addEventListener('DataLoaded', callback);
    }
}