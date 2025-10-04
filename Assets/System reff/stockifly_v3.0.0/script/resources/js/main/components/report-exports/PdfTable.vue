<template>
	<a-col :span="24">
		<a-button type="primary" @click="downloadPdf" :loading="loading">
			<FilePdfOutlined />
			{{ $t("common.pdf") }}
		</a-button>
	</a-col>
</template>

<script>
import { ref } from "vue";
import { FilePdfOutlined } from "@ant-design/icons-vue";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default {
	props: ["tableName", "title"],
	components: {
		FilePdfOutlined,
	},
	setup(props) {
		const loading = ref(false);

		const downloadPdf = () => {
			loading.value = true;

			var pdf = new jsPDF();
			pdf.text(props.title, 14, 9);
			pdf.autoTable({ html: `#${props.tableName} table` });
			pdf.save(`${props.tableName}.pdf`);

			loading.value = false;
		};

		return {
			downloadPdf,
			loading,
		};
	},
};
</script>

<style></style>
