<template>
	<div class="mt-30 mb-30">
		<a-row type="flex" justify="center">
			<a-col :span="20">
				<a-breadcrumb>
					<a-breadcrumb-item>
						<router-link
							:to="{
								name: 'front.homepage',
								params: { warehouse: frontWarehouse.slug },
							}"
						>
							{{ $t("front.home") }}
						</router-link>
					</a-breadcrumb-item>
					<a-breadcrumb-item>{{ $t("front.dashboard") }}</a-breadcrumb-item>
				</a-breadcrumb>

				<a-row :gutter="[30, 30]" class="mt-30">
					<a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
						<dashboard-sidebar />
					</a-col>
					<a-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
						<a-card
							:title="null"
							:bordered="false"
							:style="{ borderRadius: '10px' }"
							class="dashboard-container"
						>
							<a-row>
								<a-col :span="24">
									<a-page-header
										:title="$t('front.dashboard')"
										style="padding-left: 0px"
									/>
								</a-col>
							</a-row>

							<a-row :gutter="[20, 20]">
								<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6">
									<Stats :color="'#87d068'">
										<template #icon>
											<ShoppingCartOutlined />
										</template>
										<template #title>
											{{ $t("front.total_orders") }}
										</template>
										<template #description>
											{{ states.totalOrders }}
										</template>
									</Stats>
								</a-col>
								<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6">
									<Stats :color="'#f56a00'">
										<template #icon>
											<SyncOutlined />
										</template>
										<template #title>
											{{ $t("front.pending_orders") }}
										</template>
										<template #description>
											{{ states.pendingOrders }}
										</template>
									</Stats>
								</a-col>
								<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6">
									<Stats :color="'#7265e6'">
										<template #icon>
											<FieldTimeOutlined />
										</template>
										<template #title>
											{{ $t("front.processing_orders") }}
										</template>
										<template #description>
											{{ states.processingOrders }}
										</template>
									</Stats>
								</a-col>
								<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6">
									<Stats :color="'#ffbf00'">
										<template #icon>
											<CheckOutlined />
										</template>
										<template #title>
											{{ $t("front.completed_orders") }}
										</template>
										<template #description>
											{{ states.completedOrders }}
										</template>
									</Stats>
								</a-col>
							</a-row>

							<a-row class="mt-30">
								<a-col :span="24">
									<a-page-header
										:title="$t('front.recent_orders')"
										style="padding-left: 0px"
									/>
								</a-col>
							</a-row>

							<a-row>
								<a-col :span="24">
									<OrderTable
										:data="recentOrders"
										@reloadOrders="fetchOrders"
									/>
								</a-col>
							</a-row>
						</a-card>
					</a-col>
				</a-row>
			</a-col>
		</a-row>
	</div>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import {
	ShoppingCartOutlined,
	SyncOutlined,
	FieldTimeOutlined,
	CheckOutlined,
} from "@ant-design/icons-vue";
import DashboardSidebar from "../includes/DashboardSidebar.vue";
import Stats from "../components/Stats.vue";
import OrderTable from "../components/OrderTable.vue";
import common from "../../../../common/composable/common";

export default defineComponent({
	components: {
		DashboardSidebar,
		ShoppingCartOutlined,
		SyncOutlined,
		FieldTimeOutlined,
		CheckOutlined,
		Stats,
		OrderTable,
	},
	setup() {
		const { frontWarehouse } = common();
		const states = ref({
			totalOrders: 0,
			pendingOrders: 0,
			processingOrders: 0,
			completedOrders: 0,
		});
		const recentOrders = ref([]);

		onMounted(() => {
			fetchOrders();
		});

		const fetchOrders = () => {
			axiosFront.post("front/self/dashboard").then((response) => {
				states.value = {
					totalOrders: response.data.totalOrders,
					pendingOrders: response.data.pendingOrders,
					processingOrders: response.data.processingOrders,
					completedOrders: response.data.completedOrders,
				};
				recentOrders.value = response.data.recentOrders;
			});
		};

		return {
			states,
			recentOrders,
			fetchOrders,
			frontWarehouse,
		};
	},
});
</script>
