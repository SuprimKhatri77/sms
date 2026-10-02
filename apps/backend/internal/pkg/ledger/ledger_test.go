package ledger

import "testing"

func fields(errs []FieldError) []string {
	out := make([]string, len(errs))
	for i, e := range errs {
		out[i] = e.Field
	}
	return out
}

func TestValidate(t *testing.T) {
	tests := []struct {
		name       string
		ledgerType string
		fields     Fields
		want       []string // fields rejected, in order
	}{
		{"plain cash entry", TypeCash, Fields{}, nil},
		{"cash with a bank account", TypeCash, Fields{BankAccount: true}, []string{"bankAccountID"}},
		{"cash with a supplier", TypeCash, Fields{Supplier: true}, []string{"supplierID"}},
		{"cash with supplier-only fields", TypeCash, Fields{AccountGroup: true, PaymentType: true, StockIn: true},
			[]string{"accountGroupID", "paymentType", "stockInID"}},
		{"bank entry needs an account", TypeBank, Fields{}, []string{"bankAccountID"}},
		{"bank entry with its account", TypeBank, Fields{BankAccount: true}, nil},
		{"bank with an account group", TypeBank, Fields{BankAccount: true, AccountGroup: true}, []string{"accountGroupID"}},
		{"supplier entry needs a supplier", TypeSupplier, Fields{}, []string{"supplierID"}},
		{"supplier with every optional field", TypeSupplier,
			Fields{Supplier: true, AccountGroup: true, PaymentType: true, StockIn: true}, nil},
		// a supplier paid by bank names the account the money left from
		{"supplier payment from a bank account", TypeSupplier, Fields{Supplier: true, PaymentType: true, BankAccount: true}, nil},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := fields(Validate(tt.ledgerType, tt.fields))
			if len(got) != len(tt.want) {
				t.Fatalf("rejected %v, want %v", got, tt.want)
			}
			for i := range got {
				if got[i] != tt.want[i] {
					t.Errorf("rejected %v, want %v", got, tt.want)
				}
			}
		})
	}
}

func TestCounterLedger(t *testing.T) {
	if got := CounterLedger(PaymentCash); got != TypeCash {
		t.Errorf("CounterLedger(cash) = %q, want %q", got, TypeCash)
	}
	if got := CounterLedger(PaymentBank); got != TypeBank {
		t.Errorf("CounterLedger(bank) = %q, want %q", got, TypeBank)
	}
}

func TestRecordsPayment(t *testing.T) {
	if !RecordsPayment(TypeSupplier, "dr", "cash") {
		t.Error("a supplier debit with a payment type is a payment")
	}
	if RecordsPayment(TypeSupplier, "cr", "cash") {
		t.Error("a supplier credit is never a payment")
	}
	if RecordsPayment(TypeSupplier, "dr", "") {
		t.Error("a supplier debit without a payment type moves no money")
	}
	if RecordsPayment(TypeCash, "dr", "cash") {
		t.Error("only supplier entries record a cash/bank side")
	}
}

func TestLockedMessage(t *testing.T) {
	if LockedMessage(SourceManual) != "" {
		t.Error("manual entries are editable")
	}
	for _, src := range []string{SourcePurchase, SourceStudentPayment, SourceSupplierPayment} {
		if LockedMessage(src) == "" {
			t.Errorf("%s entries must not be editable here", src)
		}
	}
}
