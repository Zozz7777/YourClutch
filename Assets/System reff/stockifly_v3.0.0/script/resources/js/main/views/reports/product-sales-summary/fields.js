import { useI18n } from "vue-i18n";

const fields = () => {
    const { t } = useI18n();
    const hashableColumns = ['product_id'];

    const columns = [
        {
            title: t("product.product"),
            dataIndex: "name",
            dbKey: "name",
        },
        {
            title: t("product.item_code"),
            dataIndex: "item_code",
            dbKey: "item_code",
        },
        {
            title: t("product.unit_sold"),
            dataIndex: "unit_sold",
            dbKey: "unit_sold",
            dataFormat: (row) => {
                return `${row.unit_sold} ${row.product.unit.short_name}`;
            }
        },
    ];

    return {
        columns,
        hashableColumns,
    }
}

export default fields;
