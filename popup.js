const muteNewTabsElem = document.getElementById('mute_new_tabs');

muteNewTabsElem.onchange = function(ev) {
	const mute = ev.target.checked;
	chrome.storage.local.set({muteNewTabs: mute}, function() {});
}

chrome.storage.local.get('muteNewTabs', function(result) {
	const muteNewTabs =
		result.muteNewTabs === undefined ?
			true :
			result.muteNewTabs;
	muteNewTabsElem.checked = muteNewTabs;
});
