"use strict";

function byId(id) {
	return document.getElementById(id);
}

const toggles = {
	muteNewTabs: byId('mute-new-tabs'),
	muteOnOriginChange: byId('mute-on-origin-change'),
	muteAllTabsOnStartup: byId('mute-all-tabs-on-startup'),
	unmuteOnVolumeControl: byId('unmute-on-volume-control')
};
const toggleKeys = Object.keys(toggles);

for(const toggle of toggleKeys) {
	toggles[toggle].onchange = ev => chrome.storage.local.set({[toggle]: ev.target.checked}, function() {});
}

function orTrue(v) {
	return typeof v === "boolean" ? v : true;
}

chrome.storage.local.get(Object.keys(toggles), function(result) {
	for(const toggle of toggleKeys) {
		toggles[toggle].checked = orTrue(result[toggle]);
	}
});
