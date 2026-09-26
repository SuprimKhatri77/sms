package export

import (
	"io"

	"github.com/xuri/excelize/v2"
)

// numFmtMoney is Excel's built-in "#,##0.00" number format.
const numFmtMoney = 4

// writeXLSX writes the title and meta lines, a blank row, then the table
// with a bold, frozen header row and a bold totals row. Money cells are
// real numbers so they can be summed and filtered in Excel.
func writeXLSX(w io.Writer, t Table) error {
	f := excelize.NewFile()
	defer f.Close()

	sheet := "Sheet1"
	if err := f.SetSheetName(sheet, "Export"); err != nil {
		return err
	}
	sheet = "Export"

	titleStyle, err := f.NewStyle(&excelize.Style{Font: &excelize.Font{Bold: true, Size: 14}})
	if err != nil {
		return err
	}
	metaStyle, err := f.NewStyle(&excelize.Style{Font: &excelize.Font{Italic: true, Color: "666666"}})
	if err != nil {
		return err
	}
	headerStyle, err := f.NewStyle(&excelize.Style{
		Font:   &excelize.Font{Bold: true, Color: "FFFFFF"},
		Fill:   excelize.Fill{Type: "pattern", Pattern: 1, Color: []string{"2F4E40"}},
		Border: []excelize.Border{{Type: "bottom", Color: "2F4E40", Style: 1}},
	})
	if err != nil {
		return err
	}
	headerMoneyStyle, err := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "FFFFFF"},
		Fill:      excelize.Fill{Type: "pattern", Pattern: 1, Color: []string{"2F4E40"}},
		Alignment: &excelize.Alignment{Horizontal: "right"},
	})
	if err != nil {
		return err
	}
	moneyStyle, err := f.NewStyle(&excelize.Style{NumFmt: numFmtMoney})
	if err != nil {
		return err
	}
	totalStyle, err := f.NewStyle(&excelize.Style{
		Font:   &excelize.Font{Bold: true},
		Border: []excelize.Border{{Type: "top", Color: "2F4E40", Style: 1}},
	})
	if err != nil {
		return err
	}
	totalMoneyStyle, err := f.NewStyle(&excelize.Style{
		Font:   &excelize.Font{Bold: true},
		NumFmt: numFmtMoney,
		Border: []excelize.Border{{Type: "top", Color: "2F4E40", Style: 1}},
	})
	if err != nil {
		return err
	}

	row := 1
	if err := setCell(f, sheet, 1, row, t.Title, titleStyle); err != nil {
		return err
	}
	row++
	for _, line := range t.Meta {
		if err := setCell(f, sheet, 1, row, line, metaStyle); err != nil {
			return err
		}
		row++
	}
	row++ // blank row between the meta lines and the table

	headerRow := row
	for i, col := range t.Columns {
		style := headerStyle
		if col.rightAligned() {
			style = headerMoneyStyle
		}
		if err := setCell(f, sheet, i+1, row, col.Header, style); err != nil {
			return err
		}
		name, err := excelize.ColumnNumberToName(i + 1)
		if err != nil {
			return err
		}
		if err := f.SetColWidth(sheet, name, name, col.Width); err != nil {
			return err
		}
	}
	row++

	writeRow := func(cells []any, textStyle, moneyStyle int) error {
		for i, v := range cells {
			if m, ok := v.(Money); ok {
				if err := setCell(f, sheet, i+1, row, float64(m)/100, moneyStyle); err != nil {
					return err
				}
				continue
			}
			if n, ok := v.(Number); ok {
				if err := setCell(f, sheet, i+1, row, float64(n), textStyle); err != nil {
					return err
				}
				continue
			}
			if err := setCell(f, sheet, i+1, row, cellText(v), textStyle); err != nil {
				return err
			}
		}
		row++
		return nil
	}

	for _, cells := range t.Rows {
		if err := writeRow(cells, 0, moneyStyle); err != nil {
			return err
		}
	}
	if t.Totals != nil {
		if err := writeRow(t.Totals, totalStyle, totalMoneyStyle); err != nil {
			return err
		}
	}

	topLeft, err := excelize.CoordinatesToCellName(1, headerRow+1)
	if err != nil {
		return err
	}
	if err := f.SetPanes(sheet, &excelize.Panes{
		Freeze:      true,
		YSplit:      headerRow,
		TopLeftCell: topLeft,
		ActivePane:  "bottomLeft",
	}); err != nil {
		return err
	}

	return f.Write(w)
}

// setCell writes v at (col, row), both 1-based, and applies style unless it
// is 0 (the default style).
func setCell(f *excelize.File, sheet string, col, row int, v any, style int) error {
	cell, err := excelize.CoordinatesToCellName(col, row)
	if err != nil {
		return err
	}
	if err := f.SetCellValue(sheet, cell, v); err != nil {
		return err
	}
	if style == 0 {
		return nil
	}
	return f.SetCellStyle(sheet, cell, cell, style)
}
