<template>
	<a-space>
		<PdfTable :tableName="tableName" :title="title" />
		<PrintTable :tableName="tableName" />
		<ExportExcel :exportType="exportType" />
	</a-space>
</template>

<script>
import PdfTable from "./PdfTable.vue";
import PrintTable from "./PrintTable.vue";
import ExportExcel from "./ExportExcel.vue";

export default {
	props: {
		tableName: {
			type: String,
			default: "reports",
		},
		title: {
			type: String,
			default: "Data",
		},
		exportType: {
			type: String,
			default: "",
		},
	},
	components: {
		PdfTable,
		PrintTable,
		ExportExcel,
	},
};
</script>
