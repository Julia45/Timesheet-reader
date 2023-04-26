import { AddBlock } from "./AddConfig";
import { ReportItemAction } from "./ReportItemAction";
import { ConfigUserTable } from "./ConfigUserTable";
import { useEffect, useState } from "react";
import { validateUser, convertData } from "../utils/helpers";
import Multiselect from 'multiselect-react-dropdown';
import { namesConfig } from "../utils/constants"

export const NameConfigActions = ({
  saveUserNameChnages,
  userKey,
  setUserKey,
  userVariations,
  setUserVariations,
  setNameConfig,
  setUserReport,
  nameConfig,
  options,
  userReport,
}) => {
  const [showConent, setShowContent] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState([]);
  const [configFile, setConfigFile] = useState(null);
  const [configData, setConfigData] = useState(null);

  useEffect(() => {
    let nameConfigSaved = JSON.parse(localStorage.getItem("nameConfig")) || namesConfig;
    setError(validateUser(Object.keys(nameConfigSaved), userKey, userVariations));
  }, [userKey, userVariations]);

  const saveChangesHandler = () => {
    saveUserNameChnages();
    setUserKey("");
    setUserVariations("");
    setUserReport([])
    setFilters([])
  };

  const addImportedConfig = async () => {
    if (!configFile || !configFile.length) {
      return;
    }
    convertData(Array.from(configFile), setConfigData);
  }

  useEffect(() => {
    const configToAdd = {};
    if (!configData || !configData.length) {
      return;
    }
    configData.forEach((config) => {
      let reports = config.Report.split(";").filter(el => el.trim()).map((el) => {
        return { name: el.trim() }
      });
      let variations = config.Variations.split(";").map(el => el.trim());
      configToAdd[config.Key] = {reportName: reports, variations: variations}
    })

    let previousConfig = {
      ...nameConfig,
      ...configToAdd
    };

    setNameConfig(previousConfig);
    localStorage.setItem("nameConfig", JSON.stringify(previousConfig));
    setConfigFile(null)

  }, [configData])

  const onSelect = (selectedList) => {
    setUserReport(selectedList)
   }

   const onRemove = (selectedList) => {
    setUserReport(selectedList)
   }

  return (
    <div className="border pt-2 mb-2 border-2 table-container">
      <h5 className="ml-2 cursor-pointer" onClick={() => setShowContent(!showConent)}>
        Name Configuration
      </h5>
      {showConent ? (
        <div>
          <AddBlock
            saveChanges={saveChangesHandler}
            blockTitle="Name Configuration"
            formError={error}
            isFilter={true}
            options={options}
            setFilters={setFilters}
            filters={filters}
            configFile={configFile}
            setConfigFile={setConfigFile}
            addImportedConfig={addImportedConfig}
          >
            <div>
              <ReportItemAction
                actionTitle="Please add name key:"
                inputValue={userKey}
                changeHandler={(value) => setUserKey(value)}
              />
              <ReportItemAction
                actionTitle="Please add name variations, separated by ';'"
                inputValue={userVariations}
                changeHandler={(value) => setUserVariations(value)}
              />
              <Multiselect 
              className="mb-3"
              options={options} 
              onSelect={onSelect} 
              onRemove={onRemove}
              displayValue="name"
              />
            </div>
            {error ? (
              <div className="text-danger table-danger p-2">{error}</div>
            ) : null}
          </AddBlock>
          <div>
            <ConfigUserTable
              setNameConfig={setNameConfig}
              data={nameConfig}
              setUserReport={setUserReport}
              options={options}
              filters={filters}
              setFilters={setFilters}
              userReport={userReport}
            ></ConfigUserTable>
          </div>
        </div>
      ) : null}
    </div>
  );
};
