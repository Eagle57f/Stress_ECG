(function () {
	const SECOND = 1000;
	const MINUTE = SECOND * 60;
	const HOUR = MINUTE * 60;
	const DAY = HOUR * 24;
	const ECRICOME_MONTH = 3;
	const ECRICOME_DAY = 14;
	const BCE_MONTH = 3;
	const BCE_DAY = 22;
	const RENTREE_MONTH = 8;
	const RENTREE_DAY = 1;
	const EXAM_HOUR = 8;
	const headlineElement = document.getElementById("headline");
	const percentElement = document.getElementById("percent0");
	const tickerTrack = document.querySelector(".ticker-track");
	const tickerSpeed = 80;
	let tickerOffset = 0;
	let tickerLastTime = 0;
	let tickerItemWidth = 0;
	let tickerRafId = null;

	function createDate(year, month, day) {
		return new Date(year, month, day, EXAM_HOUR, 0, 0, 0).getTime();
	}

	function clamp(value, min, max) {
		return Math.min(max, Math.max(min, value));
	}

	function getActiveCountdown(now) {
		const year = new Date(now).getFullYear();
		const ecricomeDate = createDate(year, ECRICOME_MONTH, ECRICOME_DAY);
		const bceDate = createDate(year, BCE_MONTH, BCE_DAY);

		if (now < ecricomeDate) {
			return {
				label: "ECRICOME",
				targetDate: ecricomeDate
			};
		}

		if (now < bceDate) {
			return {
				label: "BCE",
				targetDate: bceDate
			};
		}

		return {
			label: "ECRICOME",
			targetDate: createDate(year + 1, ECRICOME_MONTH, ECRICOME_DAY)
		};
	}

	function updatePercent(now, targetDate) {
		const targetYear = new Date(targetDate).getFullYear();
		const rentreeDate = createDate(targetYear - 1, RENTREE_MONTH, RENTREE_DAY);
		const total = targetDate - rentreeDate;
		const elapsed = now - rentreeDate;
		const pourcentage = total > 0 ? clamp((elapsed / total) * 100, 0, 100) : 100;
		percentElement.innerText = pourcentage.toFixed(6);
	}

	function setMainCountdownValues(distance) {
		document.getElementById("days0").innerText = Math.floor(distance / DAY);
		document.getElementById("hours0").innerText = Math.floor((distance % DAY) / HOUR);
		document.getElementById("minutes0").innerText = Math.floor((distance % HOUR) / MINUTE);
		document.getElementById("seconds0").innerText = Math.floor((distance % MINUTE) / SECOND);
	}

	function setMainCountdownToZero() {
		document.getElementById("days0").innerText = "0";
		document.getElementById("hours0").innerText = "0";
		document.getElementById("minutes0").innerText = "0";
		document.getElementById("seconds0").innerText = "0";
	}

	function updateCountdown() {
		const now = Date.now();
		const activeCountdown = getActiveCountdown(now);
		const distance = activeCountdown.targetDate - now;

		if (headlineElement) {
			headlineElement.innerText = `Temps avant ${activeCountdown.label} :`;
		}

		updatePercent(now, activeCountdown.targetDate);

		if (distance <= 0) {
			setMainCountdownToZero();
			return;
		}

		setMainCountdownValues(distance);
	}

	function refreshPercentOnly() {
		const now = Date.now();
		const activeCountdown = getActiveCountdown(now);
		updatePercent(now, activeCountdown.targetDate);
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

	// Gestion des cookies et du mode
	function setCookie(name, value, days = 365) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		const expires = "expires=" + date.toUTCString();
		document.cookie = name + "=" + value + ";" + expires + ";path=/";
	}

	function getCookie(name) {
		const nameEQ = name + "=";
		const cookies = document.cookie.split(";");
		for (let i = 0; i < cookies.length; i++) {
			let cookie = cookies[i].trim();
			if (cookie.indexOf(nameEQ) === 0) {
				return cookie.substring(nameEQ.length);
			}
		}
		return null;
	}

	function setCountdownMode(mode) {
		const countdownSection = document.getElementById("countdown");
		const countdownBceSection = document.getElementById("countdown-bce");
		const modeBtn = document.getElementById("modeToggleBtn");

		if (mode === "dual") {
			// Afficher les deux compteurs
			if (countdownSection) countdownSection.style.display = "block";
			if (countdownBceSection) countdownBceSection.style.display = "block";
			if (headlineElement) headlineElement.innerText = "Temps avant ECRICOME :";
			if (modeBtn) modeBtn.innerText = "Afficher 1 compteur";
			setCookie("countdownMode", "dual");
		} else {
			// Mode alternant (par défaut)
			if (countdownSection) countdownSection.style.display = "block";
			if (countdownBceSection) countdownBceSection.style.display = "none";
			if (modeBtn) modeBtn.innerText = "Afficher 2 compteurs";
			setCookie("countdownMode", "single");
		}
	}

	function updateDualCountdown() {
		const now = Date.now();
		const year = new Date(now).getFullYear();
		const ecricomeDate = createDate(year, ECRICOME_MONTH, ECRICOME_DAY);
		const bceDate = createDate(year, BCE_MONTH, BCE_DAY);

		// Update ECRICOME
		let distanceEcricome = ecricomeDate - now;
		if (distanceEcricome <= 0) {
			distanceEcricome = createDate(year + 1, ECRICOME_MONTH, ECRICOME_DAY) - now;
		}

		document.getElementById("days0").innerText = Math.floor(distanceEcricome / DAY);
		document.getElementById("hours0").innerText = Math.floor((distanceEcricome % DAY) / HOUR);
		document.getElementById("minutes0").innerText = Math.floor((distanceEcricome % HOUR) / MINUTE);
		document.getElementById("seconds0").innerText = Math.floor((distanceEcricome % MINUTE) / SECOND);

		// Update BCE
		let distanceBce = bceDate - now;
		if (distanceBce <= 0) {
			distanceBce = createDate(year + 1, BCE_MONTH, BCE_DAY) - now;
		}

		document.getElementById("daysBce").innerText = Math.floor(distanceBce / DAY);
		document.getElementById("hoursBce").innerText = Math.floor((distanceBce % DAY) / HOUR);
		document.getElementById("minutesBce").innerText = Math.floor((distanceBce % HOUR) / MINUTE);
		document.getElementById("secondsBce").innerText = Math.floor((distanceBce % MINUTE) / SECOND);

		// Update percentage
		const targetYear = new Date(ecricomeDate).getFullYear();
		const rentreeDate = createDate(targetYear - 1, RENTREE_MONTH, RENTREE_DAY);
		const total = ecricomeDate - rentreeDate;
		const elapsed = now - rentreeDate;
		const pourcentage = total > 0 ? clamp((elapsed / total) * 100, 0, 100) : 100;
		percentElement.innerText = pourcentage.toFixed(6);
	}

	function updateCountdownWrapper() {
		const mode = getCookie("countdownMode") || "single";
		if (mode === "dual") {
			updateDualCountdown();
		} else {
			updateCountdown();
		}
	}

	function toggleMode() {
		const currentMode = getCookie("countdownMode") || "single";
		const newMode = currentMode === "single" ? "dual" : "single";
		setCountdownMode(newMode);
		updateCountdownWrapper();
	}

	// Initialize countdown mode from cookie
	const savedMode = getCookie("countdownMode") || "single";
	setCountdownMode(savedMode);

	updateCountdownWrapper();
	setInterval(updateCountdownWrapper, 1000);
	setInterval(refreshPercentOnly, 100);
	initTicker();
	window.addEventListener("resize", initTicker);

	// Add mode toggle button listener
	const modeToggleBtn = document.getElementById("modeToggleBtn");
	if (modeToggleBtn) {
		modeToggleBtn.addEventListener("click", toggleMode);
	}
})();
