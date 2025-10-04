<template>
	<a-row>
		<a-col :span="24">
			<div v-if="!table.loading" class="table-responsive">
				<a-table
					:columns="columns"
					:row-key="(record) => record.xid"
					:data-source="table.data"
					:pagination="table.pagination"
					:loading="table.loading"
					@change="handleTableChange"
					id="product-sales-summary-reports-table"
				>
					<template #bodyCell="{ column, record }">
						<template v-if="column.dataIndex === 'name'">
							<a-badge>
								<a-avatar
									shape="square"
									:src="record.product.image_url"
								/>
								{{ record.product.name }}
							</a-badge>
						</template>
						<template v-if="column.dataIndex === 'unit_sold'">
							{{ `${record.unit_sold} ${record.product.unit.short_name}` }}
						</template>
					</template>
				</a-table>
			</div>
		</a-col>
	</a-row>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from "vue";
import datatable from "../../../../common/composable/datatable";
import common from "../../../../common/composable/common";
import UserInfo from "../../../../common/components/user/UserInfo.vue";
import fields from "./fields";
import PaymentStatus from "../../../../common/components/order/PaymentStatus.vue";

export default defineComponent({
	props: {
		product_id: null,
		dates: {
			default: [],
			type: null,
		},
	},
	components: {
		UserInfo,
		PaymentStatus,
	},
	setup(props) {
		const { columns, hashableColumns } = fields();
		const { formatDateTime, formatAmountCurrency, selectedWarehouse } = common();
		const datatableVariables = datatable();

		onMounted(() => {
			const propsData = props;
			getData(propsData);
		});

		const getData = (propsData) => {
			const filters = {};

			if (propsData.product_id && propsData.product_id != undefined) {
				filters.product_id = propsData.product_id;
			}

			datatableVariables.tableUrl.value = {
				url: "order-items?fields=id",
				filters,
				extraFilters: {
					product_sales_summary: true,
					dates: propsData.dates,
				},
			};
			datatableVariables.hashable.value = [...hashableColumns];
			datatableVariables.table.sorter = { field: "products.name", order: "asc" };
			datatableVariables.exportDetails.value = {
				allowExport: true,
				exportType: "product_sales_summary_reports",
			};

			datatableVariables.fetch({
				page: 1,
			});
		};

		watch(props, (newVal, oldVal) => {
			getData(newVal);
		});

		watch(selectedWarehouse, (newVal, oldVal) => {
			getData(props);
		});

		return {
			columns,
			...datatableVariables,

			formatDateTime,
			formatAmountCurrency,
		};
	},
});
</script>
