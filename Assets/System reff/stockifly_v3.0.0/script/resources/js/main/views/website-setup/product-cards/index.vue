<template>
	<a-card
		class="page-content-sub-header"
		:bodyStyle="{ padding: '0px', margin: '0px 16px 0' }"
	>
		<a-row>
			<a-col :span="24">
				<a-page-header :title="$t(`menu.product_cards`)" class="p-0">
					<template #extra>
						<a-button type="primary" @click="addItem">
							<PlusOutlined />
							{{ $t("product_card.add") }}
						</a-button>
					</template>
				</a-page-header>
			</a-col>
			<a-col :span="24">
				<a-breadcrumb separator="-" style="font-size: 12px">
					<a-breadcrumb-item>
						<router-link :to="{ name: 'admin.dashboard.index' }">
							{{ $t(`menu.dashboard`) }}
						</router-link>
					</a-breadcrumb-item>
					<a-breadcrumb-item>
						{{ $t(`menu.website_setup`) }}
					</a-breadcrumb-item>
					<a-breadcrumb-item>
						{{ $t(`menu.product_cards`) }}
					</a-breadcrumb-item>
				</a-breadcrumb>
			</a-col>
		</a-row>
	</a-card>

	<a-card class="page-content-container">
		<AddEdit
			:addEditType="addEditType"
			:visible="addEditVisible"
			:url="addEditUrl"
			@addEditSuccess="addEditSuccess"
			@closed="onCloseAddEdit"
			:formData="formData"
			:data="viewData"
		/>

		<a-row :gutter="[15, 15]" class="mb-20">
			<a-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
				<a-input-group compact>
					<a-select
						style="width: 25%"
						v-model:value="table.searchColumn"
						:placeholder="$t('common.select_default_text', [''])"
					>
						<a-select-option
							v-for="filterableColumn in filterableColumns"
							:key="filterableColumn.key"
						>
							{{ filterableColumn.value }}
						</a-select-option>
					</a-select>
					<a-input-search
						style="width: 75%"
						v-model:value="table.searchString"
						show-search
						@change="onTableSearch"
						@search="onTableSearch"
						:loading="table.filterLoading"
					/>
				</a-input-group>
			</a-col>
		</a-row>

		<a-row class="mt-20">
			<a-col :span="24">
				<div class="table-responsive">
					<a-table
						:columns="columns"
						:row-key="(record) => record.xid"
						:data-source="table.data"
						:pagination="table.pagination"
						:loading="table.loading"
						@change="handleTableChange"
					>
						<template #bodyCell="{ column, record }">
							<template v-if="column.dataIndex === 'title'">
								{{ record.title }} <br />
								<small>{{ record.subtitle }}</small>
							</template>
							<template v-if="column.dataIndex === 'products'">
								<a-list
									item-layout="horizontal"
									:data-source="record.products_details"
								>
									<template #renderItem="{ item }">
										<a-list-item>
											<a-list-item-meta :title="item.name">
												<template #avatar>
													<a-avatar
														:src="item.image_url"
														size="small"
													/>
												</template>
											</a-list-item-meta>
										</a-list-item>
									</template>
								</a-list>
							</template>
							<template v-if="column.dataIndex === 'action'">
								<a-space>
									<a-button type="primary" @click="editItem(record)">
										<template #icon><EditOutlined /></template>
									</a-button>
									<a-button
										type="primary"
										@click="showDeleteConfirm(record.xid)"
									>
										<template #icon><DeleteOutlined /></template>
									</a-button>
								</a-space>
							</template>
						</template>
					</a-table>
				</div>
			</a-col>
		</a-row>
	</a-card>
</template>
<script>
import { onMounted, watch } from "vue";
import AddEdit from "./AddEdit";
import {
	EyeOutlined,
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
} from "@ant-design/icons-vue";
import fields from "./fields";
import crud from "../../../../common/composable/crud";
import common from "../../../../common/composable/common";
import { getSalesPriceWithTax } from "../../../../common/scripts/functions";

export default {
	components: {
		EyeOutlined,
		PlusOutlined,
		EditOutlined,
		DeleteOutlined,
		AddEdit,
	},
	setup() {
		const { formatAmountCurrency, selectedWarehouse } = common();
		const { url, initData, columns, filterableColumns, hashableColumns } = fields();
		const crudVariables = crud();

		onMounted(() => {
			setUrlData();
		});

		const setUrlData = () => {
			crudVariables.tableUrl.value = {
				url,
			};
			crudVariables.table.filterableColumns = filterableColumns;

			crudVariables.fetch({
				page: 1,
			});

			crudVariables.crudUrl.value = "product-cards";
			crudVariables.langKey.value = "product_card";
			crudVariables.initData.value = { ...initData };
			crudVariables.formData.value = { ...initData };
			crudVariables.hashableColumns.value = [...hashableColumns];
		};

		watch(selectedWarehouse, (newVal, oldVal) => {
			setUrlData();
		});

		return {
			columns,
			...crudVariables,
			filterableColumns,
			formatAmountCurrency,
			getSalesPriceWithTax,
		};
	},
};
</script>
