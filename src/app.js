/* global instantsearch algoliasearch */
const tableStyle = `
  <style>
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    th {
      background-color: #4CAF50;
      color: white;
      font-weight: bold;
    }
  </style>
`;

function markdownTableToHtml(markdownTable) {
  const lines = markdownTable.split('\n');
  let html = '<table>';

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('|')) {
      const isHeader = lines.indexOf(line) === 0;
      const cells = line.split('|').slice(1, -1); // ignore first and last empty elements resulted from split

      html += isHeader ? '<thead>' : '<tr>';
      for (let cell of cells) {
        cell = cell.trim();
        html += isHeader ? `<th>${cell}</th>` : `<td>${cell}</td>`;
      }
      html += isHeader ? '</thead>' : '</tr>';
    }
  }

  html += '</table>';
  return html;
}

function showMarkdown(markdownText) {
  // Convert markdown to HTML
  const html = markdownTableToHtml(markdownText);

  // Create a popup window
  const popup = window.open('', 'Markdown Popup', 'width=500,height=500');

  // Write HTML to the new window document
  popup.document.write(tableStyle + html);
  popup.document.close();
}

const search = instantsearch({
  indexName: 'integrations-hero',
  searchClient: algoliasearch(
    process.env.ALGOLIA_APPID,
    process.env.ALGOLIA_SEARCH_API_KEY
  ),
  insights: true,
});

search.addWidgets([
  instantsearch.widgets.searchBox({
    container: '#searchbox',
  }),
  instantsearch.widgets.clearRefinements({
    container: '#clear-refinements',
  }),
  instantsearch.widgets.refinementList({
    container: '#brand-list',
    attribute: 'Tool',
  }),
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: (hit, { html, sendEvent }) => html`
        <div>
          <div class="hit-name">
            <p>${hit.Name}</p>
            <p>${hit.Tool}</p>
            <p>${hit.Category}</p>
          </div>
          <div>
            <button onclick="${() => window.open(hit.ProfileURL, '_blank')}">
              Open page
            </button>
            <button onclick="${() => showMarkdown(hit.Triggers)}">
              See triggers
            </button>
            <button onclick="${() => showMarkdown(hit.Actions)}">
              See Actions
            </button>
          </div>
        </div>
      `,
    },
  }),
  instantsearch.widgets.pagination({
    container: '#pagination',
  }),
]);

search.start();
