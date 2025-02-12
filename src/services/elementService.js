const MIN = 0;
const MAX = 100;

export const parsePortCount = (portCount) => {
    if (!portCount) {
      return { inputs: {min:MIN, max:MAX}, outputs: {min:MIN, max:MAX} }; // Par défaut, si "portcount" est absent
    }
  
    const [inputPart, outputPart] = portCount.split('/');
  
    const parseValue = (value) => {
      if (!value || value === "-") return {min:MIN, max:MAX};
      if (value.endsWith('-')) {
        return { min: Number(value.replace('-', '')), max: MAX};
      }
      if (value.includes('-')) {
        const [min, max] = value.split('-').map(Number);
        return { min, max };
      }
      return Number(value);
    };

    const inputs = parseValue(inputPart);
    let outputs = parseValue(outputPart);

    if (outputPart === "=") {
      outputs = { ...inputs };
    }
  
    return {
      inputs: inputs,
      outputs: outputs,
    };
  };
  
  export const parseXMLFile = (xmlContent) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "application/xml");
      const entries = xmlDoc.getElementsByTagName("entry");
  
      return Array.from(entries)
        .map((entry) => {
          const name = entry.getAttribute("name");
          const portCount = entry.getAttribute("portcount");
  
          if (!name) return null;
  
          const { inputs, outputs } = parsePortCount(portCount);  
          return {
            name,
            inputs,
            outputs,
          };
        })
        .filter(Boolean);
    } catch (error) {
      console.error("Error parsing XML:", error);
      return [];
    }
  };
  