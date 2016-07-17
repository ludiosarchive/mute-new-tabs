"use strict";

/**
 * Unmute tabs on youtube.com and vimeo.com when you interact with the video's
 * mute button or volume slider.
 */

function unmuteMyTab() {
	chrome.runtime.sendMessage(null, "unmute");
}

/**
 * Get classnames of element and its parents, up to `depth` names.
 */
function getClassNames(elem, depth) {
	const classNames = [];
	while(elem && depth--) {
		classNames.push(elem.className);
		elem = elem.parentNode;
	}
	return classNames;
}

const host = document.location.host;

function mouseDown(ev) {
	//console.log(ev);
	if(host === "www.youtube.com" && /^ytp-(volume|mute)-/.test(ev.target.className)) {
		unmuteMyTab();
	} else if(host === "vimeo.com" && getClassNames(ev.target, 3).includes("volume")) {
		unmuteMyTab();
	} else if(host === "soundcloud.com" && /^volume__/.test(ev.target.className)) {
		unmuteMyTab();
	}
}

// Listen on the whole document instead of specific elements because
// 1) the elements sometimes show up after the DOM is ready
// 2) the elements may be swapped out when switching to another video
document.addEventListener('mousedown', mouseDown, {passive: true});
