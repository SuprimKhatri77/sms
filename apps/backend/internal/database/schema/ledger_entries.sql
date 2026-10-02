-- every ledger (cash, bank, supplier, ...) in one table, told apart by ledger_type
CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ledger_type TEXT NOT NULL,
    -- what wrote the entry: a person, or the purchase / payment it belongs to
    source TEXT NOT NULL DEFAULT 'manual',
    bank_account_id UUID CONSTRAINT ledger_entries_bank_account_id_fkey REFERENCES bank_accounts(id) ON DELETE RESTRICT,
    supplier_id UUID CONSTRAINT ledger_entries_supplier_id_fkey REFERENCES suppliers(id) ON DELETE RESTRICT,
    account_group_id UUID CONSTRAINT ledger_entries_account_group_id_fkey REFERENCES account_groups(id) ON DELETE RESTRICT,
    payment_id UUID CONSTRAINT ledger_entries_payment_id_fkey REFERENCES payments(id) ON DELETE RESTRICT,
    stock_in_id UUID CONSTRAINT ledger_entries_stock_in_id_fkey REFERENCES stock_in(id) ON DELETE SET NULL,
    -- on the cash/bank side of a supplier payment: the supplier entry it pays
    paired_entry_id UUID CONSTRAINT ledger_entries_paired_entry_id_fkey REFERENCES ledger_entries(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    bs_date TEXT NOT NULL,
    entry_type TEXT NOT NULL,
    amount BIGINT NOT NULL,
    description TEXT,
    payment_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ledger_entries_type_check CHECK (ledger_type IN ('cash', 'bank', 'supplier')),
    CONSTRAINT ledger_entries_source_check CHECK (source IN ('manual', 'purchase', 'student_payment', 'supplier_payment')),
    CONSTRAINT ledger_entries_entry_type_check CHECK (entry_type IN ('dr', 'cr')),
    CONSTRAINT ledger_entries_amount_check CHECK (amount > 0),
    -- how a supplier payment was made (000055 limited it to cash or bank)
    CONSTRAINT ledger_entries_payment_type_check CHECK (payment_type IS NULL OR payment_type IN ('cash', 'bank')),

    -- each ledger type's shape
    CONSTRAINT ledger_entries_cash_shape CHECK (ledger_type <> 'cash' OR (bank_account_id IS NULL AND supplier_id IS NULL)),
    CONSTRAINT ledger_entries_bank_shape CHECK (ledger_type <> 'bank' OR (bank_account_id IS NOT NULL AND supplier_id IS NULL)),
    CONSTRAINT ledger_entries_supplier_shape CHECK (ledger_type <> 'supplier' OR (supplier_id IS NOT NULL AND bank_account_id IS NULL AND payment_id IS NULL)),
    CONSTRAINT ledger_entries_supplier_fields CHECK (ledger_type = 'supplier' OR (stock_in_id IS NULL AND payment_type IS NULL)),

    -- each source's shape
    CONSTRAINT ledger_entries_student_payment_shape CHECK ((source = 'student_payment') = (payment_id IS NOT NULL)),
    CONSTRAINT ledger_entries_purchase_shape CHECK (source <> 'purchase' OR (ledger_type = 'supplier' AND entry_type = 'cr' AND stock_in_id IS NOT NULL)),
    CONSTRAINT ledger_entries_supplier_payment_shape CHECK (source <> 'supplier_payment' OR (ledger_type IN ('cash', 'bank') AND entry_type = 'dr')),
    CONSTRAINT ledger_entries_paired_shape CHECK ((source = 'supplier_payment') = (paired_entry_id IS NOT NULL)),
    CONSTRAINT ledger_entries_not_own_pair CHECK (paired_entry_id IS NULL OR paired_entry_id <> id)
);

-- one auto-recorded credit per purchase, one cash/bank side per supplier payment
CREATE UNIQUE INDEX ledger_entries_purchase_credit_key ON ledger_entries(stock_in_id) WHERE source = 'purchase';
CREATE UNIQUE INDEX ledger_entries_paired_entry_key ON ledger_entries(paired_entry_id) WHERE paired_entry_id IS NOT NULL;

CREATE INDEX idx_ledger_entries_type_date ON ledger_entries(ledger_type, date DESC);
CREATE INDEX idx_ledger_entries_date ON ledger_entries(date DESC);
CREATE INDEX idx_ledger_entries_bs_date ON ledger_entries(bs_date);
CREATE INDEX idx_ledger_entries_bank_account_id ON ledger_entries(bank_account_id);
CREATE INDEX idx_ledger_entries_supplier_id ON ledger_entries(supplier_id);
CREATE INDEX idx_ledger_entries_account_group_id ON ledger_entries(account_group_id);
CREATE INDEX idx_ledger_entries_payment_id ON ledger_entries(payment_id);
CREATE INDEX idx_ledger_entries_stock_in_id ON ledger_entries(stock_in_id);
