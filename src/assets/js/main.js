import { months, days } from './modules/data.js';
import {
	getDaysInMonth,
	getTheDay,
	lz,
	getURLParameters,
} from './modules/tools.js';
import { getBankHolidays } from './modules/holidays.js';

/*

TO DONE:

* about - include a thing about printing at 100% to keep it consistent
* main styling
* month chooser
* print stylesheet
* FIX: bg colors don't print!! AWOOOGA!
* next/prev month links

TO DON'T:
* "THIS MONTH" button *** not needed, when there is Reset in the nav

MAYBS:
* themes?

*/

const highlightBankHolidays = (bankHolidayArray, year, month, monthLength) => {
	console.log(bankHolidayArray);

	for (let currentDate = 1; currentDate <= monthLength; currentDate++) {
		const checkDate = `${year}-${lz(month + 1)}-${lz(currentDate)}`;

		for (const bankHoliday of bankHolidayArray) {
			if (bankHoliday.date === checkDate) {
				console.log(`BH found! ${checkDate}`);
				const bankHolidayDiv = document.querySelector(
					`[data-date="${checkDate}"]`,
				);
				bankHolidayDiv.classList.add('bankHoliday');
				const bankHolidayLabel = document.createElement('div');
				bankHolidayLabel.classList.add('bankHolidayLabel');
				bankHolidayLabel.textContent = 'Bank Holiday';
				bankHolidayDiv.append(bankHolidayLabel);
			}
		}
	}
};

const doBankHolidays = async (year, month, monthLength) => {
	await getBankHolidays(year, month).then((bh) => {
		highlightBankHolidays(bh, year, month, monthLength);
	});
};

const populatePicker = (year, month) => {
	const monthSelect = document.querySelector('#select-month');
	const yearInput = document.querySelector('#input-year');

	yearInput.value = year;

	monthSelect.replaceChildren(); // empty the dropdown just in case
	for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
		const monthOption = document.createElement('option');
		monthOption.value = monthIndex;
		monthOption.textContent = months[monthIndex];
		if (monthIndex === month) {
			monthOption.selected = true;
		}
		monthSelect.append(monthOption);
	}
};

const loadMonth = () => {
	const wMonth = document.querySelector('#select-month').value;
	const wYear = document.querySelector('#input-year').value;
	const newHref = `/?year=${wYear}&month=${wMonth}`;

	document.location = newHref;
};

const togglePicker = () => {
	document.querySelector('.monthPicker').classList.toggle('hide');
};

const createNavButtons = (year, month) => {
	const previousMonth = month === 0 ? 11 : month - 1;
	const previousYear = month === 0 ? year - 1 : year;
	const nextMonth = month === 11 ? 0 : month + 1;
	const nextYear = month === 11 ? year + 1 : year;

	document.querySelector('.prevMonth').innerHTML =
		`<a href="/?year=${previousYear}&month=${previousMonth}">&lt;&lt;</a>`;
	document.querySelector('.nextMonth').innerHTML =
		`<a href="/?year=${nextYear}&month=${nextMonth}">&gt;&gt;</a>`;
};

const createMonth = (year, month) => {
	const monthString = months[month];
	const monthLength = getDaysInMonth(year, month);
	// const nowDay = now.getDay();
	// const dayStr = days[nowDay - 1];
	const firstDay = getTheDay(year, month, 1);
	const firstDayString = days[firstDay - 1];

	console.log(`${monthString} ${year} has ${monthLength} days`);
	// console.log(`today: ${dayStr}`);
	console.log(`first day of month: ${firstDayString}`);

	document.querySelector('.monthTitle').textContent = `${monthString} ${year}`;

	const monthHeaderDiv = document.querySelector('.monthHeader');
	const monthDiv = document.querySelector('.monthBody');
	monthDiv.replaceChildren(); // empty the month div

	for (const day of days) {
		const dayDiv = document.createElement('div');
		dayDiv.innerHTML = day.slice(0, 3);
		dayDiv.className = `dayHeader day-${day}`;
		monthHeaderDiv.append(dayDiv);
	}

	let week = 1;
	for (let currentDate = 1; currentDate <= monthLength; currentDate++) {
		const dateDiv = document.createElement('div');
		dateDiv.innerHTML = `<p>${currentDate}</p>`;
		const theDay = getTheDay(year, month, currentDate - 1);
		dateDiv.className = `day day${currentDate} day-${days[
			theDay
		].toLowerCase()} week${week}`;
		if (theDay >= 5) {
			dateDiv.classList.add('weekend');
		}
		if (currentDate <= 7) {
			dateDiv.classList.add('first7');
		}
		if (currentDate > monthLength - 7) {
			dateDiv.classList.add('last7');
		}
		if (currentDate === monthLength) {
			dateDiv.classList.add('last');
		}
		dateDiv.dataset.date = `${year}-${lz(month + 1)}-${lz(currentDate)}`;
		monthDiv.append(dateDiv);

		if (theDay === 6) {
			week++;
		}
	}

	doBankHolidays(year, month, monthLength);
};

const init = () => {
	console.log('go');

	if (document.querySelector('.monthControls')) {
		console.log('main page');
		let year;
		let month;

		const queryParameters = getURLParameters();
		if (queryParameters.get('year') && queryParameters.get('month')) {
			year = Number(queryParameters.get('year'));
			month = Number(queryParameters.get('month'));
		} else {
			const now = new Date();
			month = now.getMonth();
			year = now.getFullYear();
		}

		createNavButtons(year, month);
		createMonth(year, month);
		populatePicker(year, month);

		document.querySelector('.go-button').addEventListener('click', loadMonth);
		document
			.querySelector('.monthTitle')
			.addEventListener('click', togglePicker);
	}

	document.querySelector('#menu-trigger').addEventListener('click', (event) => {
		event.target.closest('nav').classList.toggle('open');
	});
};

window.addEventListener('load', init);
