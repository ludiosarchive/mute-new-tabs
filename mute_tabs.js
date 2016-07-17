// TODO: listen for storage events instead of getting the setting each time?

function orTrue(v) {
	return v === undefined ? true : v;
}

function assert(condition, message) {
	if(!condition) {
		throw message || "Assertion failed";
	}
};

function maybeMuteNewTab(tab) {
	chrome.storage.local.get('muteNewTabs', function(result) {
		const muteNewTabs = orTrue(result.muteNewTabs);
		const tabId = tab.id;
		assert(Number.isInteger(tabId));
		if(muteNewTabs) {
			console.log("Muting new tab:", tab);
			chrome.tabs.update(tabId, {muted: true});
		} else {
			console.log("Not muting new tab:", tab);
		}
	});
}

function getOrigin(url) {
	return new URL(url).origin;
}

// TODO: remove entries when tabs are closed
const tabIdToUrl = Object.create(null);

function navigationCommitted(details) {
	if(details.frameId !== 0) {
		// Ignore navigation in subframes
		return;
	}
	const tabId = details.tabId;
	assert(Number.isInteger(tabId));
	const newUrl = details.url;
	chrome.storage.local.get('muteOnOriginChange', function(result) {
		const muteOnOriginChange = orTrue(result.muteOnOriginChange);
		if(muteOnOriginChange) {
			const oldUrl = tabIdToUrl[tabId];
			console.log("Old URL:", oldUrl);
			let needMute = false;
			if(oldUrl === undefined) {
				needMute = true;
			} else {
				needMute = getOrigin(oldUrl) !== getOrigin(newUrl);
			}
			if(needMute) {
				console.log("Muting tab because new origin:", details);
				chrome.tabs.update(tabId, {muted: true});
			} else {
				console.log("Not muting tab because same origin:", details);
			}
		}
		tabIdToUrl[tabId] = newUrl;
	});
}

function messageFromContentScript(request, sender, sendResponse) {
	console.log("Message from content script: sender=", sender, "request=", request);
	if(request !== "unmute") {
		return;
	}
	const tabId = sender.tab.id;
	assert(Number.isInteger(tabId));
	chrome.tabs.update(tabId, {muted: false});
}

// Navigation events in a tab
chrome.webNavigation.onCommitted.addListener(navigationCommitted);

// New tabs
chrome.tabs.onCreated.addListener(maybeMuteNewTab);

// Messages from content scripts telling us to unmute
chrome.runtime.onMessage.addListener(messageFromContentScript);
