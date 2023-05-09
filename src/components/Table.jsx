import { CheckBox } from "./CheckBox";
import { calculateTotalRepotHours } from "../utils/helpers"

const headers = [
  "Surname, Name",
  "OpenAir report",
  "Client system",
  "Projections",
  "Booking Type",
  "Manager",
  "Project",
  "Confirmation",
];

export const Table = ({ data, handleChange }) => {
  
  return (
    <table className="table w-100">
      <thead style={{whiteSpace: "nowrap"}}>
        <tr>
          {headers.map((name, index) => {
            return (
              <th scope="col" key={index}>
                {name}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => {
          return (
            <tr key={`${row.id}${row.isPTO}`} className={`${row.hasError ? "bg-danger text-white" : "bg-secondary text-white"}`}>
              <td>{row.name}</td>
              <td>{row.hours.openAir === null ? "-" : row.hours.openAir}</td>
              <td>{row.hours.client === null ? "-" : row.hours.client }</td>
              <td>{row.hours.third === null ? "-" : row.hours.third}</td>
              <td>{row.isPTO || "Failed to figure out"}</td>
              <td>{row.manager || "Failed to figure out"}</td>
              <td>{row.project || "Failed to figure out"}</td>
              <td>
                  <CheckBox
                    onChangeHandler={(isChecked) => handleChange(isChecked, row)}
                    checkedValue={!row.hasError}
                  />
              </td>
            </tr>
          );
        })}
        <tr className="border">
          <td className="font-weight-bold">Total hours for report</td>
          <td className="border">{calculateTotalRepotHours(data, "openAir")} hours</td>
          <td className="border">{calculateTotalRepotHours(data, "client")} hours</td>
          <td className="border">{calculateTotalRepotHours(data, "third")} hours</td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>
  );
};
