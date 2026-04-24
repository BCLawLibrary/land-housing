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

async function convertDataToObject(url) {
  const CSVdata = await fetchCSVData(url);
  return CSVdata.data;
}

function isRenderable(row) {
  // Only render rows that have all of these fields
  return (
    row.Priority && row.Section && row.Title && row.Thumbnail && row.Authorship
  );
}

// Another package somewhere in the codebase
// already has formatDate. I spent 30 minutes
// debugging this!
function myUniqueFormatDate(year, month, date) {
  var parts = [month, date, year].filter(Boolean);
  return parts.join("/");
}

function formatTitle(title, link) {
  if (link) {
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
  // fa-genderless = circle icon in Font Awesome
  var keywords = keywords.split(";").map((item) => item.trim());
  if (keywords.length == 1 && keywords[0] === "") {
    return "";
  } else {
    return `<div class="keywords">
            <div class="tag">
              <i class="fa-solid fa-genderless"></i> 
              ${keywords.join(`
            </div>
            <div class="tag">
              <i class="fa-solid fa-genderless"></i>
            `)}
            </div>
          </div>
        `;
  }
}

function initializeTable(data) {
  const custom_columns = [
    { title: "Priority", data: "Priority", visible: false },
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
              ${myUniqueFormatDate(row.Year, row.Month, row.Date)}
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
  ];

  const table = new DataTable("#works__table", {
    dom: "Brt", // buttons, processing, table
    autoWidth: false,
    paging: false,
    data: data,
    columns: custom_columns,
    order: [
      [0, "asc"], // Priority
      [5, "desc"], // Year
      [6, "desc"], // Month
      [7, "desc"], // Date
      [3, "asc"], // Title
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

    const renderableData = await data.filter(isRenderable);
    var table = initializeTable(renderableData);

    $(".wrapper__loading").hide();
  }

  main();
});
