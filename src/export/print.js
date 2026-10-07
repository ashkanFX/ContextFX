document.addEventListener("DOMContentLoaded", () => {
  const rows = document.getElementById("vocabularyRows");
  const summary = document.getElementById("reportSummary");
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const themeLabel = document.getElementById("themeLabel");
  const printButton = document.getElementById("printReport");

  function setTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeIcon.textContent = isDark ? "☀️" : "🌙";
    themeLabel.textContent = isDark ? "Light mode" : "Dark mode";
    localStorage.setItem("contextfx-export-theme", isDark ? "dark" : "light");
  }

  function appendCell(row, value, className) {
    const cell = document.createElement("td");
    if (className) cell.className = className;
    cell.textContent = value;
    row.appendChild(cell);
    return cell;
  }

  function appendPriority(row, priority) {
    const cell = document.createElement("td");
    const normalizedPriority = (priority || "normal").toLowerCase();
    const safePriority = ["low", "normal", "high", "urgent"].includes(
      normalizedPriority,
    )
      ? normalizedPriority
      : "normal";
    const badge = document.createElement("span");
    badge.className = `priority-badge priority-${safePriority}`;
    badge.textContent =
      safePriority.charAt(0).toUpperCase() + safePriority.slice(1);
    cell.appendChild(badge);
    row.appendChild(cell);
  }

  themeToggle.addEventListener("click", () => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
  printButton.addEventListener("click", () => window.print());
  setTheme(localStorage.getItem("contextfx-export-theme") || "light");

  chrome.storage.local.get({ vocab: [] }, (result) => {
    const groups = ContextFXVocabulary.group(result.vocab || []);
    const totalUses = groups.reduce((total, group) => total + group.usageCount, 0);
    const totalSites = new Set(
      groups.flatMap((group) =>
        group.entries
          .filter((entry) => entry.url)
          .map((entry) => ContextFXVocabulary.getSiteName(entry.url)),
      ),
    ).size;

    document.getElementById("statWords").textContent = String(groups.length);
    document.getElementById("statUses").textContent = String(totalUses);
    document.getElementById("statSites").textContent = String(totalSites);
    summary.textContent = `Updated ${new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`;

    if (!groups.length) {
      const row = document.createElement("tr");
      appendCell(row, "🪴 Your word garden is ready to grow.", "empty-report").colSpan = 6;
      rows.appendChild(row);
    }

    groups.forEach((group) => {
      const row = document.createElement("tr");
      const translation = [...group.entries]
        .sort((first, second) => (second.created || 0) - (first.created || 0))
        .find((entry) => entry.persianTranslation)?.persianTranslation;
      const sourceEntries = [
        ...new Map(
          group.entries
            .filter((entry) => entry.url)
            .map((entry) => [entry.url, entry]),
        ).values(),
      ];

      appendCell(row, group.word, "report-word");
      const meaningCell = appendCell(row, translation || "—", "report-meaning");
      meaningCell.lang = translation ? "fa" : "en";
      meaningCell.dir = translation ? "rtl" : "ltr";
      appendCell(row, String(group.usageCount), "numeric-cell");
      appendCell(
        row,
        String(
          new Set(
            group.entries
              .filter((entry) => entry.url)
              .map((entry) => ContextFXVocabulary.getSiteName(entry.url)),
          ).size,
        ),
        "numeric-cell",
      );
      appendPriority(row, group.priority);

      const sources = document.createElement("td");
      sources.className = "source-cell";
      if (!sourceEntries.length) {
        sources.textContent = "Local entry";
      } else {
        sourceEntries.forEach((entry, index) => {
          if (index) sources.appendChild(document.createElement("br"));
          const link = document.createElement("a");
          link.href = entry.url;
          link.textContent =
            entry.title || ContextFXVocabulary.getSiteName(entry.url);
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          sources.appendChild(link);
        });
      }
      row.appendChild(sources);
      rows.appendChild(row);
    });
  });
});
