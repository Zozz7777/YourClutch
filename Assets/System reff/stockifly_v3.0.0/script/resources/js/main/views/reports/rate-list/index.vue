<template>
	<AdminPageHeader>
		<template #header>
			<a-page-header :title="$t(`menu.rate_list`)" class="p-0">
				<template #extra>
					<ExprotTable
						exportType="rate_list_reports"
						tableName="rate-list-reports-table"
						:title="`${$t('menu.rate_list')} ${$t('menu.reports')}`"
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
					{{ $t(`menu.rate_list`) }}
				</a-breadcrumb-item>
			</a-breadcrumb>
		</template>
	</AdminPageHeader>

	<a-card class="page-content-container">
		<a-row :gutter="15" class="mb-20">
			<a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6">
				<ProductSearchInput
					@valueChanged="
						(productId) => {
							filters.product_id = productId;
						}
					"
				/>
			</a-col>
		</a-row>

		<RateList :product_id="filters.product_id" />
	</a-card>
</template>
<script>
import { onBeforeMount, reactive } from "vue";
import { useRouter } from "vue-router";
import table from "../../../../common/composable/datatable";
import common from "../../../../common/composable/common";
import AdminPageHeader from "../../../../common/layouts/AdminPageHeader.vue";
import RateList from "./RateList.vue";
import ProductSearchInput from "../../../../common/components/product/ProductSearchInput.vue";
import ExprotTable from "../../../components/report-exports/ExportTable.vue";

export default {
	components: {
		AdminPageHeader,
		RateList,
		ProductSearchInput,
		ExprotTable,
	},
	setup() {
		const datatable = table();
		const { permsArray } = common();
		const router = useRouter();
		const filters = reactive({
			product_id: undefined,
		});

		onBeforeMount(() => {
			if (
				!(
					permsArray.value.includes("products_view") ||
					permsArray.value.includes("admin")
				)
			) {
				router.push("admin.dashboard.index");
			}
		});

		return {
			...datatable,
			permsArray,
			filters,
		};
	},
};
</script>
