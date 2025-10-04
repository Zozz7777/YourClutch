<template>
	<AdminPageHeader>
		<template #header>
			<a-page-header :title="$t(`menu.profit_loss`)" class="p-0">
				<template #extra>
					<ExprotTable
						exportType="profit_loss_reports"
						tableName="profit-loss-reports-table"
						:title="`${$t('menu.profit_loss')} ${$t('menu.reports')}`"
					/>
				</template>
			</a-page-header>
		</template>
		<template #breadcrumb>
			<a-breadcrumb separator="-" style="font-size: 12px">
				<a-breadcrumb-item>
					<router-link :to="{ name: 'admin.dashboard.index' }">
						{{ $t(`menu.dashboard`) }}
					</router-link>
				</a-breadcrumb-item>
				<a-breadcrumb-item>
					{{ $t(`menu.reports`) }}
				</a-breadcrumb-item>
				<a-breadcrumb-item>
					{{ $t(`menu.profit_loss`) }}
				</a-breadcrumb-item>
			</a-breadcrumb>
		</template>
	</AdminPageHeader>

	<a-card class="page-content-container">
		<a-row :gutter="[15, 15]" class="mb-20">
			<a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6">
				<DateRangePicker
					@dateTimeChanged="
						(changedDateTime) => {
							filters.dates = changedDateTime;
						}
					"
				/>
			</a-col>
		</a-row>

		<a-row id="profit-loss-reports-table">
			<a-col :span="24" class="mt-10">
				<a-descriptions
					:title="$t('common.profit_reports_by_orders')"
					:column="1"
					bordered
				>
					<a-descriptions-item>
						<template #label>
							<strong>{{ $t("common.particulars") }}</strong>
						</template>
						<strong>{{ $t("common.amount") }}</strong>
					</a-descriptions-item>
					<a-descriptions-item>
						<template #label> {{ $t("menu.sales") }} (+) </template>
						{{ formatAmountCurrency(reportData.sales) }}
					</a-descriptions-item>
					<a-descriptions-item>
						<template #label> {{ $t("menu.purchases") }} (-) </template>
						{{ formatAmountCurrency(reportData.purchases) }}
					</a-descriptions-item>
					<a-descriptions-item>
						<template #label>
							{{ $t("menu.purchase_returns") }} (+)
						</template>
						{{ formatAmountCurrency(reportData.purchase_returns) }}
					</a-descriptions-item>
					<a-descriptions-item>
						<template #label> {{ $t("menu.sales_returns") }} (-) </template>
						{{ formatAmountCurrency(reportData.sales_returns) }}
					</a-descriptions-item>
					<a-descriptions-item>
						<template #label> {{ $t("menu.expenses") }} (-) </template>
						{{ formatAmountCurrency(reportData.expenses) }}
					</a-descriptions-item>
					<a-descriptions-item :label="$t('common.profit')">
						<a-typography-text
							:type="reportData.profit > 0 ? 'success' : 'danger'"
							strong
						>
							{{ formatAmountCurrency(reportData.profit) }}
						</a-typography-text>
					</a-descriptions-item>
				</a-descriptions>
			</a-col>

			<!-- <a-col :span="24" class="mt-40 mb-20">
				<a-descriptions
					:title="$t('common.profit_reports_by_payments')"
					:column="1"
					bordered
				>
					<a-descriptions-item>
						<template #label>
							<strong>{{ $t("common.particulars") }}</strong>
						</template>
						<strong>{{ $t("common.amount") }}</strong>
					</a-descriptions-item>
					<a-descriptions-item>
						<template #label>
							{{ $t("dashboard.payment_received") }} (+)
						</template>
						{{ formatAmountCurrency(reportData.payment_received) }}
					</a-descriptions-item>
					<a-descriptions-item>
						<template #label>
							{{ $t("dashboard.payment_sent") }} (-)
						</template>
						{{ formatAmountCurrency(reportData.payment_sent) }}
					</a-descriptions-item>
					<a-descriptions-item>
						<template #label> {{ $t("menu.expenses") }} (-) </template>
						{{ formatAmountCurrency(reportData.expenses) }}
					</a-descriptions-item>
					<a-descriptions-item :label="$t('common.profit')">
						<a-typography-text
							:type="reportData.profit > 0 ? 'success' : 'danger'"
							strong
						>
							{{ formatAmountCurrency(reportData.profit_by_payment) }}
						</a-typography-text>
					</a-descriptions-item>
				</a-descriptions>
			</a-col> -->
		</a-row>
	</a-card>
</template>
<script>
import { onMounted, ref, onBeforeMount, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { filter } from "lodash-es";
import ProductSearchInput from "../../../../common/components/product/ProductSearchInput.vue";
import common from "../../../../common/composable/common";
import AdminPageHeader from "../../../../common/layouts/AdminPageHeader.vue";
import ExprotTable from "../../../components/report-exports/ExportTable.vue";
import DateRangePicker from "../../../../common/components/common/calendar/DateRangePicker.vue";

export default {
	components: {
		ProductSearchInput,
		AdminPageHeader,
		ExprotTable,
		DateRangePicker,
	},
	setup() {
		const { permsArray, selectedWarehouse, formatAmountCurrency } = common();
		const router = useRouter();
		const filters = reactive({
			dates: [],
		});
		const reportData = ref([]);
		const store = useStore();

		onBeforeMount(() => {
			if (
				!(
					(permsArray.value.includes("products_view") &&
						permsArray.value.includes("purchases_view") &&
						permsArray.value.includes("sales_view") &&
						permsArray.value.includes("purchase_returns_view") &&
						permsArray.value.includes("sales_returns_view")) ||
					permsArray.value.includes("admin")
				)
			) {
				router.push("admin.dashboard.index");
			}
		});

		onMounted(() => {
			getData(filters);
		});

		const getData = (filterDate) => {
			axiosAdmin.post("reports/profit-loss", filterDate).then((response) => {
				reportData.value = response.data;

				// For Export
				var exportDataType = "profit_loss_reports";
				var allExportDatas = store.state.auth.allExportData;
				var allExportDataExceptType = filter(
					allExportDatas,
					(allExportData) => allExportData.export_type != exportDataType
				);
				store.commit("auth/updatAllExportData", [
					...allExportDataExceptType,
					{
						export_type: exportDataType,
						data: [response.data],
						url: "reports/profit-loss",
					},
				]);
			});
		};

		watch(filters, (newVal, oldVal) => {
			getData(newVal);
		});

		return {
			permsArray,
			formatAmountCurrency,
			filters,
			reportData,
		};
	},
};
</script>
