export const DatePicker = ({ date, setDate, label, min, max }) => {
  return (
    <div className="mx-2">
      <label className="mr-2">{label}</label>
      <input
        type="date"
        onChange={(e) => setDate(e.target.value)}
        name="trip-start"
        value={date}
        min={min}
        max={max}
      ></input>
    </div>
  );
};
