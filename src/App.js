import "./App.css";
import { useEffect, useState } from "react";
import { Table } from "./components/Table";
import { Input } from "./components/Input";
import { DropDown } from "./components/DropDown";
import { DatePicker } from "./components/DatePicker";
import {
  formatDate,
  convertData,
  generateFileInputError,
  generateUser,
  addOutSideUsers,
  hasError,
  downloadData,
  defineOptions,
  calculateAllHours,
  createUserForProjections
} from "./utils/helpers";
import {
  clientsReportConfig,
  namesConfig,
  optionsNames,
  monthNames,
} from "./utils/constants";
import { Interval } from "luxon";
import { ReportConfigActions } from "./components/ReportConfigActions"
import { NameConfigActions } from "./components/NameConfigActions"
import { RedUsersData } from "./components/RedUsersData"

function App() {
  const [fileListFirst, setFileListFirst] = useState(null);
  const [fileListSecond, setFileListSecond] = useState(null);
  const [fileListThird, setFileListThird] = useState(null);
  const clientStorageConfig = JSON.parse(localStorage.getItem("clientConfig")) || clientsReportConfig;
  const namesStorageConfig = JSON.parse(localStorage.getItem("nameConfig")) || namesConfig;
  const [showDataToCopy, setShowDataToCopy] = useState(false)

  const optionsConfig = defineOptions(clientStorageConfig);

  //report add
  const [reportName, setReportName] = useState("");
  const [reportUserNaming, setReportUserNaming] = useState("");
  const [reportHoursNaming, setReportHoursNaming] = useState("");

  //user name add
  const [userKey, setUserKey] = useState("");
  const [userVariations, setUserVariations] = useState("");
  const [userReport, setUserReport] = useState([]);

  const [nameConfig, setNameConfig] = useState(namesStorageConfig);
  const [clientReportConfig, setClientReportConfig] = useState(clientStorageConfig);

  const [options, setOptions] = useState(optionsConfig || optionsNames);
  const [date, setDate] = useState(formatDate(new Date()));
  const [endDate, setEndDate] = useState(
    formatDate(new Date(new Date().setDate(new Date().getDate() + 7)))
  );

  const [selected, setSelected] = useState(null);
  const [clientConfigKey, setClientConfigKey] = useState({
    personName: "",
    submittedHoursName: "",
  });

  const [firstFileData, setFirstFileData] = useState([]);
  const [secondFileData, setSecondFileData] = useState([]);
  const [thirdFileData, setThirdFileData] = useState([]);

  const [firstInputError, setFirstInputError] = useState(null);
  const [thirdInputError, setThirdInputError] = useState(null);

  const [dropDownError, setDropDownError] = useState(null);
  const [overalData, setOverlaData] = useState([]);

  const handleChecked = (isChecked, row) => {
    const dataCopy = [...overalData];
    const user = dataCopy.find((el) => el.name === row.name);
    if (!user) {
      return;
    }

    user.hasError = !isChecked;
    setOverlaData(dataCopy);
  };

  useEffect(() => {
    if (!localStorage.getItem("clientConfig")) {
      localStorage.setItem("clientConfig", JSON.stringify(clientsReportConfig));
    }

    if (!localStorage.getItem("nameConfig")) {
      localStorage.setItem("nameConfig", JSON.stringify(namesConfig));
    }
  }, []);

  useEffect(() => {
    if (selected) {
      setClientConfigKey({
        personName: clientReportConfig[selected.name][0],
        submittedHoursName: clientReportConfig[selected.name][1],
      });
    }
  }, [selected]);

  const reworkClientReport = (copyClientReport, user, possibleNames) => {
    const index = copyClientReport.findIndex((clientReportRecord) => {
      return (
        clientReportRecord[clientConfigKey.personName]?.trim() === user.name ||
        possibleNames.includes(clientReportRecord[clientConfigKey.personName]?.trim())
      );
    });

    if (index >= 0) {
      user.hours.client = Number(
        copyClientReport[index].reportCalcHours
      );
      copyClientReport.splice(index, 1);
    };
  };

  const reworkRevenueReport = (copyThirdReport, user, possibleNames) => {
    const startDate = new Date(date);
    const endDate1 = new Date(endDate);
    endDate1.setDate(endDate1.getDate() + 1);
    let hours = 0;

    const intervals = Interval.fromDateTimes(startDate, endDate1).splitBy({ day: 1 }).map((d) => `${d.start.day}-${d.start.month}`);

    const thirdUserIndex = copyThirdReport.findIndex((thirdReportRecord) => {
      return (
        thirdReportRecord.name === user.name ||
        possibleNames.includes(thirdReportRecord.name)
      );
    });

    if (thirdUserIndex >= 0) {
      const thirdUser = copyThirdReport[thirdUserIndex];
      intervals.forEach((day) => {
        const dayHours = Number(thirdUser.hoursCalc[day]) || 0
        hours += dayHours;
      });
      user.hours.third = hours;
      user.isPTO = thirdUser["Booking Type"];
      user.manager = thirdUser["manager"] || "";
      user.managerTag = thirdUser["managerTag"] || "";
      copyThirdReport.splice(thirdUserIndex, 1);
    }

  };

  function toSimpleReport(openAirReport, clientReport, thirdReport) {
    const report = [];
    const copyOpenAirReport = [];
    let copyClientReport = [];
    let copyThirdReport = [];
    let thirdReportUser = {};

    openAirReport.forEach((el) => {
      const user = copyOpenAirReport.find((user) => user.User?.trim() === el.User?.trim());
      let elementHours = Number(el["Submitted hours"]) + Number(el["Approved hours"]);
      if (user) {
        user.openAirHours += elementHours
      } else {
        let element = {
          ...el,
          openAirHours: elementHours
        }
        copyOpenAirReport.push(element);
      }
    });

    clientReport.forEach((el) => {
      const user = copyClientReport.find(
        (user) =>
          user[clientConfigKey.personName]?.trim() === el[clientConfigKey.personName]?.trim()
      );
      if (user) {
        user.reportCalcHours = user.reportCalcHours +  calculateAllHours(el, clientConfigKey)
      } else {
        let userWithCalcHours = {
          ...el,
          reportCalcHours: calculateAllHours(el, clientConfigKey)
        };
        copyClientReport.push(userWithCalcHours);
      }
    });

    thirdReport.forEach((el) => {
      let workingRecord = thirdReportUser[el.Assignee?.trim()];
      if (workingRecord) {
        if (!workingRecord["Booking Type"].includes(el["Booking Type"])) {
          workingRecord["Booking Type"] = [...workingRecord["Booking Type"], el["Booking Type"]]
        }
        
        Object.keys(el)
        .filter((num) => !isNaN(Number(num))) 
        .forEach((day) => {
          let keyForHour = [`${day}-${monthNames.indexOf(el.Month)}`];
          workingRecord.hoursCalc = {
            ...workingRecord.hoursCalc,
          };
          workingRecord.hoursCalc[keyForHour] = Number(el[day]) + (Number(workingRecord.hoursCalc[keyForHour]) || 0);
        });

        thirdReportUser[el.Assignee] = workingRecord;

      } else {
        workingRecord = createUserForProjections(el);
        Object.keys(el)
        .filter((num) => !isNaN(Number(num))) //[1,3,4]
        .forEach((day) => {
          workingRecord.hoursCalc = {
            ...workingRecord.hoursCalc,
            [`${day}-${monthNames.indexOf(el.Month)}`]: Number(el[day]), 
          };
        });

        thirdReportUser[el.Assignee] = workingRecord;
      }
    });

    copyThirdReport.push(...Object.values(thirdReportUser));

    copyOpenAirReport.forEach((openAirRecord) => {
      const user = generateUser(openAirRecord);
      const possibleNames = nameConfig[user.name]?.variations || [];
      reworkClientReport(copyClientReport, user, possibleNames);
      reworkRevenueReport(copyThirdReport, user, possibleNames);
      report.push(user);
    });

    addOutSideUsers(
      copyClientReport,
      clientConfigKey.personName?.trim(),
      reworkClientReport,
      report,
      nameConfig
    );

    addOutSideUsers(
      copyThirdReport,
      "name",
      reworkRevenueReport,
      report,
      nameConfig
    );

    return report;
  }

  useEffect(() => {
    let report = toSimpleReport(firstFileData, secondFileData, thirdFileData);
    let updatedReport = report.map((item) => {
      return {
        ...item,
        hasError: hasError(item),
      };
    });

    setOverlaData(updatedReport);
  }, [firstFileData, secondFileData, thirdFileData]);

  const getData = () => {
    if (!fileListFirst || !fileListFirst?.length || !fileListThird || !fileListThird?.length ) {
      setFirstInputError(generateFileInputError(fileListFirst));
      setThirdInputError(generateFileInputError(fileListThird));
      setOverlaData([]);
      return;
    } 

    if ((fileListSecond || fileListSecond?.length) && !selected) {
      setDropDownError(generateFileInputError(selected, "Please select the platform!"));
      setOverlaData([]);
      return;
    }

    convertData(Array.from(fileListFirst || []), setFirstFileData);
    convertData(Array.from(fileListSecond || []), setSecondFileData);
    convertData(Array.from(fileListThird || []), setThirdFileData);
  };

  const saveReportChnages = () => {
    let timeColumnsArray = reportHoursNaming.split(";").map(el => el.trim());
    let configCopy = {
      ...clientReportConfig,
      [reportName.trim()]: [reportUserNaming.trim(), [...timeColumnsArray]],
    };
    setClientReportConfig(configCopy);
    localStorage.setItem("clientConfig", JSON.stringify(configCopy));
  };

  const saveUserNameChnages = () => {
    let userVariationsArray = userVariations.split(";").map(el => el.trim());
    let nameCopy = {
      ...nameConfig,
      [userKey]: {variations: [...userVariationsArray], reportName: userReport},
    };

    setNameConfig(nameCopy);
    localStorage.setItem("nameConfig", JSON.stringify(nameCopy));
  };

  return (
    <>
      <div className="mx-5 mt-5">
        <ReportConfigActions
          saveReportChnages={saveReportChnages}
          reportName={reportName}
          setReportName={setReportName}
          reportUserNaming={reportUserNaming}
          setReportUserNaming={setReportUserNaming}
          reportHoursNaming={reportHoursNaming}
          setReportHoursNaming={setReportHoursNaming}
          clientReportConfig={clientReportConfig}
          setOptions={setOptions}
          setSelected={setSelected}
          setClientReportConfig={setClientReportConfig}
        />
        <NameConfigActions
          saveUserNameChnages={saveUserNameChnages}
          userKey={userKey}
          setUserKey={setUserKey}
          userVariations={userVariations}
          setUserVariations={setUserVariations}
          setUserReport={setUserReport}
          userReport={userReport}
          setNameConfig={setNameConfig}
          nameConfig={nameConfig}
          options={options}
        />
      </div>
      <div className="d-flex mx-5 flex-column">
        <div className="border-bottom py-4">
          <h5 className="mb-2">OpenAir Report</h5>
          <Input
            fileList={fileListFirst}
            text="Upload OpenAir Report"
            error={firstInputError}
            onChangeHandler={(event) => {
              setFileListFirst(event.target.files);
              setFirstInputError(generateFileInputError(event.target.files));
            }}
          ></Input>
        </div>
        <div className="border-bottom py-4">
          <h5>Client Report</h5>
          <Input
            fileList={fileListSecond}
            error={null}
            text="Upload Client Report"
            onChangeHandler={(event) => {
              setFileListSecond(event.target.files);
            }}
          />

          <DropDown
            options={options}
            error={dropDownError}
            setDropDownError={setDropDownError}
            selected={selected}
            setSelected={setSelected}
            text="Please select customer platform"
          ></DropDown>
        </div>
        <div className="border-bottom py-4">
          <h5>Projections Report</h5>
          <Input
            fileList={fileListThird}
            error={thirdInputError}
            text="Upload Rav Report"
            onChangeHandler={(event) => {
              setFileListThird(event.target.files);
              setThirdInputError(generateFileInputError(event.target.files));
            }}
          ></Input>
          <div className="d-flex">
            <DatePicker
              label="Start date:"
              date={date}
              setDate={setDate}
              max={endDate}
            ></DatePicker>
            <DatePicker
              label="End date:"
              date={endDate}
              setDate={setEndDate}
              min={date}
            ></DatePicker>
          </div>
        </div>
        <div className="w-100 my-4">
          <button className="btn btn-secondary" type="submit" onClick={getData}>
            Compare data
          </button>
        </div>
      </div>
      <div className="d-flex">
        {overalData.length ? (
          <div className="ml-5 d-flex flex-column">
            <Table handleChange={handleChecked} data={overalData}></Table>
            <div className="mb-4">
              <button
                className="btn btn-secondary mr-2"
                onClick={() => {
                  downloadData(overalData);
                }}
              >
                Download Data
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowDataToCopy(true);
                }}
              >
                Show Data Below
              </button>
            </div>
            {
              showDataToCopy ? <RedUsersData startDate={date} endDate={endDate} data={overalData}></RedUsersData> : null
            }
          </div>
        ) : null}
      </div>
    </>
  );
}

export default App;
