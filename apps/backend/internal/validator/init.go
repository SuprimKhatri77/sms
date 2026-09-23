package validator

import (
	"regexp"
	"strings"
	"sync"
	"time"

	bs "github.com/suprimkhatri77/go-bs"

	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

var once sync.Once

func Init() {
	once.Do(func() {
		v, ok := binding.Validator.Engine().(*validator.Validate)
		if !ok {
			return
		}

		v.RegisterValidation("alphaspace", func(fl validator.FieldLevel) bool {
			// only letters (upper+lower) and spaces allowed
			return regexp.MustCompile(`^[a-zA-Z\s]+$`).MatchString(fl.Field().String())
		})

		v.RegisterValidation("nepal_phone", func(fl validator.FieldLevel) bool {
			phone := fl.Field().String()
			matched, _ := regexp.MatchString(`^(98|97)\d{8}$`, phone)
			return matched
		})

		v.RegisterValidation("date_format", func(fl validator.FieldLevel) bool {
			_, err := time.Parse("2006-01-02", fl.Field().String())
			return err == nil
		})

		v.RegisterValidation("notblank", func(fl validator.FieldLevel) bool {
			return strings.TrimSpace(fl.Field().String()) != ""
		})

		v.RegisterValidation("bs_date", func(fl validator.FieldLevel) bool {
			_, err := bs.Parse(fl.Field().String())
			return err == nil
		})

		v.RegisterValidation("bank_account_no", func(fl validator.FieldLevel) bool {
			val := fl.Field().String()
			if val == "" {
				return true
			}
			matched, _ := regexp.MatchString(`^\d{9,20}$`, val)
			return matched
		})

		v.RegisterValidation("nepal_vat", func(fl validator.FieldLevel) bool {
			val := fl.Field().String()
			if val == "" {
				return true
			}
			matched, _ := regexp.MatchString(`^[0-9]{9}$`, val)
			return matched
		})
	})
}
