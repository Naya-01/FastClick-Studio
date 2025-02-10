export const parsePortCount = (portCount) => {
    if (!portCount) {
      return { inputs: "any", outputs: "any" }; // Par défaut, si "portcount" est absent
    }
  
    const [inputPart, outputPart] = portCount.split('/');
  
    const parseValue = (value) => {
      if (!value || value === "-") return "any";
      if (value.includes('-')) {
        return value.split('-').map(Number);
      }
      return isNaN(Number(value)) ? "any" : Number(value);
    };
  
    return {
      inputs: parseValue(inputPart),
      outputs: parseValue(outputPart),
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
  
          return {
            name,
            ...parsePortCount(portCount),
          };
        })
        .filter(Boolean);
    } catch (error) {
      console.error("Error parsing XML:", error);
      return [];
    }
  };
  