import Papa from "papaparse";

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

export const convertData = (array, dataSetter) => {
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
    name: record.User?.trim() || "Failed to read",
    manager: "",
    managerTag: "",
    hasError: false,
    isPTO: "",
    hours: {
      openAir: Number(record.openAirHours) || 0,
      client: null,
      third: null,
    },
  };
};

export const addOutSideUsers = (reportToSearch, naming, prepareUser, reportToAdd, nameConfig) => {
  const reportToSearchCopy = [...reportToSearch];
  reportToSearch.forEach((userEl) => {
    let user = {
      name: userEl[naming] || "Failed to read name",
      hasError: false,
      manager: "",
      managerTag: "",
      isPTO: "",
      hours: {
        openAir: null,
        client: null,
        third: null,
      },
    };
    const possibleNames = nameConfig[user.name] || [];
    prepareUser(reportToSearchCopy, user, possibleNames);
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
  const popleWithProblem = overalData
    .filter((el) => el.hasError === true)
    .map(
      (
        el
      ) => 
      `${el.name} has problems with submitted hours: OpenAir - ${el.hours.openAir}, ClientReport: ${el.hours.client}, Projections report: ${el.hours.third}`
    );
    var lineConcat = popleWithProblem.join("\r\n");


    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([lineConcat], {
        type: "application/txt"
      })
    );
    a.setAttribute("download", "data.txt");
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
  } else  {
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