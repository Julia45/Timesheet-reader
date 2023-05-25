import { useEffect, useState } from "react";
import { monthNames } from "../utils/constants";
import "./style.css";

export const RedUsersData = ({ data, startDate, endDate }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [redPeople, setRedPeople] = useState([]);

  useEffect(() => {
    let managerNameToUsers = [];
    const popleWithProblem = data.filter((el) => el.hasError === true);
    setRedPeople(popleWithProblem);
    const allManagersNames = popleWithProblem.map((el) => el.manager.trim());
    const uniqueNames = [...new Set(allManagersNames)];

    uniqueNames.forEach((managerName) => {
      let correlation = {
        manager: managerName,
        managerTag: popleWithProblem.find(el => el.manager === managerName)?.managerTag || "",
        subordinates: popleWithProblem.filter(
          (el) => el.manager === managerName
        ),
      };
      managerNameToUsers.push(correlation);
    });

    setFilteredData(managerNameToUsers);
  }, [data]);

  const formateDate = (date) => {
    const day = date.split("-")[2];
    let month = date.split("-")[1];
    const year = date.split("-")[0];

    if (month.startsWith("0")) {
      month = month.replace(/^./, "");
    }

    return `${day} ${monthNames[month]} ${year}`;
  };

  return (
    <div className="mb-5 manager-tile">
      <div id="myText">
        <p>
          {!filteredData.length && !redPeople.length ? (
            <>There are no people with incorrect reports.</>
          ) : (
            <>
              Dear Managers, <br></br> the following people have submitted incorrect timesheet reports or have missed ones for the following period of time:{" "}
              <span className="font-weight-bold">{formateDate(startDate)} - {formateDate(endDate)}</span>, please help to fix this:
            </>
          )}
        </p>
        {!filteredData.length ? (
          <ul>
            {redPeople.map((info) => {
              return (
                <li>
                  <span className="font-weight-bold">{info.name}:</span>{" "}
                  {info.hours.openAir || 0} hour(s) in OpenAir,{" "}
                  {info.hours.client || 0} hour(s) in Client report,{" "}
                  {info.hours.third || 0} hour(s) in projections
                </li>
              );
            })}
          </ul>
        ) : (
          <>
            {filteredData.map((info) => {
              return (
                <div className="">
                  <div className="">
                    {!info.manager
                      ? "No manager specified:"
                      : `${info.manager} ${info.managerTag}:`}
                  </div>
                  <ul>
                    {info.subordinates.map((subordinate) => {
                      return (
                        <li>
                          <span className="font-weight-bold">
                            {subordinate.name}:
                          </span>{" "}
                          {subordinate.hours.openAir || 0} hour(s) in OpenAir,{" "}
                          {subordinate.hours.client || 0} hour(s) in Client report,{" "}
                          {subordinate.hours.third || 0} hour(s) in projections
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
