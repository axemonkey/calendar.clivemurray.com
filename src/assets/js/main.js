import { months, days } from './modules/data.js';
import {
	getDaysInMonth,
	getTheDay,
	lz,
	getURLParams,
} from './modules/tools.js';
import { getBankHolidays } from './modules/holidays.js';

/*

TODO:

* month chooser
* about - include a thing about printing at 100% to keep it consistent
* main styling
* including nice fonts
* themes?

TO DONE:

* print stylesheet
* FIX: bg colors don't print!! AWOOOGA!
* next/prev month links

TO DON'T:
* "THIS MONTH" button *** not needed, when there is Reset in the nav

*/

const populatePicker = (year, month) => {
	const monthSelect = document.getElementById('select-month');
	const yearInput = document.getElementById('input-year');

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
	const wMonth = document.getElementById('select-month').value;
	const wYear = document.getElementById('input-year').value;
	const newHref = `/?year=${wYear}&month=${wMonth}`;

	document.location = newHref;
};

const togglePicker = () => {
	document.querySelector('.monthPicker').classList.toggle('hide');
};

const init = () => {
	console.log('go');
	let year;
	let month;

	const qp = getURLParams();
	if (qp.get('year') && qp.get('month')) {
		year = Number(qp.get('year'));
		month = Number(qp.get('month'));
	} else {
		const now = new Date();
		month = now.getMonth();
		year = now.getFullYear();
	}

	createNavButtons(year, month);
	createMonth(year, month);
	populatePicker(year, month);

	document.querySelector('.go-button').addEventListener('click', loadMonth);
	document.querySelector('.monthTitle').addEventListener('click', togglePicker);
};

const createNavButtons = (year, month) => {
	const prevMonth = month === 0 ? 11 : month - 1;
	const prevYear = month === 0 ? year - 1 : year;
	const nextMonth = month === 11 ? 0 : month + 1;
	const nextYear = month === 11 ? year + 1 : year;

	document.querySelector('.prevMonth').innerHTML =
		`<a href="/?year=${prevYear}&month=${prevMonth}">&lt;&lt;</a>`;
	document.querySelector('.nextMonth').innerHTML =
		`<a href="/?year=${nextYear}&month=${nextMonth}">&gt;&gt;</a>`;

	document.querySelector('#menu-trigger').addEventListener('click', (event) => {
		event.target.closest('nav').classList.toggle('open');
	});
};

const createMonth = (year, month) => {
	const monthStr = months[month];
	const monthLength = getDaysInMonth(year, month);
	// const nowDay = now.getDay();
	// const dayStr = days[nowDay - 1];
	const firstDay = getTheDay(year, month, 1);
	const firstDayStr = days[firstDay - 1];

	console.log(`${monthStr} ${year} has ${monthLength} days`);
	// console.log(`today: ${dayStr}`);
	console.log(`first day of month: ${firstDayStr}`);

	document.querySelector('.monthTitle').textContent = `${monthStr} ${year}`;

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
	for (let currDate = 1; currDate <= monthLength; currDate++) {
		const dateDiv = document.createElement('div');
		dateDiv.innerHTML = `<p>${currDate}</p>`;
		const theDay = getTheDay(year, month, currDate - 1);
		dateDiv.className = `day day${currDate} day-${days[
			theDay
		].toLowerCase()} week${week}`;
		if (theDay >= 5) {
			dateDiv.classList.add('weekend');
		}
		if (currDate <= 7) {
			dateDiv.classList.add('first7');
		}
		if (currDate > monthLength - 7) {
			dateDiv.classList.add('last7');
		}
		if (currDate === monthLength) {
			dateDiv.classList.add('last');
		}
		dateDiv.dataset.date = `${year}-${lz(month + 1)}-${lz(currDate)}`;
		monthDiv.append(dateDiv);

		if (theDay === 6) {
			week++;
		}
	}

	doBankHolidays(year, month, monthLength);
};

const doBankHolidays = async (year, month, monthLength) => {
	await getBankHolidays(year, month).then((bh) => {
		highlightBankHolidays(bh, year, month, monthLength);
	});
};

const highlightBankHolidays = (bhArray, year, month, monthLength) => {
	console.log(bhArray);

	for (let currDate = 1; currDate <= monthLength; currDate++) {
		const checkDate = `${year}-${lz(month + 1)}-${lz(currDate)}`;

		for (const bh of bhArray) {
			if (bh.date === checkDate) {
				console.log(`BH found! ${checkDate}`);
				const bhDiv = document.querySelector(`[data-date="${checkDate}"]`);
				bhDiv.classList.add('bh');
				const bhLabel = document.createElement('div');
				bhLabel.classList.add('bhLabel');
				bhLabel.textContent = 'Bank Holiday';
				bhDiv.append(bhLabel);
			}
		}
	}
};

window.addEventListener('load', init);
