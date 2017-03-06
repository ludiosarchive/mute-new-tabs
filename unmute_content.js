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

function includesAny(haystack, needles) {
	for(const needle of needles) {
		if(haystack.includes(needle)) {
			return true;
		}
	}
	return false;
}

const volumeControlChecks = {
	 "www.youtube.com":        ev => /^ytp-(volume|mute)-/.test(ev.target.className)
	,"www.liveleak.com":       ev => getClassNames(ev.target, 6).includes("vjs-volume-menu-button")
	,"vimeo.com":              ev => getClassNames(ev.target, 3).includes("volume")
	,"player.vimeo.com":       ev => getClassNames(ev.target, 3).includes("volume")
	,"twitter.com":            ev => getClassNames(ev.target, 4).includes("volume-control-container")
	,"vine.co":                ev => includesAny(getClassNames(ev.target, 3), ["VolumeControl", "vine-audio"])
	,"soundcloud.com":         ev => /^volume__/.test(ev.target.className)
	,"www.twitch.tv":          ev => getClassNames(ev.target, 4).includes("player-volume")
	,"player.twitch.tv":       ev => getClassNames(ev.target, 4).includes("player-volume")
	,"mynoise.net":            ev => includesAny(getClassNames(ev.target, 5), ["mixer", "controlers"])
	,"www.kickstarter.com":    ev => includesAny(getClassNames(ev.target, 4), ["volume", "volume_container"])
	,"store.steampowered.com": ev => includesAny(getClassNames(ev.target, 3), ["volume_icon", "volume_slider"])
	,"vid.me":                 ev => includesAny(getClassNames(ev.target, 4), ["vjs-volume-menu-button", "vjs-volume-bar"])
	,"www.dailymotion.com":    ev => includesAny(getClassNames(ev.target, 5), ["dmp_VolumeSlider"])
	,"www.vevo.com":           ev => includesAny(getClassNames(ev.target, 6), ["volume"])
	,"www.cnn.com":            ev => includesAny(getClassNames(ev.target, 4), ["vjs-volume-control", "vjs-mute-control"])
	,"edition.cnn.com":        ev => includesAny(getClassNames(ev.target, 4), ["vjs-volume-control", "vjs-mute-control"])
};

const host = document.location.host;

function mouseDown(ev) {
	if(volumeControlChecks[host](ev)) {
		unmuteMyTab();
	}
}

// Listen on the whole document instead of specific elements because
// 1) the elements sometimes show up after the DOM is ready
// 2) the elements may be swapped out when switching to another video
document.addEventListener('mousedown', mouseDown, {passive: true});
