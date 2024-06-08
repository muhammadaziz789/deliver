import React, { useCallback, useEffect, useState, memo } from "react";
import { useTranslation } from "react-i18next";
import Card from "components/Card";
import Pagination from "components/Pagination";
import LoaderComponent from "components/Loader";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { getNewOperatorReport } from "services/reports";
import moment from "moment";
import SwitchColumns from "components/Filters/SwitchColumns";
import numberToPrice from "helpers/numberToPrice";

function NewOrderOperator({ filters }) {
  const { shipper_user_id } = JSON.parse(localStorage.getItem("persist:auth"));
  const [loader, setLoader] = useState(true);
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [columns, setColumns] = useState([]);

  const getItems = useCallback(() => {
    setLoader(true);
    getNewOperatorReport({
      from_date: moment(filters?.from_date).format("YYYY-MM-DD"),
      to_date: moment(filters.to_date).format("YYYY-MM-DD"),
      operator_id: filters?.operator_id?.value
        ? filters?.operator_id?.value
        : JSON.parse(shipper_user_id),
      from_time: "",
      to_time: "",
      sort_by: "",
      sort_type: "",
      page: currentPage,
      limit,
    })
      .then((res) => {
        setItems({
          count: res?.count,
          data: res?.reports,
        });
      })
      .finally(() => setLoader(false));
  }, [filters]);

  useEffect(() => {
    getItems();
  }, [filters, limit, currentPage]);

  const initialColumns = [
    {
      title: "№",
      key: "order-number",
      render: (_, index) => <>{(currentPage - 1) * limit + index + 1}</>,
    },
    {
      title: t("date"),
      key: "date",
      dataIndex: "date",
      render: (record) => (
        <>
          {record?.date?.toString()?.includes("/")
            ? "Итого"
            : moment(record?.date).format("DD.MM.YYYY")}
        </>
      ),
    },
    {
      title: t("fair"),
      key: "fair",
      dataIndex: "fair",
      render: (record) => <>{record?.delivery}</>,
    },
    {
      title: t("total_price"),
      key: "total_price",
      dataIndex: "total_price",
      render: (record) => <>{numberToPrice(record?.total_price, "")}</>,
    },
    {
      title: t("by_product_price"),
      key: "minimum-by_product_price",
      dataIndex: "by_product_price",
      render: (record) => <>{numberToPrice(record?.product_price, "")}</>,
    },
    {
      title: t("delivery_amount"),
      key: "delivery_amount",
      dataIndex: "delivery_amount",
      render: (record) => <>{numberToPrice(record?.total_delivery, "")}</>,
    },
    {
      title: t("pickup_amount"),
      key: "pickup_amount",
      dataIndex: "pickup_amount",
      render: (record) => <>{record?.total_self_pickup}</>,
    },
    {
      title: t("aggregator_amount"),
      key: "aggregator_amount",
      dataIndex: "aggregator_amount",
      render: (record) => <>{numberToPrice(record?.total_aggregator, "")}</>,
    },
    {
      title: t("self_pickup"),
      key: "self_pickup",
      dataIndex: "self_pickup",
      render: (record) => <>{record?.self_pickup}</>,
    },
    {
      title: t("aggregators"),
      key: "aggregators",
      dataIndex: "aggregators",
      render: (record) => <>{record?.aggregators}</>,
    },
    {
      title: t("free_delivery"),
      key: "free_delivery",
      dataIndex: "free_delivery",
      render: (record) => <>{record?.free_delivery}</>,
    },
    {
      title: t("canceled_orders"),
      key: "canceled_orders",
      dataIndex: "canceled_orders",
      render: (record) => <>{record?.canceled_orders}</>,
    },
    {
      title: t("repeat_orders"),
      key: "repeat_orders",
      dataIndex: "repeat_orders",
      render: (record) => <>{record?.avg_distance}</>,
    },
    {
      title: t("given_cashback"),
      key: "given_cashback",
      dataIndex: "given_cashback",
      render: (record) => <>{record?.given_cashback}</>,
    },
    {
      title: t("canceled_but_sold"),
      key: "cancelled-orders",
      dataIndex: "canceled_orders_count",
      render: (record) => <>{record?.canceled_but_sold}</>,
    },
  ];
  useEffect(() => {
    const _columns = [
      ...initialColumns,
      {
        title: (
          <SwitchColumns
            columns={initialColumns}
            onChange={(val) => {
              setColumns((prev) => [...val, prev[prev.length - 1]]);
            }}
            sortable={false}
            iconClasses="flex justify-end mr-1"
          />
        ),
      },
    ];
    setColumns(_columns);
  }, [currentPage, limit]);

  return (
    <Card
      footer={
        <Pagination
          title={t("general.count")}
          count={items?.count}
          onChange={(pageNumber) => setCurrentPage(pageNumber)}
          pageCount={limit}
          limit={limit}
          onChangeLimit={(limitNumber) => setLimit(limitNumber)}
        />
      }
    >
      <TableContainer className="rounded-lg border border-lightgray-1">
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              {columns.map((elm) => (
                <TableCell
                  key={elm.key}
                  style={{ textAlign: "center" }}
                  className="whitespace-nowrap"
                >
                  {elm.title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!loader && items.data && items.data.length
              ? items.data.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className={index % 2 === 0 ? "bg-lightgray-5" : ""}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className="whitespace-nowrap"
                        style={{ textAlign: "center" }}
                      >
                        {col.render
                          ? col.render(item, index)
                          : item[col.dataIndex]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </TableContainer>

      <LoaderComponent isLoader={loader} />
    </Card>
  );
}
export default memo(NewOrderOperator);