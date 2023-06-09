import Papa from "papaparse";
import { monthNames } from "./constants"
import { range, sortBy } from "lodash"

export const formatDate = (date) => {
  let month = date.getUTCMonth() + 1; 
  month = month < 10 ? `0${month}` : month;

  let day = date.getUTCDate();
  day = day < 10 ? `0${day}` : day

  let year = date.getUTCFullYear();
  return year + "-" + month + "-" + day;
};

export const modifyReportConfigData = (config) => {
  return Object.entries(config).map(([key, value]) => {
    return {
      header: key,
      hoursName: value[1],
      userName: value[0],
    };
  });
};

export const modifyNamesConfig = (config) => {
  return Object.entries(config).map(([key, value]) => {
    return {
      header: key,
      relatedFields: value.variations,
      reportName: value.reportName
    };
  });
};

export const convertData = (array = [], dataSetter) => {
  const result = [];
  array.forEach((file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        result.push(...results.data);
        dataSetter(result);
      },
    });
  });
};

export const generateFileInputError = (entity, message) => {
  if (!entity || !entity?.length) {
    return message || "Please attach file to compare!";
  } else {
    return null;
  }
};

export const generateUser = (record) => {
  return {
    name: record.User?.trim() || "",
    manager: "",
    id: `${record.User?.trim()}${record.Project?.trim()}`,
    managerTag: "",
    project: record["Project"]?.trim() || "",
    hasError: false,
    isPTO: "",
    hours: {
      openAir: Number(record.openAirHours) || 0,
      client: null,
      third: null,
      thirdSeparated: {}
    },
  };
};

export const addOutSideUsers = (reportToSearch, naming, prepareUser, reportToAdd, nameConfig) => {
  const reportToSearchCopy = [...reportToSearch];
  reportToSearch.forEach((userEl) => {
    let user = {
      name: userEl[naming] || "",
      id: userEl.id || "",
      hasError: false,
      manager: userEl.manager || "",
      managerTag: userEl.managerTag || "",
      project: userEl.project || "",
      isPTO: userEl["Booking Type"] || "",
      hours: {
        openAir: null,
        client: null,
        third: null,
        thirdSeparated: {}
      },
    };
    const possibleNames = nameConfig[user.name]?.variations || [];
    prepareUser(reportToSearchCopy, user, possibleNames);
    let variation = Object.entries(nameConfig).map(([key, val]) => {
      if (val.variations.includes(user.name)) {
        return key
      };
      return null
    })

    let existingUserIndex = reportToAdd.findIndex((el) => el.name === user.name || possibleNames.includes(el.name) || variation.includes(el.name))
    if (existingUserIndex >= 0) {
      let workingUser = reportToAdd[existingUserIndex];
      user.hours.client = workingUser.hours.client;
      if (workingUser.id === "") {
        reportToAdd.splice(existingUserIndex, 1);
      }
      if (workingUser.project === user.project && workingUser.isPTO === user.isPTO) {
        user.hours.openAir = workingUser.hours.openAir;
        reportToAdd.splice(existingUserIndex, 1);
      }
    } 
    reportToAdd.push(user);
  });
};

export const hasError = (row) => {
  let internalReport = row.hours.openAir;
  let clientReport = row.hours.client;
  let revReport = row.hours.third;
  let isPTO = row.isPTO.includes("PTO");

  const allDifferentValues =
    revReport !== clientReport ||
    clientReport !== internalReport ||
    revReport !== internalReport;

  if (isPTO && revReport !== clientReport) {
    return true;
  }

  if (!isPTO && allDifferentValues) {
    return true;
  }

  return false;
};

export const downloadData = (overalData) => {
  let sortedUsers = sortBy(overalData, [(o) => Object.keys(o.hours.thirdSeparated).length]);
  const userWithMaxHours = sortedUsers[sortedUsers.length - 1];
  const monthNumbers = Object.keys(userWithMaxHours.hours.thirdSeparated).map(data => data.split("-")[1]);
  let uniqMonth = [...new Set(monthNumbers)];
  const popleWithProblem = overalData
    .filter((el) => el.hasError === false);

  const finalData = [];
  let sortedPopleWithProblem = sortBy(popleWithProblem, [(o) => o.project]);
  uniqMonth.forEach((month) => {
    sortedPopleWithProblem.forEach((person) => {
      const daysHours = range(1, 32).map((day) => {
        return person.hours.thirdSeparated[`${day}-${month}`] || 0
      })
      const stringWithHours = daysHours.join(", ");
      const calculatingHoursforMonth = daysHours.reduce(
        (accumulator, currentValue) => accumulator + currentValue,0);
      finalData.push(
        `${monthNames[Number(month)]}, ${person.name.replace(/,/g, "") || "-"}, ${person.project || "Missing"} , ${person.managerTag || "Missing"}, ${person.manager || "Missing"}, ${person.isPTO || "Missing"}, ${calculatingHoursforMonth || 0} , ${stringWithHours}`
        )
    })
  })

  finalData.unshift(`Month, Assignee, Project, Manager Slack, Manager, Booking Type, Total billable hour(s), ${range(1, 32).join(", ")}`);
  let lineConcat = finalData.join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([lineConcat], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;"
      })
    );
    a.setAttribute("download", "data.xlsx");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export const calculateTotalPages = (data, itemsPerPage) => {
  return Math.ceil(data / itemsPerPage);
}

export const defineOptions = (data) => {
  return Object.keys(data).map((key) => { return {name: key } });
}

export const calculatePagesNumber = (curPage, itemsPerPage, data) => {
  const indexOfLastItem = curPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  return data.slice(indexOfFirstItem, indexOfLastItem);
}


export const validateUser = (config, userKey, userVariations) => {
  if (config.includes(userKey.trim())) {
    return "This name is already present"
  } else if (!userKey.trim() || !userVariations.trim()) {
    return "Note! Please fill all the fields";
  } 
    
  return null
  
}

export const validateReport = (config, reportName, reportUserNaming, reportHoursNaming) => {
  if (config.includes(reportName)) {
    return "This name is already present";
  } else if (!reportName || !reportUserNaming || !reportHoursNaming) {
    return "Note! Please fill all the fields";
  } 
    
  return null
}

export const calculateAllHours = (el, clientConfigKey) => {
  let userKeys = Object.keys(el);
  let allHours = 0;
  userKeys.forEach((key) => {
    if (clientConfigKey.submittedHoursName.includes(key)) {
      allHours += Number(el[key])
    }
  });

  return allHours
}

export const showChosenFiles = (files) => {
  const allFilesNames = [...files].map(el => el.name);
  let message = "";
  if (allFilesNames.length === 1) {
    message = "is chosen";
  } else if (allFilesNames.length > 1)  {
    message = "are chosen"
  }

  return `${allFilesNames.join(", ")} ${message}`
}

export const calculateTotalRepotHours = (data, field) => {
  return data.reduce(
    (accumulator, currentValue) => accumulator + (currentValue.hours[field] || 0),
    0
  );
}

export const createUserForProjections = (el) => {
  return {
    name: el.Assignee?.trim(),
    id: `${el.Assignee?.trim()}${el["Project"]?.trim()}${el["Booking Type"]?.trim()}`,
    hoursCalc: {},
    "Booking Type": el["Booking Type"]?.trim() || "",
    manager: el.Manager?.trim() || "",
    managerTag: el["Manager Slack"]?.trim() || "",
    project: el["Project"]?.trim() || ""
  };
}