(function () {
	const SECOND = 1000;
	const MINUTE = SECOND * 60;
	const HOUR = MINUTE * 60;
	const DAY = HOUR * 24;

	const concoursDate = new Date("Apr 14, 2026 08:00:00").getTime();
	const bceDate = new Date("Apr 22, 2026 08:00:00").getTime();
	const rentreeDate = new Date("Sep 1, 2024 08:00:00").getTime();
	const percentElement = document.getElementById("percent0");
	const tickerTrack = document.querySelector(".ticker-track");
	const bceElements = {
		days: document.getElementById("daysBce"),
		hours: document.getElementById("hoursBce"),
		minutes: document.getElementById("minutesBce"),
		seconds: document.getElementById("secondsBce")
	};
	const tickerSpeed = 80;
	let tickerOffset = 0;
	let tickerLastTime = 0;
	let tickerItemWidth = 0;
	let tickerRafId = null;

	function updatePercent(now, distance) {
		const tempsPasse = now - rentreeDate;
		const total = distance + tempsPasse;
		const pourcentage = total > 0 ? (tempsPasse / total) * 100 : 100;
		percentElement.innerText = pourcentage.toFixed(6);
	}

	function updateCountdown() {
		const now = Date.now();
		const distance = concoursDate - now;
		updatePercent(now, distance);

		if (distance <= 0) {
			document.getElementById("days0").innerText = "0";
			document.getElementById("hours0").innerText = "0";
			document.getElementById("minutes0").innerText = "0";
			document.getElementById("seconds0").innerText = "0";
			percentElement.innerText = "100.000000";
			return;
		}

		document.getElementById("days0").innerText = Math.floor(distance / DAY);
		document.getElementById("hours0").innerText = Math.floor((distance % DAY) / HOUR);
		document.getElementById("minutes0").innerText = Math.floor((distance % HOUR) / MINUTE);
		document.getElementById("seconds0").innerText = Math.floor((distance % MINUTE) / SECOND);
	}

	function updateBceCountdown() {
		const now = Date.now();
		const distance = bceDate - now;

		if (!bceElements.days || !bceElements.hours || !bceElements.minutes || !bceElements.seconds) {
			return;
		}

		if (distance <= 0) {
			bceElements.days.innerText = "0";
			bceElements.hours.innerText = "0";
			bceElements.minutes.innerText = "0";
			bceElements.seconds.innerText = "0";
			return;
		}

		bceElements.days.innerText = Math.floor(distance / DAY);
		bceElements.hours.innerText = Math.floor((distance % DAY) / HOUR);
		bceElements.minutes.innerText = Math.floor((distance % HOUR) / MINUTE);
		bceElements.seconds.innerText = Math.floor((distance % MINUTE) / SECOND);
	}

	function refreshPercentOnly() {
		const now = Date.now();
		const distance = concoursDate - now;
		updatePercent(now, distance);
	}

	function clearTicker() {
		if (!tickerTrack) {
			return;
		}

		if (tickerRafId !== null) {
			cancelAnimationFrame(tickerRafId);
			tickerRafId = null;
		}

		tickerTrack.innerHTML = "";
		tickerTrack.style.transform = "translateX(0)";
		tickerOffset = 0;
		tickerLastTime = 0;
		tickerItemWidth = 0;
	}

	function buildTicker() {
		if (!tickerTrack) {
			return;
		}

		const tickerText = (tickerTrack.dataset.tickerText || "").trim();
		const tickerHtml = tickerText.replace(/\btravailler\b/gi, '<span class="ticker-highlight">$&</span>');

		clearTicker();

		if (!tickerText) {
			return;
		}

		const sample = document.createElement("span");
		sample.className = "ticker-item";
		sample.innerHTML = tickerHtml;
		tickerTrack.appendChild(sample);
		tickerItemWidth = sample.getBoundingClientRect().width;

		if (!Number.isFinite(tickerItemWidth) || tickerItemWidth <= 0) {
			tickerTrack.innerHTML = "";
			tickerItemWidth = 0;
			return;
		}

		const minWidthNeeded = window.innerWidth * 2;
		const copies = Math.max(4, Math.ceil(minWidthNeeded / tickerItemWidth));
		tickerTrack.innerHTML = "";

		for (let index = 0; index < copies; index += 1) {
			const item = document.createElement("span");
			item.className = "ticker-item";
			item.innerHTML = tickerHtml;
			item.setAttribute("aria-hidden", index === 0 ? "false" : "true");
			tickerTrack.appendChild(item);
		}
	}

	function animateTicker(timestamp) {
		if (!tickerTrack || tickerItemWidth <= 0) {
			return;
		}

		if (tickerLastTime === 0) {
			tickerLastTime = timestamp;
		}

		const deltaSeconds = (timestamp - tickerLastTime) / 1000;
		tickerLastTime = timestamp;
		tickerOffset += tickerSpeed * deltaSeconds;

		if (tickerOffset >= tickerItemWidth) {
			tickerOffset -= tickerItemWidth;
		}

		tickerTrack.style.transform = `translate3d(${-tickerOffset}px, 0, 0)`;
		tickerRafId = requestAnimationFrame(animateTicker);
	}

	function initTicker() {
		if (!tickerTrack) {
			return;
		}

		buildTicker();

		if (tickerItemWidth <= 0) {
			return;
		}

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			tickerTrack.style.transform = "translateX(0)";
			return;
		}

		tickerLastTime = 0;

		tickerRafId = requestAnimationFrame(animateTicker);
	}

	updateCountdown();
	updateBceCountdown();
	setInterval(updateCountdown, 1000);
	setInterval(updateBceCountdown, 1000);
	setInterval(refreshPercentOnly, 100);
	initTicker();
	window.addEventListener("resize", initTicker);
})();
