package admin

import (
	"github.com/gin-gonic/gin"
	accountgroups "github.com/suprimkhatri77/sms/backend/internal/handlers/admin/accounting/account_groups"
	bankaccounts "github.com/suprimkhatri77/sms/backend/internal/handlers/admin/accounting/bank_accounts"
	bankledger "github.com/suprimkhatri77/sms/backend/internal/handlers/admin/accounting/bank_ledger"
	"github.com/suprimkhatri77/sms/backend/internal/handlers/admin/accounting/banks"
	cashledger "github.com/suprimkhatri77/sms/backend/internal/handlers/admin/accounting/cash_ledger"
	primaryheads "github.com/suprimkhatri77/sms/backend/internal/handlers/admin/accounting/primary_heads"
	supplierledger "github.com/suprimkhatri77/sms/backend/internal/handlers/admin/accounting/supplier_ledger"
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

	// bank ledger
	b.GET("/ledger", bankledger.ListBankLedger(cfg.Queries))
	b.GET("/ledger/export", bankledger.ExportBankLedger(cfg.Queries))
	b.GET("/ledger/summary", bankledger.GetBankLedgerSummary(cfg.Queries))
	b.POST("/ledger/:accountID", bankledger.CreateBankLedgerEntry(cfg.Queries))

	// bank accounts
	b.GET("/accounts", bankaccounts.ListBankAccounts(cfg.Queries))
	b.GET("/accounts/dropdown", bankaccounts.ListBankAccountsForDropdown(cfg.Queries))
	b.POST("/:bankID/accounts", bankaccounts.CreateBankAccount(cfg.Queries))
	b.PUT("/accounts/:accountID", bankaccounts.UpdateBankAccount(cfg.Queries))
	b.DELETE("/accounts/:accountID", bankaccounts.DeleteBankAccount(cfg.Queries))
	b.PUT("/accounts/:accountID/set-default", bankaccounts.SetDefaultBankAccount(accountingRepository.NewBankAccountTxRepository(cfg.Queries), cfg.PgxPool))

	// cash ledger
	cash := accounting.Group("/cash-ledger")
	cash.GET("", cashledger.ListCashLedger(cfg.Queries))
	cash.GET("/export", cashledger.ExportCashLedger(cfg.Queries))
	cash.GET("/summary", cashledger.GetCashLedgerSummary(cfg.Queries))
	cash.POST("", cashledger.CreateCashLedgerEntry(cfg.Queries))

	// suppliers
	sup := accounting.Group("/suppliers")
	sup.GET("", suppliers.ListSuppliers(cfg.Queries))
	sup.POST("", suppliers.CreateSupplier(cfg.Queries))
	sup.PUT("/:supplierID", suppliers.UpdateSupplier(cfg.Queries))
	sup.DELETE("/:supplierID", suppliers.DeleteSupplier(cfg.Queries))

	// supplier ledger
	sup.GET("/ledger", supplierledger.ListSupplierLedger(cfg.Queries))
	sup.GET("/ledger/export", supplierledger.ExportSupplierLedger(cfg.Queries))
	sup.GET("/ledger/summary", supplierledger.GetSupplierLedgerSummary(cfg.Queries))
	sup.POST("/:supplierID/ledger", supplierledger.CreateSupplierLedgerEntry(cfg.SupplierLedgerRepo, cfg.PgxPool))

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
