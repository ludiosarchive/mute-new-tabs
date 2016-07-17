const muteNewTabsElem = document.getElementById('mute_new_tabs');
const muteOnOriginChange = document.getElementById('mute_on_origin_change');

muteNewTabsElem.onchange = function(ev) {
	chrome.storage.local.set({muteNewTabs: ev.target.checked}, function() {});
}

muteOnOriginChange.onchange = function(ev) {
	chrome.storage.local.set({muteOnOriginChange: ev.target.checked}, function() {});
}

function orTrue(v) {
	return v === undefined ? true : v;
}

chrome.storage.local.get('muteNewTabs', function(result) {
	const muteNewTabs = orTrue(result.muteNewTabs);
	muteNewTabsElem.checked = muteNewTabs;
});

chrome.storage.local.get('muteOnOriginChange', function(result) {
	const muteOnOriginChange = orTrue(result.muteOnOriginChange);
	muteOnOriginChange.checked = muteOnOriginChange;
});
