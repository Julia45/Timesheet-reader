import { useState } from "react";
import { ModalPopup } from "../components/Modal";
import { DropDown } from "../components/DropDown";
import { Input } from "../components/Input";

export const AddBlock = ({
  children,
  saveChanges,
  formError,
  isFilter,
  options,
  setFilters,
  filters = [],
  configFile,
  setConfigFile,
  addImportedConfig
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
      {
        isFilter ? (
          <div className="d-flex mx-2 mb-3">
          <Input
                  fileList={configFile}
                  text="Upload Name Config"
                  onChangeHandler={(event) => {
                    setConfigFile(event.target.files);
                  }}
                />
                <button
                  onClick={() => addImportedConfig()}
                  type="button"
                  className="btn btn-secondary ml-2"
                >
                 Read and add config
                </button>
          </div>
        ) : null
      }

      <div className="mx-2 mb-3 d-flex align-items-center">
        <button
          onClick={() => setShowModal(true)}
          type="button"
          className="btn btn-secondary mr-2"
        >
          Add configuration
        </button>

        {
          isFilter ? (
            <>
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
          </>
          ) : null
        }
      </div>
    </>
  );
};
