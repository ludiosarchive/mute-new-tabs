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
	} else if(host === "vimeo.com" && getClassNames(ev.target, 3).includes("volume")) {
		unmuteMyTab();
	} else if(host === "twitter.com" && getClassNames(ev.target, 3).includes("sound-button")) {
		unmuteMyTab();
	} else if(host === "vine.co" && getClassNames(ev.target, 3).includes("VolumeControl")) {
		unmuteMyTab();
	} else if(host === "soundcloud.com" && /^volume__/.test(ev.target.className)) {
		unmuteMyTab();
	} else if(host === "mynoise.net") {
		const classNames = getClassNames(ev.target, 5);
		if(classNames.includes("mixer") || classNames.includes("controlers")) {
			unmuteMyTab();
		}
	}
}

// Listen on the whole document instead of specific elements because
// 1) the elements sometimes show up after the DOM is ready
// 2) the elements may be swapped out when switching to another video
document.addEventListener('mousedown', mouseDown, {passive: true});
