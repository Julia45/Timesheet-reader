import { AddBlock } from "./AddConfig";
import { ReportItemAction } from "./ReportItemAction";
import { ConfigReportTable } from "./ConfigReportTable";
import { useEffect, useState } from "react";
import { validateReport } from "../utils/helpers"
import { clientsReportConfig } from "../utils/constants"
import "./style.css"

export const ReportConfigActions = ({
  saveReportChnages,
  reportName,
  setReportName,
  reportUserNaming,
  setReportUserNaming,
  reportHoursNaming,
  setReportHoursNaming,
  clientReportConfig,
  setOptions,
  setClientReportConfig,
  setSelected
}) => {
  const [showContent, setShowContent] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let reportConfig = JSON.parse(localStorage.getItem("clientConfig")) || clientsReportConfig;
    setError(validateReport(Object.keys(reportConfig), reportName, reportUserNaming, reportHoursNaming))
  }, [reportName, reportUserNaming, reportHoursNaming]);

  const saveChangesHandler = () => {
    saveReportChnages();
    setReportName("");
    setReportUserNaming("");
    setReportHoursNaming("");
  };

  return (
    <div className="border pt-2 mb-3 border-2 table-container">
      <h5 className="ml-2 cursor-pointer" onClick={() => setShowContent(!showContent)}>
        Report Configuration
      </h5>
      {showContent ? (
        <div>
          <AddBlock
            saveChanges={saveChangesHandler}
            blockTitle="Report Configuration"
            formError={error}
          >
            <div>
              <ReportItemAction
                actionTitle="Please add report name:"
                inputValue={reportName}
                changeHandler={(value) => {
                  setReportName(value);
                }}
              />
              <ReportItemAction
                actionTitle="Please add report employee naming:"
                inputValue={reportUserNaming}
                changeHandler={(value) => {
                  setReportUserNaming(value);
                }}
              />
              <ReportItemAction
                actionTitle="Please add report hours naming, separated by ';'"
                inputValue={reportHoursNaming}
                changeHandler={(value) => {
                  setReportHoursNaming(value);
                }}
              />
            </div>
            {error ? (
              <div className="text-danger table-danger p-2">{error}</div>
            ) : null}
          </AddBlock>
          <div>
            <ConfigReportTable
              data={clientReportConfig}
              setSelected={setSelected}
              setOptions={setOptions}
              setClientReportConfig={setClientReportConfig}
            ></ConfigReportTable>
          </div>
        </div>
      ) : null}
    </div>
  );
};
