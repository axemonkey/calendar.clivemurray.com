const getDaysInMonth = (year, month) => {
	console.log(`get days in month: ${year}, ${month}`);
	return new Date(year, month + 1, 0).getDate();
};

const getTheDay = (year, month, day) => {
	const theDate = new Date(year, month, day);
	const theDay = theDate.getDay();
	return theDay;
};

const lz = n => {
	return Number(n) < 10 ? `0${n}` : `${n}`;
};

const getURLParams = () => {
	const params = new URLSearchParams(document.location.search);
	return params;
};

export {
	getDaysInMonth,
	getTheDay,
	lz,
	getURLParams,
};
