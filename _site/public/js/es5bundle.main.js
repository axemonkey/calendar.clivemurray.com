(function () {
	'use strict';

	const months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

	const getBankHolidays = async (year, month) => {
	  console.log(`get bank holidays for: ${year}, ${month}`);
	  const response = await fetch('https://www.gov.uk/bank-holidays.json');
	  const bh = await response.json();
	  const selectedBH = bh['england-and-wales'].events;
	  return selectedBH;
	};

	/*

	TODO:

	* FIX: bg colors don't print!! AWOOOGA!

	* next/prev month links
	* month chooser
	* main styling
	  * including nice fonts
	* print stylesheet
	* themes?
	* about

	*/

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
	};
	const createNavButtons = (year, month) => {
	  const prevMonth = month === 0 ? 11 : month - 1;
	  const prevYear = month === 0 ? year - 1 : year;
	  const nextMonth = month === 11 ? 0 : month + 1;
	  const nextYear = month === 11 ? year + 1 : year;
	  document.querySelector('.prevMonth').innerHTML = `<a href="/?year=${prevYear}&month=${prevMonth}">&lt;&lt;</a>`;
	  document.querySelector('.nextMonth').innerHTML = `<a href="/?year=${nextYear}&month=${nextMonth}">&gt;&gt;</a>`;
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
	    dateDiv.className = `day day${currDate} day-${days[theDay].toLowerCase()} week${week}`;
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
	  await getBankHolidays(year, month).then(bh => {
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

})();
