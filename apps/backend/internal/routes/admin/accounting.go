package admin

import (
	"github.com/gin-gonic/gin"
	accountgroups "github.com/suprimkhatri77/sms/backend/internal/handlers/admin/accounting/account_groups"
	bankaccounts "github.com/suprimkhatri77/sms/backend/internal/handlers/admin/accounting/bank_accounts"
	"github.com/suprimkhatri77/sms/backend/internal/handlers/admin/accounting/banks"
	"github.com/suprimkhatri77/sms/backend/internal/handlers/admin/accounting/employees"
	"github.com/suprimkhatri77/sms/backend/internal/handlers/admin/accounting/ledger"
	primaryheads "github.com/suprimkhatri77/sms/backend/internal/handlers/admin/accounting/primary_heads"
	"github.com/suprimkhatri77/sms/backend/internal/handlers/admin/accounting/suppliers"
	"github.com/suprimkhatri77/sms/backend/internal/middleware"
	accountingRepository "github.com/suprimkhatri77/sms/backend/internal/repository/accounting"
	"github.com/suprimkhatri77/sms/backend/internal/routes/config"
)

func setupAdminAccountingRoutes(admin *gin.RouterGroup, cfg config.Config) {
	accounting := admin.Group("/accounting")

	// banks
	b := accounting.Group("/banks")
	b.GET("", banks.ListBanks(cfg.Queries))
	b.POST("", banks.CreateBank(cfg.Queries))
	b.PUT("/:bankID", banks.UpdateBank(cfg.Queries))
	b.DELETE("/:bankID", banks.DeleteBank(cfg.Queries))
	b.PUT("/:bankID/set-default", banks.SetDefaultBank(accountingRepository.NewBankTxRepository(cfg.Queries), cfg.PgxPool))

	// bank accounts
	b.GET("/accounts", bankaccounts.ListBankAccounts(cfg.Queries))
	b.GET("/accounts/dropdown", bankaccounts.ListBankAccountsForDropdown(cfg.Queries))
	b.POST("/:bankID/accounts", bankaccounts.CreateBankAccount(cfg.Queries))
	b.PUT("/accounts/:accountID", bankaccounts.UpdateBankAccount(cfg.Queries))
	b.DELETE("/accounts/:accountID", bankaccounts.DeleteBankAccount(cfg.Queries))
	b.PUT("/accounts/:accountID/set-default", bankaccounts.SetDefaultBankAccount(accountingRepository.NewBankAccountTxRepository(cfg.Queries), cfg.PgxPool))

	// ledgers (cash, bank, supplier, salary) — any admin can view and add
	// entries, only superadmin can edit or delete them
	l := accounting.Group("/ledgers")
	l.GET("", ledger.ListLedgerEntries(cfg.Queries))
	l.GET("/export", ledger.ExportLedgerEntries(cfg.Queries))
	l.GET("/summary", ledger.GetLedgerSummary(cfg.Queries))
	l.POST("", ledger.CreateLedgerEntry(cfg.LedgerRepo, cfg.PgxPool))
	lWrite := l.Group("", middleware.RequireRole("superadmin"))
	lWrite.PUT("/:entryID", ledger.UpdateLedgerEntry(cfg.LedgerRepo, cfg.PgxPool))
	lWrite.DELETE("/:entryID", ledger.DeleteLedgerEntry(cfg.LedgerRepo, cfg.PgxPool))

	// suppliers
	sup := accounting.Group("/suppliers")
	sup.GET("", suppliers.ListSuppliers(cfg.Queries))
	sup.POST("", suppliers.CreateSupplier(cfg.Queries))
	sup.PUT("/:supplierID", suppliers.UpdateSupplier(cfg.Queries))
	sup.DELETE("/:supplierID", suppliers.DeleteSupplier(cfg.Queries))

	// employees, who are paid through the salary ledger
	emp := accounting.Group("/employees")
	emp.GET("", employees.ListEmployees(cfg.Queries))
	emp.POST("", employees.CreateEmployee(cfg.Queries))
	emp.PUT("/:employeeID", employees.UpdateEmployee(cfg.Queries))
	emp.DELETE("/:employeeID", employees.DeleteEmployee(cfg.Queries))

	// primary heads — any admin can view, only superadmin can change
	ph := accounting.Group("/primary-heads")
	ph.GET("", primaryheads.ListPrimaryHeads(cfg.Queries))
	phWrite := ph.Group("", middleware.RequireRole("superadmin"))
	phWrite.POST("", primaryheads.CreatePrimaryHead(cfg.Queries))
	phWrite.PUT("/:headID", primaryheads.UpdatePrimaryHead(accountingRepository.NewPrimaryHeadTxRepository(cfg.Queries), cfg.PgxPool))
	phWrite.DELETE("/:headID", primaryheads.DeletePrimaryHead(cfg.Queries))

	// account groups — any admin can view, only superadmin can change
	ag := accounting.Group("/account-groups")
	ag.GET("", accountgroups.ListAccountGroups(cfg.Queries))
	agWrite := ag.Group("", middleware.RequireRole("superadmin"))
	agWrite.POST("", accountgroups.CreateAccountGroup(cfg.Queries))
	agWrite.PUT("/:groupID", accountgroups.UpdateAccountGroup(accountingRepository.NewAccountGroupTxRepository(cfg.Queries), cfg.PgxPool))
	agWrite.DELETE("/:groupID", accountgroups.DeleteAccountGroup(cfg.Queries))
}
