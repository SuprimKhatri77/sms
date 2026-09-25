package utils

import (
	"fmt"
	"time"

	bs "github.com/suprimkhatri77/go-bs"
)

// ValidateBSMatchesAD confirms bsDateStr and the already-parsed adDate
// represent the same real calendar day, catching a frontend BS->AD
// conversion (bikram-sambat-js) that disagrees with this package's own
// conversion for the same input.
func ValidateBSMatchesAD(bsDateStr string, adDate time.Time) error {
	bsParsed, err := bs.Parse(bsDateStr)
	if err != nil {
		return err
	}

	convertedAD, err := bs.BSToAD(bsParsed)
	if err != nil {
		return err
	}

	if convertedAD.Year() != adDate.Year() || convertedAD.Month() != adDate.Month() || convertedAD.Day() != adDate.Day() {
		return fmt.Errorf("BS date %s does not correspond to AD date %s", bsDateStr, adDate.Format("2006-01-02"))
	}

	return nil
}

// BSToAD converts a BS date string (YYYY-MM-DD) to its AD date at UTC
// midnight — the same shape time.Parse("2006-01-02", ...) gives the AD date
// the create-purchase flow stores on its supplier ledger entry.
func BSToAD(bsDateStr string) (time.Time, error) {
	bsParsed, err := bs.Parse(bsDateStr)
	if err != nil {
		return time.Time{}, err
	}

	ad, err := bs.BSToAD(bsParsed)
	if err != nil {
		return time.Time{}, err
	}

	return time.Date(ad.Year(), ad.Month(), ad.Day(), 0, 0, 0, 0, time.UTC), nil
}
