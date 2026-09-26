// Package export renders a table of rows as a downloadable CSV, XLSX or PDF
// file, so every admin list can offer the same "Export" formats.
package export

import (
	"bytes"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	bs "github.com/suprimkhatri77/go-bs"
)

type Format string

const (
	FormatCSV  Format = "csv"
	FormatXLSX Format = "xlsx"
	FormatPDF  Format = "pdf"
)

// MaxRows caps how many rows a single export may contain; handlers check
// the matching count query against it before fetching.
const MaxRows = 50000

// Money is an amount in paisa. A cell holding Money is written as a number
// in rupees (a numeric cell in XLSX, "1234.50" in CSV, "1,234.50" in PDF).
type Money int64

// Number is a plain numeric value such as a quantity. It is written as a
// number cell in XLSX and without trailing zeros elsewhere ("5", "1.25").
type Number float64

type Column struct {
	Header string
	Money  bool
	// Numeric right-aligns a column of Number cells, as Money columns are.
	Numeric bool
	// Width is the column's relative width, in characters: used as the XLSX
	// column width and as the column's share of the PDF page width.
	Width float64
}

// Table is what gets exported. Each row holds one cell per column; a cell
// is a string, Money or Number. Totals, when set, is written as a final bold
// row with the same shape.
type Table struct {
	Title   string
	Meta    []string
	Columns []Column
	Rows    [][]any
	Totals  []any
}

// Nepal has been on a fixed UTC+5:45 with no daylight saving since 1986, so
// a fixed zone is used instead of time.LoadLocation, which needs tzdata the
// alpine runtime image doesn't ship.
var nepalTime = time.FixedZone("NPT", int((5*time.Hour + 45*time.Minute).Seconds()))

// DateAD formats t as its YYYY-MM-DD calendar date in Nepal time.
func DateAD(t time.Time) string {
	return t.In(nepalTime).Format("2006-01-02")
}

// DateBS formats t as its YYYY-MM-DD Bikram Sambat date in Nepal time, or
// "" if t is outside the range go-bs supports.
func DateBS(t time.Time) string {
	d, err := bs.ADToBS(t.In(nepalTime))
	if err != nil {
		return ""
	}
	return d.String()
}

// DateFromBS converts a stored BS "YYYY-MM-DD" date to its AD date in the
// same format, or "" if it can't be parsed or converted.
func DateFromBS(bsDate string) string {
	d, err := bs.Parse(bsDate)
	if err != nil {
		return ""
	}
	ad, err := bs.BSToAD(d)
	if err != nil {
		return ""
	}
	return ad.Format("2006-01-02")
}

// Filters joins the non-empty filter descriptions into a meta line, e.g.
// "Filters: From 2026-01-01 to 2026-03-31 · Search: ram". It returns no
// lines if every part is empty.
func Filters(parts ...string) []string {
	var nonEmpty []string
	for _, p := range parts {
		if p != "" {
			nonEmpty = append(nonEmpty, p)
		}
	}
	if len(nonEmpty) == 0 {
		return nil
	}
	return []string{"Filters: " + strings.Join(nonEmpty, " · ")}
}

// Labelled describes a single filter as "Label: value", or "" when value
// is empty.
func Labelled(label, value string) string {
	if value == "" {
		return ""
	}
	return label + ": " + value
}

// DateRange describes a from/to filter pair of AD YYYY-MM-DD dates ("From X
// to Y", "From X", "Up to Y"), each with its BS date since the admin picks
// the range in BS, or "" when neither is set.
func DateRange(from, to string) string {
	from, to = withBS(from), withBS(to)
	switch {
	case from != "" && to != "":
		return fmt.Sprintf("From %s to %s", from, to)
	case from != "":
		return "From " + from
	case to != "":
		return "Up to " + to
	}
	return ""
}

// BSDateRange is DateRange for a from/to pair of BS YYYY-MM-DD dates (the
// inventory filters), each followed by its AD date.
func BSDateRange(from, to string) string {
	from, to = withAD(from), withAD(to)
	switch {
	case from != "" && to != "":
		return fmt.Sprintf("From %s to %s", from, to)
	case from != "":
		return "From " + from
	case to != "":
		return "Up to " + to
	}
	return ""
}

// withAD turns a BS "YYYY-MM-DD" into "YYYY-MM-DD (AD YYYY-MM-DD)", leaving
// it as is if it can't be converted.
func withAD(bsDate string) string {
	ad := DateFromBS(bsDate)
	if ad == "" {
		return bsDate
	}
	return fmt.Sprintf("%s (AD %s)", bsDate, ad)
}

// withBS turns an AD "YYYY-MM-DD" into "YYYY-MM-DD (BS YYYY-MM-DD)", leaving
// it as is if it can't be parsed or converted.
func withBS(ad string) string {
	t, err := time.Parse("2006-01-02", ad)
	if err != nil {
		return ad
	}
	d, err := bs.ADToBS(t)
	if err != nil {
		return ad
	}
	return fmt.Sprintf("%s (BS %s)", ad, d)
}

// Write renders t in the given format and sends it as an attachment named
// "<baseName>-<today>.<ext>". The file is built in memory first, so on
// error nothing has been written and the caller can still send a JSON error.
func Write(c *gin.Context, format Format, baseName string, t Table) error {
	now := time.Now()
	t.Meta = append(t.Meta, fmt.Sprintf("Generated %s (BS %s)", DateAD(now), DateBS(now)))

	var buf bytes.Buffer
	var contentType string
	var err error

	switch format {
	case FormatCSV:
		contentType = "text/csv; charset=utf-8"
		err = writeCSV(&buf, t)
	case FormatXLSX:
		contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		err = writeXLSX(&buf, t)
	case FormatPDF:
		contentType = "application/pdf"
		err = writePDF(&buf, t)
	default:
		return fmt.Errorf("unsupported export format %q", format)
	}
	if err != nil {
		return err
	}

	filename := fmt.Sprintf("%s-%s.%s", baseName, DateAD(now), format)
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	c.Data(http.StatusOK, contentType, buf.Bytes())
	return nil
}

// cellText is the plain-text form of a cell; Money is written as rupees
// with two decimals and no grouping ("1234.50", "-40.00").
func cellText(v any) string {
	switch val := v.(type) {
	case nil:
		return ""
	case string:
		return val
	case Money:
		return formatRupees(int64(val), false)
	case Number:
		return strconv.FormatFloat(float64(val), 'f', -1, 64)
	default:
		return fmt.Sprint(val)
	}
}

// DebitCredit places a ledger entry's amount in the Debit or Credit column
// by its entry type ("dr" or "cr"), leaving the other column blank.
func DebitCredit(entryType string, paisa int64) (debit, credit any) {
	if entryType == "dr" {
		return Money(paisa), ""
	}
	return "", Money(paisa)
}

// EntryTypeLabel is the D/C column text for a ledger entry type.
func EntryTypeLabel(entryType string) string {
	switch entryType {
	case "dr":
		return "Dr"
	case "cr":
		return "Cr"
	}
	return entryType
}

// Rupees formats paisa with thousands separators for a meta line, e.g. a
// ledger's balance ("1,234.50").
func Rupees(paisa int64) string {
	return formatRupees(paisa, true)
}

// rightAligned reports whether a column holds numbers (money or plain).
func (col Column) rightAligned() bool {
	return col.Money || col.Numeric
}

// formatRupees formats paisa as rupees with two decimals, optionally with
// thousands separators ("1,234,567.50").
func formatRupees(paisa int64, grouped bool) string {
	sign := ""
	if paisa < 0 {
		sign = "-"
		paisa = -paisa
	}
	whole := fmt.Sprintf("%d", paisa/100)
	if grouped {
		for i := len(whole) - 3; i > 0; i -= 3 {
			whole = whole[:i] + "," + whole[i:]
		}
	}
	return fmt.Sprintf("%s%s.%02d", sign, whole, paisa%100)
}
