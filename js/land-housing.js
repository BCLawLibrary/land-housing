async function fetchCSVData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch CSV");
    return Papa.parse(await response.text(), {
      header: true,
      skipEmptyLines: true,
    });
  } catch (error) {
    console.error(error);
    return { data: [] }; // Return empty data in case of error
  }
}

function formatWork(rowData) {
  let [
    Section,
    Authorship,
    Title,
    Keywords,
    Year,
    Month,
    Date,
    Thumbnail,
    Link,
  ] = rowData;
}

async function convertDataToObject(url) {
  const CSVdata = await fetchCSVData(url);
  return CSVdata.data;
}

function formatDate(year, month, date) {
  var parts = [month, date, year].filter(Boolean);
  return parts.join("/");
}

function formatTitle(title, link) {
  if (link != null) {
    return `<a href="${link}">${title}</a>`;
  } else {
    return title;
  }
}

function formatAuthors(authorship) {
  var authors = authorship.split(";");
  if (authors.length > 1) {
    lastCoauthor = authors.pop();
    formattedAuthors = `${authors.join(", ")} and ${lastCoauthor}`;
  } else {
    formattedAuthors = authorship;
  }
  return formattedAuthors;
}

function formatKeywords(keywords) {
  var keywords = keywords.split(";");
  return `<div class="keywords">
            <div class="tag">
              <i class="fa-regular fa-bookmark"></i>
              ${keywords.join(`
            </div>
            <div class="tag">
              <i class="fa-regular fa-bookmark"></i>`)}
            </div>
          </div>
        `;
}

function initializeTable(data) {
  const custom_columns = [
    { title: "Section", data: "Section", visible: false },
    { title: "Authorship", data: "Authorship", visible: false },
    { title: "Title", data: "Title", visible: false },
    { title: "Keywords", data: "Keywords", visible: false },
    { title: "Year", data: "Year", visible: false },
    { title: "Month", data: "Month", visible: false },
    { title: "Date", data: "Date", visible: false },
    { title: "Thumbnail", data: "Thumbnail", visible: false },
    { title: "Link", data: "Link", visible: false },
    {
      title: "Works",
      data: null,
      render: function (data, type, row) {
        return `
        <div class="card">
          <div class="card-thumbnail">
            <img src="${row.Thumbnail}" />
          </div>
          <div class="card-text">
            <div class="card-date">
              ${formatDate(row.Year, row.Month, row.Date)}
            </div>
            <div class="card-title">
              ${formatTitle(row.Title, row.Link)}
            </div>
            <div class="card-authorship">
              ${formatAuthors(row.Authorship)}
            </div>
            <div class="card-keywords">
            ${formatKeywords(row.Keywords)}
            </div>
          </div>
        </div>
        `;
      },
    },
    { title: "Priority", data: "Priority", visible: false },
  ];

  const table = new DataTable("#works__table", {
    dom: "Brt", // buttons, processing, table
    autoWidth: false,
    paging: false,
    data: data,
    columns: custom_columns,
    order: [
      [10, "asc"],
      [4, "desc"],
      [5, "desc"],
      [6, "desc"],
    ],
    rowGroup: { dataSrc: "Section" }, // relies on RowGroup extension
  });

  return table;
}

$(document).ready(function () {
  async function main() {
    const url =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSvcazCOMPpKONojpgN19KIaqRBEApjYaeyHdB3DKDC9QI8TyWBTMki-vw4fPCHt2HfUQYX-gfj8DUM/pub?gid=0&single=true&output=csv";
    const data = await convertDataToObject(url);

    var table = initializeTable(data);

    $(".policies__loading").hide();
  }

  main();
});
