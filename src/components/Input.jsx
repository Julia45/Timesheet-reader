import { showChosenFiles } from "../utils/helpers"

export const Input = ({ onChangeHandler, fileList, text, error }) => {
  return (
    <>
      <div className="input-group mr-2">
        <div className="d-flex mb-2">
          <div className="input-group-prepend">
            <span className="input-group-text">{text}</span>
          </div>
          <div className="custom-file">
            <input
              type="file"
              multiple
              onChange={onChangeHandler}
              className="custom-file-input"
              accept=".csv"
              required
            />
            <label className="custom-file-label">Choose file</label>
          </div>
        </div>
        {fileList ? (
          <div className="d-flex align-items-center mx-2">
            {showChosenFiles(fileList)}
          </div>
        ) : null}
      </div>
      {
        error ? (
          <div className="text-danger table-danger p-2 my-2">{error}</div>
        ) : null
      }
    </>
  );
};
