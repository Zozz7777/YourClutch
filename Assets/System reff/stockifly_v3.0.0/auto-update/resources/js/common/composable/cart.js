import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { filter, forEach } from "lodash-es";
import { useI18n } from "vue-i18n";

const cart = () => {
	const route = useRoute();
	const store = useStore();
	const products = computed(() => store.state.front.cartItems);
	const appSetting = store.state.auth.appSetting;
	const user = store.state.auth.user;
	const { t } = useI18n();
	const orderType = ref(route.params.type);

	const statusColors = {
		enabled: "success",
		disabled: "error",
	};

	const userStatus = [
		{
			key: "enabled",
			value: t("common.enabled")
		},
		{
			key: "disabled",
			value: t("common.disabled")
		}
	];

	const taxTypes = [
		{
			key: "inclusive",
			value: t("product.inclusive")
		},
		{
			key: "exclusive",
			value: t("product.exclusive")
		}
	];

	const disabledDate = (current) => {
		// Can not select days before today and today
		return current && current > moment().endOf("day");
	};

	const formatAmount = (amount) => {
		return parseFloat(parseFloat(amount).toFixed(2));
	};

	const formatAmountCurrency = (amount) => {
		const newAmount = parseFloat(Math.abs(amount)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		const newAmountString = `${appSetting.currency.symbol}${newAmount}`;

		return amount < 0 ? `- ${newAmountString}` : newAmountString;
	};

	const calculateFilterString = (filters) => {
		var filterString = "";

		forEach(filters, (filterValue, filterKey) => {
			if (filterValue != undefined) {
				filterString += `${filterKey} eq "${filterValue}" and `;
			}
		})

		if (filterString.length > 0) {
			filterString = filterString.substring(0, filterString.length - 4);
		}

		return filterString;
	}

	const checkPermission = (permissionName) => checkUserPermission(permissionName, user);

	const updatePageTitle = (pageName) => {
		store.commit("auth/updatePageTitle", t(`menu.${pageName}`));
	}

	const permsArray = computed(() => {
		const permsArrayList = [store.state.auth.user.role.name];

		forEach(store.state.auth.user.role.perms, (permission) => {
			permsArrayList.push(permission.name);
		});

		return permsArrayList;
	});

	const orderPageObject = computed(() => {
		var pageObjectDetails = {};

		if (orderType.value == "purchases") {
			pageObjectDetails = {
				type: "purchases",
				langKey: "purchase",
				menuKey: "purchases",
				userType: "suppliers",
			};
		} else if (orderType.value == "sales") {
			pageObjectDetails = {
				type: "sales",
				langKey: "sales",
				menuKey: "sales",
				userType: "customers",
			};
		} else if (orderType.value == "purchase-returns") {
			pageObjectDetails = {
				type: "purchase-returns",
				langKey: "purchase_returns",
				menuKey: "purchase_returns",
				userType: "suppliers",
			};
		} else if (orderType.value == "sales-returns") {
			pageObjectDetails = {
				type: "sales-returns",
				langKey: "sales_returns",
				menuKey: "sales_returns",
				userType: "customers",
			};
		}

		return pageObjectDetails;
	});

	const getOrderTypeFromstring = (stringVal) => {
		const orderType = stringVal.replace("-", "_");

		return t(`menu.${orderType}`);
	}

	const orderStatus = [
		{
			key: "pending",
			value: t("common.pending"),
		},
		{
			key: "paid",
			value: t("common.paid"),
		},
		{
			key: "cancelled",
			value: t("common.cancelled"),
		},
	];

	const paymentStatus = [
		{
			key: "pending",
			value: t("common.pending"),
		},
		{
			key: "paid",
			value: t("common.paid"),
		},
		{
			key: "cancelled",
			value: t("common.cancelled"),
		},
	];

	const purchaseOrderStatus = [
		{
			key: "received",
			value: t("common.received"),
		},
		{
			key: "pending",
			value: t("common.pending"),
		},
		{
			key: "ordered",
			value: t("common.ordered"),
		},
	];

	const purchaseReturnStatus = [
		{
			key: "completed",
			value: t("common.completed"),
		},
		{
			key: "pending",
			value: t("common.pending"),
		},
	];

	const salesOrderStatus = [
		{
			key: "ordered",
			value: t("common.ordered"),
		},
		{
			key: "confirmed",
			value: t("common.confirmed"),
		},
		{
			key: "processing",
			value: t("common.processing"),
		},
		{
			key: "shipping",
			value: t("common.shipping"),
		},
		{
			key: "delivered",
			value: t("common.delivered"),
		},
	];

	const salesReturnStatus = [
		{
			key: "received",
			value: t("common.received"),
		},
		{
			key: "pending",
			value: t("common.pending"),
		},
	];

	const barcodeSymbology = [
		{
			key: "CODE128",
			value: "CODE128"
		},
		{
			key: "CODE39",
			value: "CODE39"
		},
	];

	const getRecursiveCategories = (response, excludeId = null) => {
		const allCategoriesArray = [];
		const listArray = [];

		response.data.map((responseArray) => {
			if (excludeId == null || (excludeId != null && responseArray.parent_id != excludeId)) {
				listArray.push({
					id: responseArray.id,
					parent_id: responseArray.parent_id,
					title: responseArray.name,
					value: responseArray.id,
				});
			}
		});

		listArray.forEach((node) => {
			// No parentId means top level
			if (!node.parent_id) return allCategoriesArray.push(node);

			// Insert node as child of parent in listArray array
			const parentIndex = listArray.findIndex(
				(el) => el.id === node.parent_id
			);
			if (!listArray[parentIndex].children) {
				return (listArray[parentIndex].children = [node]);
			}

			listArray[parentIndex].children.push(node);
		});

		return allCategoriesArray;
	}

	const filterTreeNode = (inputValue, treeNode) => {
		const treeString = treeNode.props.title.toLowerCase();

		return treeString.includes(inputValue.toLowerCase());
	};

	const total = computed(() => {
		let totalAmount = 0;

		forEach(products.value, (product) => {
			totalAmount += product.cart_quantity * product.details.sales_price;
		})

		return totalAmount;
	});

	const updateCart = () => {
		store.commit("front/addCartItems", products.value);
	}

	const removeItem = (selectedProductId) => {
		const updatedCartItems = filter(
			products.value,
			(cartItem) => cartItem.xid != selectedProductId
		);

		store.commit("front/addCartItems", updatedCartItems);
	}

	return {
		appSetting,
		user,
		checkPermission,
		permsArray,
		statusColors,
		userStatus,
		taxTypes,
		barcodeSymbology,

		disabledDate,
		formatAmount,
		formatAmountCurrency,

		calculateFilterString,
		updatePageTitle,

		// For Stock routes
		orderType,
		orderPageObject,
		orderStatus,
		paymentStatus,
		purchaseOrderStatus,
		salesOrderStatus,
		purchaseReturnStatus,
		salesReturnStatus,

		getRecursiveCategories,
		filterTreeNode,
		getOrderTypeFromstring,

		products,
		total,
		updateCart,
		removeItem
	};
}

export default cart;