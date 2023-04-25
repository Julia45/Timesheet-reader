export const ReportItemAction = ({ inputValue, changeHandler, actionTitle }) => {
  return (
    <div className="d-flex flex-column mb-3">
      <div>{actionTitle}</div>
      <div>
        <input
          className="w-100"
          value={inputValue}
          onChange={(e) => changeHandler(e.target.value)}
        />
      </div>
    </div>
  );
};
