import { useState } from "react";
import { ModalPopup } from "../components/Modal";
import { DropDown } from "../components/DropDown";

export const AddBlock = ({
  children,
  saveChanges,
  formError,
  isFilter,
  options,
  setFilters,
  filters
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleSaveChnages = () => {
    if (!formError) {
      saveChanges();
      setShowModal(false);
    }
  };

  return (
    <>
      {showModal ? (
        <ModalPopup
          showModal={showModal}
          setShowModal={setShowModal}
          saveChanges={handleSaveChnages}
        >
          {children}
        </ModalPopup>
      ) : null}
      <div className="mx-2 mb-3 d-flex align-items-center">
        <button
          onClick={() => setShowModal(true)}
          type="button"
          className="btn btn-secondary"
        >
          Add configuration
        </button>
        {isFilter ? (
          <div className="d-flex w-100 justify-content-end">
            <DropDown
            options={options}
            selected={filters[0]}
            setSelected={(option) => setFilters([option])}
            text="Filter users"
          ></DropDown>
            <button
              onClick={() => setFilters([])}
              type="button"
              className="btn btn-secondary ml-2"
            >
              Reset Filters
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
};
