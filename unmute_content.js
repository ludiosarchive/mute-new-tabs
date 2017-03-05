"use strict";

/**
 * Content script that assists in unmuting tabs on supported sites when you
 * interact with a mute button or volume slider on the page.
 */

function unmuteMyTab() {
	chrome.runtime.sendMessage(null, "unmute");
}

/**
 * Get classNames of element and its parents, up to `depth` elements,
 * but possibly more class names, because an element can have more than one.
 */
function getClassNames(elem, depth) {
	const classNames = [];
	while(elem && depth--) {
		for(const name of elem.classList) {
			classNames.push(name);
		}
		elem = elem.parentNode;
	}
	return classNames;
}

const host = document.location.host;

function mouseDown(ev) {
	if(host === "www.youtube.com" && /^ytp-(volume|mute)-/.test(ev.target.className)) {
		unmuteMyTab();
	} else if(host === "www.liveleak.com" && /_((un)?muteButton|volumeSlider)/.test(ev.target.id)) {
		unmuteMyTab();
	} else if(host === "vimeo.com" && getClassNames(ev.target, 3).includes("volume")) {
		unmuteMyTab();
	} else if(host === "twitter.com" && getClassNames(ev.target, 4).includes("volume-control-container")) {
		unmuteMyTab();
	} else if(host === "vine.co" && getClassNames(ev.target, 3).includes("VolumeControl")) {
		unmuteMyTab();
	} else if(host === "soundcloud.com" && /^volume__/.test(ev.target.className)) {
		unmuteMyTab();
	} else if(host === "www.twitch.tv" && getClassNames(ev.target, 4).includes("player-volume")) {
		unmuteMyTab();
	} else if(host === "mynoise.net") {
		const classNames = getClassNames(ev.target, 5);
		if(classNames.includes("mixer") || classNames.includes("controlers")) {
			unmuteMyTab();
		}
	} else if(host === "www.kickstarter.com") {
		const classNames = getClassNames(ev.target, 4);
		if(classNames.includes("volume") || classNames.includes("volume_container")) {
			unmuteMyTab();
		}
	} else if(host === "store.steampowered.com") {
		const classNames = getClassNames(ev.target, 3);
		if(classNames.includes("volume_icon") || classNames.includes("volume_slider")) {
			unmuteMyTab();
		}
	} else if(host === "vid.me") {
		const classNames = getClassNames(ev.target, 4);
		if(classNames.includes("vjs-volume-menu-button") || classNames.includes("vjs-volume-bar")) {
			unmuteMyTab();
		}
	}
}

// Listen on the whole document instead of specific elements because
// 1) the elements sometimes show up after the DOM is ready
// 2) the elements may be swapped out when switching to another video
document.addEventListener('mousedown', mouseDown, {passive: true});

if(host === "www.cnn.com") {
	const seen = new Set();
	// cnn.com uses <video> elements with controls="true".  The volume controls
	// are part of the Shadow DOM, and click events on the controls don't result
	// in any kind of click event that we can detect.   We need to use another
	// approach to detect intentional use of the volume control, so we use the
	// 'volumechange' event.
	//
	// We assume here that only user interaction leads to a volumechange event,
	// so if the page violates this expectation in the future, this has to be
	// reworked to ignore some volumechange events.
	//
	// The <video> elements aren't on the page when this script is first run,
	// so check for new <video>s often.
	setInterval(() => {
		for(const video of document.getElementsByTagName('video')) {
			if(!seen.has(video)) {
				video.addEventListener('volumechange', unmuteMyTab, false);
				seen.add(video);
			}
		}
	}, 2000);
}
