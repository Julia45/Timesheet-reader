import { useState } from "react";
import "./style.css"

export const CheckBox = ({ checkedValue, onChangeHandler }) => {
  const [checked, setChecked] = useState(checkedValue);

  const handleChange = () => {
    setChecked(!checked);
    onChangeHandler(!checked);
  };

  return (
    <div>
      <label className="container mb-0">
        <input type="checkbox" checked={checked} onChange={handleChange} />
        <span className="checkmark"></span>
        {checked ? "Approved" : "Approve"}
      </label>
    </div>
  );
};
