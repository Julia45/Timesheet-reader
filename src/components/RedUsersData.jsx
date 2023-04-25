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

  //   const copyText = async () => {
  //     let text = document.getElementById('myText').innerHTML;
  //     const titleSpan = document.createElement("span");
  //     titleSpan.innerHTML = text;
  //     const copiedText =  titleSpan.innerText;

  //     try {
  //         await navigator.clipboard.writeText(copiedText);
  //         console.log('Content copied to clipboard');
  //       } catch (err) {
  //         console.error('Failed to copy: ', err);
  //       }
  //   }

  return (
    <div className="mb-5 manager-tile">
      {/* <button
        className="btn btn-secondary float-right ml-3 copyButton"
        onClick={() => {
          copyText();
        }}
      >
        Copy message
      </button> */}
      <div id="myText">
        <p>
          {!filteredData.length && !redPeople.length ? (
            <>There are no people with incorrect reports.</>
          ) : (
            <>
              Dear Managers, the following people have submitted incorrect
              timesheet reports for the following period:{" "}
              {formateDate(startDate)} - {formateDate(endDate)}
            </>
          )}
        </p>
        {!filteredData.length ? (
          <ul>
            {redPeople.map((info) => {
              return (
                <li>
                  <span className="font-weight-bold">{info.name}:</span>{" "}
                  {info.hours.openAir || 0} hours in OpenAir,{" "}
                  {info.hours.client || 0} hours in Client report,
                  but in projections it should be {info.hours.third || 0} hours
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
                          {subordinate.hours.openAir || 0} hours in OpenAir,{" "}
                          {subordinate.hours.client || 0} hours in Client report,
                          but in projections it should be {subordinate.hours.third || 0} hours
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