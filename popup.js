const muteNewTabsElem = document.getElementById('mute_new_tabs');

muteNewTabsElem.onchange = function(ev) {
	const mute = ev.target.checked;
	console.log("Checked?", mute);
	chrome.storage.local.set({muteNewTabs: mute}, function() {});
}

chrome.storage.local.get('muteNewTabs', function(result) {
	muteNewTabsElem.checked = result.muteNewTabs;
});
