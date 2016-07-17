"use strict";

const muteNewTabsElem = document.getElementById('mute_new_tabs');
const muteOnOriginChange = document.getElementById('mute_on_origin_change');

muteNewTabsElem.onchange = function(ev) {
	chrome.storage.local.set({muteNewTabs: ev.target.checked}, function() {});
}

muteOnOriginChange.onchange = function(ev) {
	chrome.storage.local.set({muteOnOriginChange: ev.target.checked}, function() {});
}

function orTrue(v) {
	return typeof v === "boolean" ? v : true;
}

chrome.storage.local.get(['muteNewTabs', 'muteOnOriginChange'], function(result) {
	muteNewTabsElem.checked = orTrue(result.muteNewTabs);
	muteOnOriginChange.checked = orTrue(result.muteOnOriginChange);
});
