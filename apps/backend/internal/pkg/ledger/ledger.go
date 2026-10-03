// Package ledger describes the ledger types that share the ledger_entries
// table and which fields each one takes. Adding a ledger type is an entry in
// Types (plus widening the table's ledger_type CHECK, and a party column if
// the new type has its own kind of party).
package ledger

import "strings"

const (
	TypeCash     = "cash"
	TypeBank     = "bank"
	TypeSupplier = "supplier"
	TypeSalary   = "salary"
)

// Where an entry came from. Only manual entries are edited from the ledger
// page; the rest belong to the purchase or payment that wrote them.
const (
	SourceManual          = "manual"
	SourcePurchase        = "purchase"
	SourceStudentPayment  = "student_payment"
	SourceSupplierPayment = "supplier_payment"
	SourceSalaryPayment   = "salary_payment"
)

// Party is who (or what account) an entry is with.
type Party int

const (
	PartyNone Party = iota
	PartyBankAccount
	PartySupplier
	PartyEmployee
)

type Spec struct {
	Label string
	Party Party
	// AccountGroup lets an entry be tagged with an account group.
	AccountGroup bool
	// PaymentType is how a payment was made, cash or bank; a debit with one
	// also records the matching cash/bank debit (see CounterLedger), marked
	// with PaymentSource.
	PaymentType   bool
	PaymentSource string
	// StockLink lets an entry point at the purchase it's about.
	StockLink bool
}

var Types = map[string]Spec{
	TypeCash:     {Label: "Cash", Party: PartyNone},
	TypeBank:     {Label: "Bank", Party: PartyBankAccount},
	TypeSupplier: {Label: "Supplier", Party: PartySupplier, AccountGroup: true, PaymentType: true, PaymentSource: SourceSupplierPayment, StockLink: true},
	TypeSalary:   {Label: "Salary", Party: PartyEmployee, AccountGroup: true, PaymentType: true, PaymentSource: SourceSalaryPayment},
}

// TypeNames lists the ledger types for a `oneof` binding tag and error text.
const TypeNames = "cash bank supplier salary"

// Fields says which of the type-specific fields an entry carries.
type Fields struct {
	BankAccount  bool
	Supplier     bool
	Employee     bool
	AccountGroup bool
	PaymentType  bool
	StockIn      bool
}

// FieldError is a field that doesn't belong on (or is missing from) an entry
// of the given type; Field is the request's JSON name.
type FieldError struct {
	Field   string
	Message string
}

// Validate checks the type-specific fields against the type's spec. The type
// itself must already be valid.
func Validate(ledgerType string, f Fields) []FieldError {
	spec := Types[ledgerType]
	var errs []FieldError
	notFor := func(field, what string) {
		errs = append(errs, FieldError{Field: field, Message: what + " isn't used by " + strings.ToLower(spec.Label) + " entries"})
	}

	switch {
	case spec.Party == PartyBankAccount && !f.BankAccount:
		errs = append(errs, FieldError{Field: "bankAccountID", Message: "Choose a bank account"})
	case spec.Party != PartyBankAccount && f.BankAccount && !spec.PaymentType:
		notFor("bankAccountID", "A bank account")
	}
	if spec.Party == PartySupplier && !f.Supplier {
		errs = append(errs, FieldError{Field: "supplierID", Message: "Choose a supplier"})
	} else if spec.Party != PartySupplier && f.Supplier {
		notFor("supplierID", "A supplier")
	}
	if spec.Party == PartyEmployee && !f.Employee {
		errs = append(errs, FieldError{Field: "employeeID", Message: "Choose an employee"})
	} else if spec.Party != PartyEmployee && f.Employee {
		notFor("employeeID", "An employee")
	}
	if f.AccountGroup && !spec.AccountGroup {
		notFor("accountGroupID", "An account group")
	}
	if f.PaymentType && !spec.PaymentType {
		notFor("paymentType", "A payment type")
	}
	if f.StockIn && !spec.StockLink {
		notFor("stockInID", "A purchase link")
	}
	return errs
}

// Payment types a supplier or salary payment can have.
const (
	PaymentCash = "cash"
	PaymentBank = "bank"
)

// CounterLedger is where a payment's money went out from: the cash
// ledger for a cash payment, a bank account for a bank one.
func CounterLedger(paymentType string) string {
	if paymentType == PaymentCash {
		return TypeCash
	}
	return TypeBank
}

// RecordsPayment reports whether an entry is a payment (a supplier or salary
// debit) that also records a cash/bank debit.
func RecordsPayment(ledgerType, entryType, paymentType string) bool {
	return Types[ledgerType].PaymentType && entryType == "dr" && paymentType != ""
}

// LockedMessage explains why an entry can't be edited here and where to
// change it instead; "" means it's a manual entry and can be edited.
func LockedMessage(source string) string {
	switch source {
	case SourcePurchase:
		return "Recorded by a purchase; edit or delete the purchase instead"
	case SourceStudentPayment:
		return "Recorded by a student payment and can't be changed here"
	case SourceSupplierPayment:
		return "Part of a supplier payment; edit or delete the supplier entry instead"
	case SourceSalaryPayment:
		return "Part of a salary payment; edit or delete the salary entry instead"
	}
	return ""
}
