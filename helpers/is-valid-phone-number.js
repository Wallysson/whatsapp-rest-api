function isValidPhoneNumber(ddd, number) {
  let cleanedNumber = number.replace(/\D/g, "");
  let cleanedDdd = ddd.replace(/\D/g, "");

  if (cleanedNumber.length === 9 && cleanedNumber.startsWith("9")) {
    cleanedNumber = cleanedNumber.slice(1);
  }

  cleanedNumber = cleanedDdd + cleanedNumber;
  if (cleanedNumber.length === 10) {
    cleanedNumber = "55" + cleanedNumber;
  }

  if (!cleanedNumber.endsWith("@c.us")) {
    cleanedNumber += "@c.us";
  }

  return cleanedNumber.length === 17 ? cleanedNumber : false;
}

module.exports = isValidPhoneNumber;
