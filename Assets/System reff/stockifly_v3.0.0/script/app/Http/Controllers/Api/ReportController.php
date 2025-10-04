<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\ApiBaseController;
use App\Models\Expense;
use App\Models\Order;
use App\Models\Payment;
use Examyou\RestAPI\ApiResponse;

class ReportController extends ApiBaseController
{
    public function profitLoss()
    {
        $request = request();
        $warehouse = warehouse();

        $sales = Order::where('order_type', 'sales');
        $purchases = Order::where('order_type', 'purchases');
        $salesReturns = Order::where('order_type', 'sales-returns');
        $purchaseReturns = Order::where('order_type', 'purchase-returns');
        $expenses = Expense::select('amount');

        $paymentReceived = Payment::where('payment_type', 'in');
        $paymentSent = Payment::where('payment_type', 'out');

        // Dates Filters
        if ($request->has('dates') && $request->dates != null && count($request->dates) > 0) {
            $dates = $request->dates;
            $startDate = $dates[0];
            $endDate = $dates[1];

            $sales = $sales->whereRaw('orders.order_date >= ?', [$startDate])
                ->whereRaw('orders.order_date <= ?', [$endDate]);
            $purchases = $purchases->whereRaw('orders.order_date >= ?', [$startDate])
                ->whereRaw('orders.order_date <= ?', [$endDate]);
            $salesReturns = $salesReturns->whereRaw('orders.order_date >= ?', [$startDate])
                ->whereRaw('orders.order_date <= ?', [$endDate]);
            $purchaseReturns = $purchaseReturns->whereRaw('orders.order_date >= ?', [$startDate])
                ->whereRaw('orders.order_date <= ?', [$endDate]);
            $expenses = $expenses->whereRaw('expenses.date >= ?', [$startDate])
                ->whereRaw('expenses.date <= ?', [$endDate]);

            $paymentReceived = $paymentReceived->whereRaw('payments.date >= ?', [$startDate])
                ->whereRaw('payments.date <= ?', [$endDate]);
            $paymentSent = $paymentSent->whereRaw('payments.date >= ?', [$startDate])
                ->whereRaw('payments.date <= ?', [$endDate]);
        }

        $sales = $sales->where('orders.warehouse_id', $warehouse->id);
        $purchases = $purchases->where('orders.warehouse_id', $warehouse->id);
        $salesReturns = $salesReturns->where('orders.warehouse_id', $warehouse->id);
        $purchaseReturns = $purchaseReturns->where('orders.warehouse_id', $warehouse->id);
        $expenses = $expenses->where('expenses.warehouse_id', $warehouse->id);

        $paymentReceived = $paymentReceived->where('payments.warehouse_id', $warehouse->id);
        $paymentSent = $paymentSent->where('payments.warehouse_id', $warehouse->id);

        $sales = $sales->sum('total');
        $purchases = $purchases->sum('total');
        $salesReturns = $salesReturns->sum('total');
        $purchaseReturns = $purchaseReturns->sum('total');
        $expenses = $expenses->sum('amount');

        $paymentReceived = $paymentReceived->sum('amount');
        $paymentSent = $paymentSent->sum('amount');

        $profit = $sales + $purchaseReturns - $purchases - $salesReturns - $expenses;
        $profitByPayment = $paymentReceived - $paymentSent - $expenses;

        return ApiResponse::make('Success', [
            'sales' => $sales,
            'purchases' => $purchases,
            'sales_returns' => $salesReturns,
            'purchase_returns' => $purchaseReturns,
            'expenses' => $expenses,
            'profit' => $profit,
            'payment_received' => $paymentReceived,
            'payment_sent' => $paymentSent,
            'profit_by_payment' => $profitByPayment,
        ]);
    }
}
