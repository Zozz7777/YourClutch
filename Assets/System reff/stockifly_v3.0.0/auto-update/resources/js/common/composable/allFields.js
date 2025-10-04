import PaymentFields from "../../main/views/reports/payments/fields";
import StockAlertFields from "../../main/views/reports/stock-alert/fields";
import SalesSummaryFields from "../../main/views/reports/sales-summary/fields";
import StockSummaryFields from "../../main/views/reports/stock-summary/fields";
import RateListFields from "../../main/views/reports/rate-list/fields";
import ProductSalesSummaryFields from "../../main/views/reports/product-sales-summary/fields";
import ProfitLossFields from "../../main/views/reports/profit-loss/fields";
import UserFields from "../../main/views/reports/users/fields";


const allFields = () => {
    const paymentFieldData = PaymentFields();
    const stockAlertData = StockAlertFields();
    const salesSummaryData = SalesSummaryFields();
    const stockSummaryData = StockSummaryFields();
    const rateListtData = RateListFields();
    const productSalesSummaryData = ProductSalesSummaryFields();
    const profitLossData = ProfitLossFields();
    const userData = UserFields();

    const getColumns = (columnType) => {
        if (columnType == "payment_reports") {
            return paymentFieldData.paymentsColumns;
        } else if (columnType == "stock_alert_reports") {
            return stockAlertData.stockAlertColumns;
        } else if (columnType == "sales_summary_reports") {
            return salesSummaryData.salesSummaryColumns;
        } else if (columnType == "stock_summary_reports") {
            return stockSummaryData.exportColumns;
        } else if (columnType == "rate_list_reports") {
            return rateListtData.columns;
        } else if (columnType == "product_sales_summary_reports") {
            return productSalesSummaryData.columns;
        } else if (columnType == "user_reports") {
            return userData.exportColumns.value;
        } else if (columnType == "profit_loss_reports") {
            return profitLossData.columns;
        }
    };

    return {
        getColumns,
    }
}

export default allFields;
