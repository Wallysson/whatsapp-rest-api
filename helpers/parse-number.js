function parseBrazilianNumber(cleanDdd, cleanNumber) {
  if (cleanNumber.length === 9 && cleanNumber.startsWith("9")) {
    cleanNumber = cleanNumber.slice(1);
  }

  cleanNumber = cleanDdd + cleanNumber;
  if (cleanNumber.length === 10) {
    cleanNumber = "55" + cleanNumber;
  }

  if (!cleanNumber.endsWith("@c.us")) {
    cleanNumber += "@c.us";
  }

  return cleanNumber.length === 17 ? cleanNumber : false;
}

function parseNumber(countryCode, ddd, number) {
  let cleanNumber = number.replace(/\D/g, "");
  let cleanDdd = ddd.replace(/\D/g, "");
  let cleanCountryCode = countryCode.replace(/\D/g, "");

  if(cleanCountryCode === "55") {
    return parseBrazilianNumber(cleanDdd, cleanNumber)
  } else {
    return  cleanCountryCode + cleanDdd + cleanNumber + "@c.us";
  }

}

module.exports = parseNumber;
