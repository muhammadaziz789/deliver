import { useMemo, useState } from "react";
import Card from "components/Card";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import Form from "components/Form/Index";
import { AsyncPaginate } from "react-select-async-paginate";
import { useFormik } from "formik";
import Header from "components/Header";
import Button from "components/Button";
import Breadcrumb from "components/Breadcrumb";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import { customStyles } from "components/Select";
import { getGoods, updateCrmIds } from "services/v2";
import * as yup from "yup";
import { rkeeperMenu } from "services/v2/rkeeper_credentials";

export default function MenuCreate() {
  const { t } = useTranslation();
  const history = useHistory();
  const [saveLoading, setSaveLoading] = useState(false);

  const rkeeperLoadOptions = async (search, prevOptions, { page }) => {
    const res = await rkeeperMenu({
      search,
      limit: 100,
      page: 1,
      type: "rkeeper",
    });

    const hasMore = +res?.count > prevOptions.length + 10;
    return {
      options: res?.products?.map((elm) => ({
        label: `${elm.name} (${elm.price} ${t("uzb.sum")})`,
        value: elm.id,
        elm,
      })),
      hasMore,
      additional: {
        page: page + 1,
      },
    };
  };

  const loadOptions = async (search, prevOptions, { page }) => {
    const res = await getGoods({ search, limit: 10, page });
    const hasMore = +res?.count > prevOptions.length + 10;
    return {
      options: res?.products?.map((elm) => ({
        label: `${elm.title?.ru} (${elm.out_price} ${t("uzb.sum")})`,
        value: elm.id,
        elm,
      })),
      hasMore,
      additional: {
        page: page + 1,
      },
    };
  };

  const initialValues = useMemo(
    () => ({
      crm_type: "rkeeper",
      ids: [
        {
          crm_product_id: "",
          product_id: "",
        },
      ],
    }),
    [],
  );

  const validationSchema = useMemo(() => {
    const defaultSchema = yup.mixed().required(t("required.field"));
    return yup.object().shape({
      crm_type: defaultSchema,
      ids: defaultSchema,
    });
  }, [t]);

  const onSubmit = (values) => {
    values.ids.splice(-1);

    setSaveLoading(true);
    updateCrmIds(values)
      .then(() => {
        history.goBack();
      })
      .finally(() => {
        setSaveLoading(false);
      });
  };

  const formik = useFormik({
    initialValues,
    onSubmit,
    validationSchema,
  });

  const { values, setFieldValue, handleSubmit } = formik;

  const routes = [
    {
      title: t(`Rkeeper`),
      link: true,
      route: `/home/settings/integrations/rkeeper`,
    },
    {
      title: t("create"),
    },
  ];

  const headerButtons = (
    <>
      <Button
        icon={CancelIcon}
        size="large"
        shape="outlined"
        color="red"
        borderColor="bordercolor"
        onClick={() => history.goBack()}
      >
        {t("cancel")}
      </Button>
      <Button icon={SaveIcon} size="large" type="submit" loading={saveLoading}>
        {t("save")}
      </Button>
    </>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{ minHeight: "100vh" }}
        className="flex flex-col justify-between"
      >
        <div>
          <Header startAdornment={<Breadcrumb routes={routes} />} />

          <Card title={t("general.information")} className="m-4">
            <div className="grid grid-cols-2 gap-4 items-baseline">
              <div className="input-label">
                <span style={{ color: "red" }}>*</span> {t("products")}
              </div>
              <div className="input-label">
                <span style={{ color: "red" }}>*</span> {t("RKeeper")}
              </div>
            </div>

            {values.ids.map((id, i) => (
              <div
                className="grid grid-cols-4 gap-4 mb-4 items-baseline"
                key={i}
              >
                <div className="col-span-2">
                  <Form.Item formik={formik} name="product_id">
                    <AsyncPaginate
                      loadOptions={loadOptions}
                      additional={{ page: 1 }}
                      styles={customStyles({ height: "40px" })}
                      onChange={(val) => {
                        setFieldValue(`ids[${i}].product_id`, val.value);

                        if (
                          i === values.ids.length - 1 &&
                          values?.ids[i]?.crm_product_id
                        ) {
                          setFieldValue(`ids[${i + 1}]`, {
                            product_id: null,
                          });
                        }
                      }}
                      placeholder=""
                    />
                  </Form.Item>
                </div>

                <div className="col-span-2">
                  <Form.Item formik={formik} name="iiko_id">
                    <AsyncPaginate
                      loadOptions={rkeeperLoadOptions}
                      additional={{ page: 1 }}
                      styles={customStyles({ height: "40px" })}
                      onChange={(val) => {
                        setFieldValue(`ids[${i}].crm_product_id`, val.value);
                        if (
                          i === values.ids.length - 1 &&
                          values?.ids[i]?.product_id
                        ) {
                          setFieldValue(`ids[${i + 1}]`, {
                            crm_product_id: null,
                          });
                        }
                      }}
                      placeholder=""
                    />
                  </Form.Item>
                </div>
              </div>
            ))}
          </Card>
        </div>
        <div className="flex justify-end items-center w-full bg-white p-4 gap-5">
          {headerButtons}
        </div>
      </div>
    </form>
  );
}
