"use strict";

function assert(condition, message) {
	if(!condition) {
		throw message || "Assertion failed";
	}
}

function inspect(obj) {
	return JSON.stringify(obj);
}

function orTrue(v) {
	return typeof v === "boolean" ? v : true;
}

// i.e. tab is a window of type "normal", not "popup", "panel", "app", or "devtools"
function isTabInNormalWindow(tab) {
	const windowId = tab.windowId;
	assert(Number.isInteger(windowId));
	return windowIdToType[windowId] === "normal";
}

function muteTab(tab) {
	if(isTabInNormalWindow(tab)) {
		console.log(`Muting tab ${tab.id}, url=${inspect(tab.url)}`);
		chrome.tabs.update(tab.id, {muted: true});
	} else {
		console.log(`Not muting tab ${tab.id}, url=${inspect(tab.url)} because it's not in a normal window`);
	}
}

function unmuteTab(tab) {
	chrome.tabs.update(tab.id, {muted: false});
}

function handleNewTab(tab, doMute) {
	const tabId = tab.id;
	console.log(`Tab was created: ${tabId}, doMute=${doMute}`);
	tabIdToTab[tabId] = tab;
	tabIdToUrl[tabId] = null;
	if(doMute) {
		muteTab(tab);
	}
}

function handleCloseTab(tabId) {
	console.log(`Tab was closed: ${tabId}`);
	delete tabIdToTab[tabId];
	delete tabIdToUrl[tabId];
}

function handleNewWindow(window) {
	const windowId = window.id;
	const type     = window.type;
	console.log(`Window was created: ${windowId}, type=${inspect(type)}`);
	windowIdToType[windowId] = type;
}

function handleCloseWindow(windowId) {
	const type = windowIdToType[windowId];
	console.log(`Window was closed: ${windowId}, type=${inspect(type)}`);
}

function getOrigin(url) {
	return new URL(url).origin;
}

function navigationCommitted(details) {
	if(details.frameId !== 0) {
		// Ignore navigation in subframes
		return;
	}
	const tabId  = details.tabId;
	const newUrl = details.url;
	const oldUrl = tabIdToUrl[tabId];
	const tab    = tabIdToTab[tabId];
	tabIdToUrl[tabId] = newUrl;
	if(!tab) {
		console.log(`Tab was navigated: ${tabId} from ${inspect(oldUrl)} to ${inspect(newUrl)} ` +
		            `but we don't have the tab object`);
		return;
	}
	if(settings.muteOnOriginChange) {
		// New tabs navigate from `null` to chrome://* or chrome-*://*; treat
		// those as not needing mute (background: the "Mute new tabs" option can
		// be disabled, so we have to care about this).
		//
		// Some tabs for which we don't have information may navigate from
		// `undefined`; treat those as needing mute.
		const newOrigin = oldUrl === undefined || (oldUrl !== null && getOrigin(oldUrl) !== getOrigin(newUrl));
		console.log(
			`Tab was navigated: ${tabId} from ${inspect(oldUrl)} to ${inspect(newUrl)} ` +
			`(${newOrigin ? "new origin" : "same origin"})`
		);
		if(newOrigin) {
			muteTab(tab);
		}
	}
}

function messageFromContentScript(request, sender, sendResponse) {
	console.log(`Message from content script: sender=${inspect(sender.url)} request=${inspect(request)}`);
	if(request !== "unmute") {
		return;
	}
	if(!settings.unmuteOnVolumeControl) {
		return;
	}
	unmuteTab(sender.tab);
}

function getAllWindows() {
	return new Promise(function(resolve) {
		chrome.windows.getAll(resolve);
	});
}

function getAllTabs() {
	return new Promise(function(resolve) {
		chrome.tabs.query({}, resolve);
	});
}

function getStorageLocal(keys) {
	return new Promise(function(resolve) {
		chrome.storage.local.get(keys, resolve);
	});
}

function keyChanged(key, newValue) {
	assert(typeof key === "string");
	if(settings.hasOwnProperty(key)) {
		settings[key] = orTrue(newValue);
	}
}

function storageChanged(changes, namespace) {
	for(const key in changes) {
		const storageChange = changes[key];
		console.log(
			`Storage key changed: namespace=${inspect(namespace)} key=${inspect(key)} ` +
			`oldValue=${inspect(storageChange.oldValue)} ` +
			`newValue=${inspect(storageChange.newValue)}`
		);
		keyChanged(key, storageChange.newValue);
	}
}

const settings = {
	muteNewTabs:           true,
	muteOnOriginChange:    true,
	muteAllTabsOnStartup:  true,
	unmuteOnVolumeControl: true
}
const tabIdToTab     = Object.create(null);
const tabIdToUrl     = Object.create(null);
const windowIdToType = Object.create(null);

async function start() {
	chrome.storage.onChanged.addListener(storageChanged);
	const result = await getStorageLocal(['muteNewTabs', 'muteOnOriginChange', 'muteAllTabsOnStartup', 'unmuteOnVolumeControl']);
	settings.muteNewTabs           = orTrue(result.muteNewTabs);
	settings.muteOnOriginChange    = orTrue(result.muteOnOriginChange);
	settings.muteAllTabsOnStartup  = orTrue(result.muteAllTabsOnStartup);
	settings.unmuteOnVolumeControl = orTrue(result.unmuteOnVolumeControl);

	chrome.windows.onCreated.addListener(handleNewWindow);
	chrome.windows.onRemoved.addListener(handleCloseWindow);
	const windows = await getAllWindows();
	for(const window of windows) {
		handleNewWindow(window);
	}

	chrome.tabs.onCreated.addListener(tab => handleNewTab(tab, settings.muteNewTabs));
	chrome.tabs.onRemoved.addListener(handleCloseTab);
	const tabs = await getAllTabs();
	for(const tab of tabs) {
		handleNewTab(tab, settings.muteAllTabsOnStartup);
	}

	chrome.webNavigation.onCommitted.addListener(navigationCommitted);
	chrome.runtime.onMessage.addListener(messageFromContentScript);
}

start();
