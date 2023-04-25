import { useState } from "react";
import "./style.css"

export const DropDown = ({ text, options, selected, setSelected, error, setDropDownError }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (option) => {
    setSelected(option);
    setOpen(false);
    setDropDownError && setDropDownError(null)
  }

  return (
    <>
    <div className="dropdown-container">
      <button
        className="btn btn-secondary dropdown-toggle"
        onClick={() => setOpen(!open)}
        type="button"
        id="dropdownMenuButton"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        {(selected && selected.name) || text}
      </button>
      {
        open ? (
          <div className="position-absolute bg-light dropDown">
            {options.map((option) => {
              return <div key={option.name} className="dropdown-item cursor-pointer" onClick={() => handleSelect(option)}>{option.name}</div>;
            })}
          </div>
        ): null
      }
    </div>
    {
        error ? (
          <div className="text-danger table-danger p-2 my-2">{error}</div>
        ) : null
      }
    </>
  );
};
