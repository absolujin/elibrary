import { useMemo, useState } from "react";
import {
  bootstrapLibraryDirectoryRecords,
  libraryIntegrationModes,
  type LibraryDirectoryFilters
} from "@elibrary/domain";
import { createLibraryDirectoryViewModel } from "./library-directory";

const pageStyle = {
  minHeight: "100vh",
  margin: 0,
  background: "#F7FAF9",
  color: "#182A2D",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
} as const;

const shellStyle = {
  maxWidth: "1180px",
  margin: "0 auto",
  padding: "24px"
} as const;

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  padding: "16px 0 24px",
  borderBottom: "1px solid #D8E5E3"
} as const;

const filtersStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
  margin: "24px 0"
} as const;

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #D8E5E3",
  borderRadius: "6px",
  padding: "10px 12px",
  font: "inherit",
  background: "#FFFFFF",
  color: "#182A2D"
} as const;

const tableWrapStyle = {
  overflowX: "auto",
  border: "1px solid #D8E5E3",
  borderRadius: "8px",
  background: "#FFFFFF"
} as const;

const tableStyle = {
  width: "100%",
  minWidth: "920px",
  borderCollapse: "collapse"
} as const;

const headerCellStyle = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "1px solid #D8E5E3",
  fontSize: "13px",
  lineHeight: "18px",
  fontWeight: 600,
  color: "#4E6B70"
} as const;

const cellStyle = {
  padding: "12px",
  verticalAlign: "top",
  borderBottom: "1px solid #D8E5E3",
  fontSize: "14px",
  lineHeight: "20px"
} as const;

const badgeStyle = {
  display: "inline-block",
  borderRadius: "999px",
  border: "1px solid #D8E5E3",
  padding: "4px 8px",
  fontSize: "13px",
  lineHeight: "18px",
  fontWeight: 500
} as const;

export function App(): React.ReactElement {
  const [filters, setFilters] = useState<LibraryDirectoryFilters>({});
  const viewModel = useMemo(
    () => createLibraryDirectoryViewModel(bootstrapLibraryDirectoryRecords, filters),
    [filters]
  );

  function updateFilter(field: keyof LibraryDirectoryFilters, value: string): void {
    setFilters((current) => ({
      ...current,
      [field]: value === "" ? undefined : value
    }));
  }

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <header style={headerStyle}>
          <div>
            <h1 style={{ margin: 0, fontSize: "32px", lineHeight: "40px" }}>eLibrary</h1>
            <p style={{ margin: "4px 0 0", color: "#4E6B70" }}>Public electronic library directory</p>
          </div>
          <a href="#library-directory" style={{ color: "#00505A", fontWeight: 600 }}>
            Libraries
          </a>
        </header>

        <section id="library-directory" aria-labelledby="library-directory-title">
          <div style={{ marginTop: "32px" }}>
            <h2 id="library-directory-title" style={{ margin: 0, fontSize: "24px", lineHeight: "32px" }}>
              Public Library Directory
            </h2>
            <p style={{ margin: "4px 0 0", color: "#4E6B70" }}>
              {viewModel.resultCount} of {viewModel.totalCount} libraries
            </p>
          </div>

          <form style={filtersStyle}>
            <label>
              <span>Name</span>
              <input
                style={inputStyle}
                value={filters.name ?? ""}
                onChange={(event) => updateFilter("name", event.currentTarget.value)}
              />
            </label>
            <label>
              <span>Region</span>
              <input
                style={inputStyle}
                value={filters.region ?? ""}
                onChange={(event) => updateFilter("region", event.currentTarget.value)}
              />
            </label>
            <label>
              <span>Operator</span>
              <input
                style={inputStyle}
                value={filters.operator ?? ""}
                onChange={(event) => updateFilter("operator", event.currentTarget.value)}
              />
            </label>
            <label>
              <span>Integration</span>
              <select
                style={inputStyle}
                value={filters.integrationMode ?? ""}
                onChange={(event) => updateFilter("integrationMode", event.currentTarget.value)}
              >
                <option value="">All</option>
                {libraryIntegrationModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </label>
          </form>

          {viewModel.rows.length > 0 ? (
            <div style={tableWrapStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={headerCellStyle}>Library</th>
                    <th style={headerCellStyle}>Region</th>
                    <th style={headerCellStyle}>Operator</th>
                    <th style={headerCellStyle}>Eligibility</th>
                    <th style={headerCellStyle}>Links</th>
                    <th style={headerCellStyle}>Integration</th>
                  </tr>
                </thead>
                <tbody>
                  {viewModel.rows.map((library) => (
                    <tr key={library.id}>
                      <td style={cellStyle}>{library.name}</td>
                      <td style={cellStyle}>{library.region}</td>
                      <td style={cellStyle}>{library.operator}</td>
                      <td style={cellStyle}>{library.eligibilityConditions}</td>
                      <td style={cellStyle}>
                        {library.homepageUrl ? (
                          <a href={library.homepageUrl} rel="noopener noreferrer" target="_blank">
                            Homepage
                          </a>
                        ) : null}
                        {library.ebookServiceUrl ? (
                          <>
                            {library.homepageUrl ? <br /> : null}
                            <a href={library.ebookServiceUrl} rel="noopener noreferrer" target="_blank">
                              Ebook service
                            </a>
                          </>
                        ) : null}
                      </td>
                      <td style={cellStyle}>
                        <span style={badgeStyle}>{library.integrationLabel}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ ...tableWrapStyle, padding: "24px", color: "#4E6B70" }}>
              No public electronic libraries are configured yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
