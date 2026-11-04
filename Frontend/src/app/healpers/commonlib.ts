export const formatDateForInput = (dateStr: string): string | null => {
    if (!dateStr) return null;
  
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
  
    const [day, month, year] = parts;
    const date = new Date(+year, +month - 1, +day); // JS months are 0-based
    if (isNaN(date.getTime())) return null;
  
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
  
    return localDate.toISOString().split('T')[0]; // yyyy-MM-dd
  };
  
export function convertAmountToWordsIndian(amount: number): string {
  const singleDigits = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const units = [
    { value: 10000000, name: "Crore" },
    { value: 100000, name: "Lakh" },
    { value: 1000, name: "Thousand" },
    { value: 100, name: "Hundred" }
  ];

  if (amount === 0) return "Rupees Zero Only";

  function twoDigitWord(n: number): string {
    if (n < 10) return singleDigits[n];
    else if (n < 20) return teens[n - 10];
    else return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + singleDigits[n % 10] : "");
  }

  function convertWholeNumber(num: number): string {
    let result = "";

    for (const unit of units) {
      if (num >= unit.value) {
        const count = Math.floor(num / unit.value);
        result += convertWholeNumber(count) + " " + unit.name + " ";
        num = num % unit.value;
      }
    }

    if (num > 0) {
      result += (result !== "" ? "and " : "") + twoDigitWord(num);
    }

    return result.trim();
  }

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let words = `Rupees ${convertWholeNumber(rupees)}`;
  if (paise > 0) {
    words += ` and ${twoDigitWord(paise)} Paise`;
  }
  words += " Only";

  return words;
}