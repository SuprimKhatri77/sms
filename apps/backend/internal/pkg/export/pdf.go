package export

import (
	"fmt"
	"io"

	"github.com/go-pdf/fpdf"
)

const (
	pdfMargin     = 10.0
	pdfFooterSpan = 12.0 // space kept free at the bottom for the page footer
	pdfHeaderH    = 7.0
	pdfRowH       = 6.0
	pdfCellPad    = 1.5
)

// writePDF writes an A4 landscape table: title and meta lines on the first
// page, the column header repeated on every page, money right-aligned with
// thousands separators, a bold totals row and "Page x of y" in the footer.
func writePDF(w io.Writer, t Table) error {
	pdf := fpdf.New("L", "mm", "A4", "")
	pdf.SetMargins(pdfMargin, pdfMargin, pdfMargin)
	pdf.SetAutoPageBreak(false, pdfFooterSpan)
	pdf.SetCellMargin(pdfCellPad)
	pdf.AliasNbPages("")

	// The core Helvetica font is cp1252-encoded; tr maps UTF-8 text onto it.
	tr := pdf.UnicodeTranslatorFromDescriptor("")

	pageW, pageH := pdf.GetPageSize()
	usableW := pageW - 2*pdfMargin

	pdf.SetFooterFunc(func() {
		pdf.SetY(-pdfMargin)
		pdf.SetFont("Helvetica", "", 7)
		pdf.SetTextColor(120, 120, 120)
		pdf.CellFormat(usableW/2, 4, tr(t.Title), "", 0, "L", false, 0, "")
		pdf.CellFormat(usableW/2, 4, fmt.Sprintf("Page %d of {nb}", pdf.PageNo()), "", 0, "R", false, 0, "")
	})

	var totalWidth float64
	for _, col := range t.Columns {
		totalWidth += col.Width
	}
	widths := make([]float64, len(t.Columns))
	for i, col := range t.Columns {
		widths[i] = usableW * col.Width / totalWidth
	}

	// fit truncates s with "..." so it fits inside a cell of width w. s is
	// already cp1252 (one byte per character), so byte slicing is safe; the
	// cut point is binary-searched since remarks and notes can be long.
	fit := func(s string, w float64) string {
		max := w - 2*pdfCellPad
		if pdf.GetStringWidth(s) <= max {
			return s
		}
		lo, hi := 0, len(s)
		for lo < hi {
			mid := (lo + hi + 1) / 2
			if pdf.GetStringWidth(s[:mid]+"...") <= max {
				lo = mid
			} else {
				hi = mid - 1
			}
		}
		return s[:lo] + "..."
	}

	align := func(i int) string {
		if t.Columns[i].rightAligned() {
			return "R"
		}
		return "L"
	}

	drawHeader := func() {
		pdf.SetFont("Helvetica", "B", 8)
		pdf.SetFillColor(47, 78, 64)
		pdf.SetTextColor(255, 255, 255)
		for i, col := range t.Columns {
			pdf.CellFormat(widths[i], pdfHeaderH, fit(tr(col.Header), widths[i]), "", 0, align(i), true, 0, "")
		}
		pdf.Ln(pdfHeaderH)
	}

	// ensureRoom starts a new page (with the header) if a row won't fit.
	ensureRoom := func() {
		if pdf.GetY()+pdfRowH > pageH-pdfFooterSpan {
			pdf.AddPage()
			drawHeader()
		}
	}

	pdf.AddPage()

	pdf.SetFont("Helvetica", "B", 14)
	pdf.SetTextColor(47, 78, 64)
	pdf.CellFormat(usableW, 8, tr(t.Title), "", 1, "L", false, 0, "")
	pdf.SetFont("Helvetica", "I", 8)
	pdf.SetTextColor(110, 110, 110)
	for _, line := range t.Meta {
		pdf.CellFormat(usableW, 4.5, tr(line), "", 1, "L", false, 0, "")
	}
	pdf.Ln(3)

	drawHeader()

	pdf.SetDrawColor(225, 222, 215)
	for n, cells := range t.Rows {
		ensureRoom()
		pdf.SetFont("Helvetica", "", 8)
		pdf.SetTextColor(26, 26, 26)
		pdf.SetFillColor(248, 246, 241)
		zebra := n%2 == 1
		for i, v := range cells {
			text := cellText(v)
			if m, ok := v.(Money); ok {
				text = formatRupees(int64(m), true)
			}
			pdf.CellFormat(widths[i], pdfRowH, fit(tr(text), widths[i]), "B", 0, align(i), zebra, 0, "")
		}
		pdf.Ln(pdfRowH)
	}

	if len(t.Rows) == 0 {
		ensureRoom()
		pdf.SetFont("Helvetica", "I", 8)
		pdf.SetTextColor(110, 110, 110)
		pdf.CellFormat(usableW, pdfRowH, "No records match these filters.", "B", 1, "C", false, 0, "")
	}

	if t.Totals != nil {
		ensureRoom()
		pdf.SetFont("Helvetica", "B", 8)
		pdf.SetTextColor(26, 26, 26)
		pdf.SetDrawColor(47, 78, 64)
		for i, v := range t.Totals {
			text := cellText(v)
			if m, ok := v.(Money); ok {
				text = formatRupees(int64(m), true)
			}
			pdf.CellFormat(widths[i], pdfRowH, fit(tr(text), widths[i]), "T", 0, align(i), false, 0, "")
		}
		pdf.Ln(pdfRowH)
	}

	return pdf.Output(w)
}
