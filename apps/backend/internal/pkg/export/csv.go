package export

import (
	"encoding/csv"
	"io"
)

// writeCSV writes a header row, the data rows and the totals row. Title and
// meta lines are left out so the file stays a plain table that imports
// cleanly into other tools.
func writeCSV(w io.Writer, t Table) error {
	cw := csv.NewWriter(w)

	header := make([]string, len(t.Columns))
	for i, col := range t.Columns {
		header[i] = col.Header
	}
	if err := cw.Write(header); err != nil {
		return err
	}

	rows := t.Rows
	if t.Totals != nil {
		rows = append(rows[:len(rows):len(rows)], t.Totals)
	}
	for _, row := range rows {
		record := make([]string, len(row))
		for i, v := range row {
			if s, ok := v.(string); ok {
				record[i] = escapeFormula(s)
			} else {
				record[i] = cellText(v)
			}
		}
		if err := cw.Write(record); err != nil {
			return err
		}
	}

	cw.Flush()
	return cw.Error()
}

// escapeFormula stops a text cell from being run as a formula when the CSV
// is opened in a spreadsheet (names and remarks can come from the public
// admission form). Money cells never pass through here.
func escapeFormula(s string) string {
	if s == "" {
		return s
	}
	switch s[0] {
	case '=', '+', '-', '@', '\t', '\r':
		return "'" + s
	}
	return s
}
