import { useEffect, useState } from "react";
import {
  modifyReportConfigData,
  calculateTotalPages,
  defineOptions,
  calculatePagesNumber,
  validateReport,
} from "../utils/helpers";
import { ModalPopup } from "../components/Modal";
import { ReportItemAction } from "./ReportItemAction";
import { clientsReportConfig } from "../utils/constants"


const itemsPerPage = 5;
const headers = ["Report", "Name", "Hours", "Actions"];

export const ConfigReportTable = ({
  data,
  setClientReportConfig,
  setOptions,
  setSelected,
}) => {
  const [table, setTableData] = useState(modifyReportConfigData(data));
  const [showModal, setShowModal] = useState(false);
  const [reportData, setReportData] = useState({
    name: "",
    hoursNaming: [],
    userNaming: "",
  });

  const [page, setPage] = useState(1);
  const [totalPage, setTotalPages] = useState(1);
  const [dataPaginated, setPaginatedDate] = useState([]);
  const [rowData, setRow] = useState(null);
  const [error, setError] = useState(null);
  let reportConfig = JSON.parse(localStorage.getItem("clientConfig")) || clientsReportConfig;

  const updateAllData = (dataForUpdate) => {
    setClientReportConfig(dataForUpdate);
    localStorage.setItem("clientConfig", JSON.stringify(dataForUpdate));
    setOptions(defineOptions(dataForUpdate));
    setTableData(modifyReportConfigData(dataForUpdate));
  };

  const edit = (row) => {
    setRow(row);
    setShowModal(true);
    setReportData({
      name: row.header,
      userNaming: row.userName,
      hoursNaming: row.hoursName.join(";"),
    });
  };

  useEffect(() => {
    let config = Object.keys(reportConfig).filter(
      (el) => el !== rowData?.header
    );
    let error = validateReport(
      config,
      reportData.name,
      reportData.userNaming,
      reportData.hoursNaming
    );
    setError(error);
  }, [reportData.name, reportData.hoursNaming, reportData.userNaming, rowData]);

  const saveChnages = () => {
    let dataCopy = { ...data };
    let timeColumnsArray = reportData.hoursNaming
      .split(";")
      .map((el) => el.trim());

    const name = reportData.name.trim() || rowData.header;
    const userNaming = reportData.userNaming.trim() || rowData.userName;
    const userHoursNaming = timeColumnsArray || rowData.hoursName;

    if (error) {
      return;
    }

    delete dataCopy[rowData.header];
    dataCopy[name] = [userNaming, userHoursNaming];

    updateAllData(dataCopy);
    setShowModal(false);
  };

  useEffect(() => {
    setTableData(modifyReportConfigData(data));
    setOptions(defineOptions(data));
  }, [data, setOptions]);

  useEffect(() => {
    setTotalPages(calculateTotalPages(table.length, itemsPerPage));
  }, [table]);

  useEffect(() => {
    setPaginatedDate(calculatePagesNumber(page, itemsPerPage, table));
  }, [page, table]);

  const removeConfig = (row) => {
    delete data[row.header];
    setSelected(null);
    updateAllData(data);
    setPage(1);
  };

  return (
    <>
      {showModal ? (
        <ModalPopup
          showModal={showModal}
          setShowModal={setShowModal}
          saveChanges={saveChnages}
        >
          <div>
            <ReportItemAction
              actionTitle="Please edit report name:"
              inputValue={reportData.name}
              changeHandler={(value) =>
                setReportData({ ...reportData, name: value })
              }
            />
            <ReportItemAction
              actionTitle="Please edit report user naming:"
              inputValue={reportData.userNaming}
              changeHandler={(value) =>
                setReportData({ ...reportData, userNaming: value })
              }
            />
            <ReportItemAction
              actionTitle="Please edit report hours naming:"
              inputValue={reportData.hoursNaming}
              changeHandler={(value) =>
                setReportData({ ...reportData, hoursNaming: value })
              }
            />
            {error ? (
              <div className="text-danger table-danger p-2">{error}</div>
            ) : null}
          </div>
        </ModalPopup>
      ) : null}
      <table className="table text-center table-sm border mb-0">
        <thead>
          <tr>
            {headers.map((name, index) => {
              return (
                <th key={index} className="border-bottom-0" scope="col">
                  {name}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {!dataPaginated.length ? (
            <td colSpan="4">No data</td>
          ) : (
            <>
              {dataPaginated.map((row, index) => {
                return (
                  <tr key={`${row.header}${index}`}>
                    <td className="align-middle">{row.header}</td>
                    <td className="align-middle">{row.userName}</td>
                    <td className="align-middle">
                      {row.hoursName.map((el) => (
                        <span className="mx-1 p-1 rounded tableElem">{el}</span>
                      ))}
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          edit(row);
                        }}
                        className="btn btn-info mx-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          removeConfig(row);
                        }}
                        className="btn btn-danger mx-1"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </>
          )}
        </tbody>
      </table>
      <nav>
        <ul className="pagination my-2 d-flex justify-content-center mb-0">
          {Array.from({ length: totalPage }).map((elem, index) => {
            return (
              <li
                onClick={() => {
                  setPage(index + 1);
                }}
                className="page-item page-link"
                key={index}
              >
                {index + 1}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};
