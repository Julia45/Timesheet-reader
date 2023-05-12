import { useEffect, useState } from "react";
import {
  modifyNamesConfig,
  calculateTotalPages,
  calculatePagesNumber,
  validateUser,
} from "../utils/helpers";
import { ModalPopup } from "../components/Modal";
import { ReportItemAction } from "./ReportItemAction";
import Multiselect from "multiselect-react-dropdown";
import "./style.css";
import { namesConfig } from "../utils/constants"

const itemsPerPage = 5;
const headers = ["Name", "Name Options", "Report Name(s)", "Actions"];

export const ConfigUserTable = ({ data, setNameConfig, options, filters, setFilters }) => {
  const [table, setTableData] = useState(modifyNamesConfig(data));
  const [userNaming, setUserNaming] = useState({
    name: "",
    relativeNames: "",
    reportName: [],
  });

  const [rowData, setRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPages] = useState(1);
  const [dataPaginated, setPaginatedDate] = useState([]);
  const [error, setError] = useState(null);
  let reportConfig = JSON.parse(localStorage.getItem("nameConfig")) || namesConfig;

  useEffect(() => {
    let initialTable = modifyNamesConfig(data);
    let nameFromFilters = filters.map((el) => el.name);
    if (!nameFromFilters.length) {
      setTableData(initialTable);
    } else {
      const filteredTable = initialTable.filter((el) => {
        let elementReportNames = el.reportName.map((el) => el.name);
        return elementReportNames.some((reportName) => {
          return nameFromFilters.includes(reportName);
        });
      });

      setTableData(filteredTable);
    }
    setPage(1);
  }, [filters]);

  useEffect(() => {
    setTableData(modifyNamesConfig(data));
  }, [data]);

  useEffect(() => {
    setPaginatedDate(calculatePagesNumber(page, itemsPerPage, table));
  }, [page, table]);

  useEffect(() => {
    setTotalPages(calculateTotalPages(table.length, itemsPerPage));
  }, [table]);

  const updateAllData = (data) => {
    setNameConfig(data);
    localStorage.setItem("nameConfig", JSON.stringify(data));
    setTableData(modifyNamesConfig(data));
  };

  const removeUser = (row) => {
    delete data[row.header];
    updateAllData(data);
    setPage(1);
    setFilters([])
  };

  const editUser = (row) => {
    setRow(row);
    setShowModal(true);
    setUserNaming({
      name: row.header,
      relativeNames: row.relatedFields.join(";"),
      reportName: row.reportName,
    });
  };

  useEffect(() => {
    let config = Object.keys(reportConfig).filter(
      (el) => el !== rowData?.header
    );
    let error = validateUser(config, userNaming.name, userNaming.relativeNames);
    setError(error);
  }, [userNaming.name, userNaming.relativeNames, reportConfig, rowData]);

  const saveChnages = () => {
    let dataCopy = { ...data };
    const name = userNaming.name.trim() || rowData.header;
    const relations = userNaming.relativeNames.trim() || rowData.relatedFields;
    const reportName = userNaming.reportName || rowData.reportName;

    if (error) {
      return;
    }

    delete dataCopy[rowData.header];
    dataCopy[name] = {
      variations: relations.split(";").map((name) => name.trim()),
      reportName: reportName,
    };

    updateAllData(dataCopy);
    setShowModal(false);
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
              actionTitle="Please edit name key:"
              inputValue={userNaming.name}
              changeHandler={(value) =>
                setUserNaming({ ...userNaming, name: value })
              }
            />
            <ReportItemAction
              actionTitle="Please edit name variation. Separate with ';'"
              inputValue={userNaming.relativeNames}
              changeHandler={(value) =>
                setUserNaming({ ...userNaming, relativeNames: value })
              }
            />
            <Multiselect
              className="mb-3"
              options={options}
              selectedValues={userNaming.reportName}
              onSelect={(selectedList) =>
                setUserNaming({ ...userNaming, reportName: selectedList })
              }
              onRemove={(selectedList) =>
                setUserNaming({ ...userNaming, reportName: selectedList })
              }
              displayValue="name"
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
                  <tr key={row.header}>
                    <td className="align-middle">{row.header}</td>
                    <td className="align-middle">
                      {row.relatedFields.map((el) => (
                        <span className="mx-1 p-1 rounded tableElem">{el}</span>
                      ))}
                    </td>
                    <td className="align-middle">
                      {row.reportName.map((el, index) => (
                        <span key={`${index} ${el.name}`} className="mx-1 p-1 rounded tableElem">
                          {el.name}
                        </span>
                      ))}
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          editUser(row, index);
                        }}
                        className="btn btn-info mx-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          removeUser(row);
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
      <nav aria-label="Page navigation example">
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
