"use strict";

function byId(id) {
	return document.getElementById(id);
}

const muteNewTabs = byId('mute-new-tabs');
const muteOnOriginChange = byId('mute-on-origin-change');
const unmuteOnVolumeControl = byId('unmute-on-volume-control');

muteNewTabs.onchange = ev => chrome.storage.local.set({muteNewTabs: ev.target.checked}, function() {});
muteOnOriginChange.onchange = ev => chrome.storage.local.set({muteOnOriginChange: ev.target.checked}, function() {});
unmuteOnVolumeControl.onchange = ev => chrome.storage.local.set({unmuteOnVolumeControl: ev.target.checked}, function() {});

function orTrue(v) {
	return typeof v === "boolean" ? v : true;
}

chrome.storage.local.get(['muteNewTabs', 'muteOnOriginChange', 'unmuteOnVolumeControl'], function(result) {
	muteNewTabs.checked = orTrue(result.muteNewTabs);
	muteOnOriginChange.checked = orTrue(result.muteOnOriginChange);
	unmuteOnVolumeControl.checked = orTrue(result.unmuteOnVolumeControl);
});

byId('unmute-label').addEventListener('mouseenter', function() {
	byId('info-automatic-unmute').style.display = "block";
});

byId('unmute-label').addEventListener('mouseleave', function() {
	byId('info-automatic-unmute').style.display = "none";
});
