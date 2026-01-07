let resources = {};
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

const subjectsNav = document.getElementById('subjects');
const contentSection = document.getElementById('content');

/* SUBJECT BUTTONS */
function createSubjectButtons(subjects) {
  subjectsNav.innerHTML = '';
  subjects.forEach(subject => {
    const btn = document.createElement('button');
    btn.textContent = subject;
    btn.classList.add('subject-btn');
    btn.onclick = () => {
      document.querySelectorAll('.subject-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showSubjectContent(subject);
    };
    subjectsNav.appendChild(btn);
  });
}

/* SHOW SUBJECT CONTENT */
function showSubjectContent(subject) {
  const data = resources[subject];
  if (!data) {
    contentSection.innerHTML = '<p>No data available.</p>';
    return;
  }

  let html = `
    <div class="top-bar">
      <input type="text" id="searchInput" placeholder="Search papers..." oninput="filterPapers()" />
      <button onclick="toggleDarkMode()">🌙 Dark Mode</button>
    </div>
  `;

  /* NOTES */
  if (data.notes?.length) {
    html += `
      <div class="resource-section">
        <h2>Notes</h2>
        <div class="resource-list">
          ${data.notes.map(n => `<a href="${n.url}" target="_blank">${n.title}</a>`).join('')}
        </div>
      </div>
    `;
  }

  /* PAPERS */
  if (data.papers?.length) {
    html += `
      <div class="resource-section">
        <h2>Past Papers</h2>
        <div id="papersList">
    `;

    data.papers.forEach(paper => {
      const fav = favorites.includes(paper.url);
      html += `
        <div class="paper-item" data-title="${paper.title.toLowerCase()}">
          <span class="paper-title">${paper.title}</span>
          <div class="paper-actions">
            <button onclick="viewPaper('${paper.url}')">View</button>
            <a href="${paper.url}" download>Download</a>
            <button onclick="toggleFavorite('${paper.url}')">
              ${fav ? '⭐' : '☆'}
            </button>
          </div>
        </div>
      `;
    });

    html += `
        </div>
        <div id="paper-viewer">
          <p>Select a paper to view it.</p>
        </div>
      </div>
    `;
  }

  /* VIDEOS */
  if (data.videos?.length) {
    html += `
      <div class="resource-section">
        <h2>Videos</h2>
        ${data.videos.map(v => `
          <div class="video-item">
            <p>${v.title}</p>
            <iframe src="${v.url}" allowfullscreen></iframe>
          </div>
        `).join('')}
      </div>
    `;
  }

  contentSection.innerHTML = html;
}

/* VIEW PDF */
function viewPaper(url) {
  document.getElementById('paper-viewer').innerHTML =
    `<iframe src="${url}" class="pdf-frame"></iframe>`;
}

/* SEARCH */
function filterPapers() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  document.querySelectorAll('.paper-item').forEach(item => {
    item.style.display = item.dataset.title.includes(q) ? 'flex' : 'none';
  });
}

/* FAVORITES */
function toggleFavorite(url) {
  if (favorites.includes(url)) {
    favorites = favorites.filter(f => f !== url);
  } else {
    favorites.push(url);
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  document.querySelector('.subject-btn.active')?.click();
}

/* DARK MODE */
function toggleDarkMode() {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}

/* LOAD DARK MODE */
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark');
}

/* LOAD DATA */
fetch('resources.json')
  .then(res => res.json())
  .then(data => {
    resources = data;
    createSubjectButtons(Object.keys(data).sort());
  })
  .catch(() => contentSection.innerHTML = '<p>Error loading data.</p>');
