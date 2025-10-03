const getBankHolidays = async (year, month) => {
	console.log(`get bank holidays for: ${year}, ${month}`);

	const response = await fetch("https://www.gov.uk/bank-holidays.json");
	const bh = await response.json();
	const selectedBH = bh["england-and-wales"].events;

	return selectedBH;
};

export { getBankHolidays };
