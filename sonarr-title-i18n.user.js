// ==UserScript==
// @name                    Sonarr-Title-i18n
// @name:zh                 Sonarr 标题国际化
// @description             利用 TMDB 接口把 Sonarr 中的标题替换成其他语言标题
// @namespace               https://github.com/LuckyPuppy514
// @version                 1.0.0
// @commit                  v1.0.0 创建项目
// @homepage                https://github.com/LuckyPuppy514/Sonarr-Title-i18n
// @updateURL               https://greasyfork.org/zh-CN/scripts/450716-sonarr-title-i18n
// @downloadURL             https://greasyfork.org/zh-CN/scripts/450716-sonarr-title-i18n
// @author                  LuckyPuppy514
// @copyright               2022, Grant LuckyPuppy514 (https://github.com/LuckyPuppy514)
// @license                 MIT
// @icon                    https://cdn.jsdelivr.net/gh/LuckyPuppy514/dashboard-icons/png/sonarr.png
// @include                 *://*sonarr*
// @include                 *://*:8989/*
// @run-at                  document-end
// @require                 https://unpkg.com/jquery@3.2.1/dist/jquery.min.js
// @grant                   GM_setValue
// @grant                   GM_getValue
// @grant                   GM_deleteValue
// @grant                   GM_listValues
// ==/UserScript==

'use strict';

const KEY_TMDB_API_KEY = "KEY_TMDB_API_KEY";
const KEY_LANGUAGE_CODE = "KEY_LANGUAGE_CODE";
const DEFAULT_LANGUAGE_CODE = "zh-CN";
const KEY_TITLE_PREFIX = "TITLE_";
const API_URL = "https://api.themoviedb.org/3/search/tv";

const RIGHT_HEADERF_CLASS_NAME = "PageHeader-right-20I5D";
const POSTER_TITLE_CLASS_NAME = "SeriesIndexPoster-title-1h3SR";
const OVERVIEW_TITLE_CLASS_NAME = "SeriesIndexOverview-title-39hvt SeriesIndexOverview-link-3BWTB Link-link-1HpiV Link-link-1HpiV Link-to-1Sec5";
const DETAILS_TITLE_CLASS_NAME = "SeriesDetails-title-39xGO";
const DETAILS_TITLE_PATH = "/series/";
const CALENDAR_TITLE_CLASS_NAME = "CalendarEvent-seriesTitle-3nGRY";
const CALENDAR_TITLE_AGENDA_CLASS_NAME = "AgendaEvent-seriesTitle-20sIO";
const CALENDAR_TITLE_PATH = "/calendar";
const SERIES_TITLE_CLASS_NAME = "Link-link-1HpiV Link-to-1Sec5";
const SERIES_TITLE_PATH = "/serieseditor, /seasonpass, /queue, /history, /blocklist, /missing, /cutoffunmet";

const i18n_BUTTON_ID = "i18n-button";
const SETTING_HIDDEN_DIV_ID = "setting-hidden-div";
const SETTING_SHOW_DIV_ID = "setting-show-div";
const CLOSE_BUTTON_ID = "close-button";
const SAVE_BUTTON_ID = "save-button";
const CLEAR_CACHE_BUTTON_ID = "clear-cache-button";
const TMDB_API_KEY_INPUT_ID = "tmdb-api-key";
const LANGUAGE_CODE_INPUT_ID = "language-code";
const CSS = `
#i18n-button {
	width: 25px;
	height: 25px;
	margin-top: 17px;
	margin-left: -15px;
	margin-right: 17px;
	border: 0px;
	border-radius: 50%;
	background: rgba(255,255,255, 0);
	background-repeat: no-repeat;
	cursor: pointer;
	z-index: 999
}
.i18n-svg {
	width: 23px;
	height: 23px;
}

#setting-div {
	display: flex;
	justify-content: center;
}

#setting-hidden-div {
	width: 100%;
	height: 100%;
	position: fixed;
	top: 0;
	left: 0;
	background-color: #000000;
	opacity: 0.3;
	display: none;
}
#setting-show-div {
	color: #fff;
	width: 460px;
	height: 210px;
	background-color: rgba(64, 68, 84, 0.9);
	display: none;
	flex-direction: column;
	border-radius: 5px;
	align-items: center;
	padding-top: 50px;
	box-sizing: border-box;
	position: absolute;
	top: 200px;
}
#close-button {
	position: absolute;
	top: 6px;
	right: 6px;
	font-weight: normal;
	display: block;
	width: 30px;
	height: 30px;
	line-height: 30px;
	border: 0px;
	border-radius: 50%;
	text-align: center;
	color: rgba(255, 255, 255, 1);
}
#close-button:hover {
	background-color: rgba(255, 255, 255, 0.5);
	cursor: pointer;
}
#setting-show-div input {
	width: 280px;
	height: 25px;
	border-radius: 5px;
	border: none;
	outline: none;
	margin-left: 5px;
	padding-left: 5px;
	background-color: rgba(0, 0, 0, 1);
	color: rgba(255, 255, 255, 1);
}
#setting-show-div input::-webkit-input-placeholder {
	color: rgb(255, 255, 255);
	opacity: 0.4;
}
#setting-show-div input:first-child {
	margin-bottom: 20px;
}
#save-button {
	cursor: pointer;
	width: 300px;
	height: 30px;
	border-radius: 5px;
	border: none;
	outline: none;
	margin-left: 5px;
	padding-left: 5px;
	background-color: rgba(0, 255, 0, 0.8);
	color: rgba(255, 255, 255, 1);
}
#clear-cache-button:hover {
	background-color: rgba(255, 255, 255, 0.5);
	cursor: pointer;
}
#clear-cache-button {
	position: absolute;
	bottom: 6px;
	right: 7px;
	width: 30px;
	height: 30px;
	line-height: 30px;
	border-radius: 50%;
	background-size: cover;
	background-image: url(https://cdn.jsdelivr.net/gh/LuckyPuppy514/pic-bed/common/icons8-broom-64.png);
	background-repeat: no-repeat;
	background-color: rgba(91, 137, 254, 0);
	color: rgba(255, 255, 255, 0);
	font-weight: normal;
}
strong:hover:after {
	position: absolute;
	left: 30px;
	top: -25px;
	padding: 0px;
	border: 1px solid rgb(255, 255, 255);
	background-color: rgba(0,0,0,0.8);
	border-radius: 3px;
	color: rgba(255, 255, 255, 1);
	content: attr(data-tips);
	text-align: center;
	z-index: 2;
	width: 90px;
	height: 30px;
}
`
const DIV = `
<div id="setting-div">
	<div id="setting-hidden-div"></div>
	<div id="setting-show-div">
		<strong id="close-button" data-tips="Close">❌</strong>
		<span>TMDB API Key&nbsp;&nbsp;🔑<input type="text" id="tmdb-api-key" placeholder="Please input TMDB API Key"></span>
		<span>Language Code&nbsp;✨<input type="text" id="language-code" placeholder="Please input Language Code"></span>
		<span><button type="button" id="save-button">Save</button></span>
        <span style="margin-top: 10px"><a href="https://www.themoviedb.org/settings/api" target="_blank" style="text-decoration: none; color: rgba(0, 255, 0, 0.8);">🔑 Get TMDB API Key 🔑</a></span>
        <strong id="clear-cache-button" data-tips="Clear Cache"></strong>
	</div>
</div>
`

window.onload = function () {
    // 添加按钮和设置组件
    let css = document.createElement("style");
    css.innerHTML = CSS.trim();
    document.head.appendChild(css);
    let div = document.createElement("div");
    div.innerHTML = DIV.trim();
    document.body.appendChild(div);
    let i18nButton = document.createElement("button");
    i18nButton.id = i18n_BUTTON_ID;
    i18nButton.innerHTML = '<svg class="i18n-svg" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="48px" height="48px"><path fill="#CFD8DC" d="M15,13h25c1.104,0,2,0.896,2,2v25c0,1.104-0.896,2-2,2H26L15,13z"/><path fill="#546E7A" d="M26.832,34.854l-0.916-1.776l0.889-0.459c0.061-0.031,6.101-3.208,9.043-9.104l0.446-0.895l1.79,0.893l-0.447,0.895c-3.241,6.496-9.645,9.85-9.916,9.989L26.832,34.854z"/><path fill="#546E7A" d="M38.019 34l-.87-.49c-.207-.116-5.092-2.901-8.496-7.667l1.627-1.162c3.139 4.394 7.805 7.061 7.851 7.087L39 32.26 38.019 34zM26 22H40V24H26z"/><path fill="#546E7A" d="M32 20H34V24H32z"/><path fill="#2196F3" d="M33,35H8c-1.104,0-2-0.896-2-2V8c0-1.104,0.896-2,2-2h14L33,35z"/><path fill="#3F51B5" d="M26 42L23 35 33 35z"/><path fill="#FFF" d="M19.172,24h-4.36l-1.008,3H11l4.764-13h2.444L23,27h-2.805L19.172,24z M15.444,22h3.101l-1.559-4.714L15.444,22z"/></svg>';
    setTimeout(function () {
        let rightHeader = document.getElementsByClassName(RIGHT_HEADERF_CLASS_NAME)[0];
        if (rightHeader) {
            rightHeader.appendChild(i18nButton);
        }
    }, 1000);

    // 添加事件
    let closeButton = document.getElementById(CLOSE_BUTTON_ID);
    let saveButton = document.getElementById(SAVE_BUTTON_ID);
    let clearCacheButton = document.getElementById(CLEAR_CACHE_BUTTON_ID);
    let tmdbApiKeyInput = document.getElementById(TMDB_API_KEY_INPUT_ID);
    let languageCodeInput = document.getElementById(LANGUAGE_CODE_INPUT_ID);
    // 打开设置界面
    i18nButton.onclick = function () {
        let tmdbApiKey = GM_getValue(KEY_TMDB_API_KEY);
        let languageCode = GM_getValue(KEY_LANGUAGE_CODE);
        if (tmdbApiKey) {
            tmdbApiKeyInput.value = tmdbApiKey;
        }
        if (languageCode) {
            languageCodeInput.value = languageCode;
        } else {
            languageCodeInput.value = DEFAULT_LANGUAGE_CODE;
        }
        document.getElementById(SETTING_SHOW_DIV_ID).style.display = "flex";
        document.getElementById(SETTING_HIDDEN_DIV_ID).style.display = "block";
    };
    // 关闭设置界面
    closeButton.onclick = function () {
        let settingShowDiv = document.getElementById(SETTING_SHOW_DIV_ID);
        let settingHiddenDiv = document.getElementById(SETTING_HIDDEN_DIV_ID);
        settingShowDiv.style.display = 'none';
        settingHiddenDiv.style.display = 'none';
        settingShowDiv.style.top = '200px';
        settingShowDiv.style.left = '';
    }
    // 保存设置
    saveButton.onclick = function () {
        GM_setValue(KEY_TMDB_API_KEY, tmdbApiKeyInput.value);
        GM_setValue(KEY_LANGUAGE_CODE, languageCodeInput.value);
        closeButton.click();
    }
    // 清除缓存
    clearCacheButton.onclick = function () {
        let keys = GM_listValues();
        for (let key of keys) {
            if (key.indexOf(KEY_TITLE_PREFIX) != -1) {
                GM_deleteValue(key);
            }
        }
        Toast("Clear Cache Success", 2500);
    }
}
// 显示消息
function Toast(msg, duration) {
    duration = isNaN(duration) ? 3000 : duration;
    var m = document.createElement('div');
    m.innerHTML = msg;
    m.style.cssText = "max-width:60%;min-width: 150px;padding:0 14px;height: 40px;color: rgb(255, 255, 255);line-height: 40px;text-align: center;border-radius: 4px;position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);z-index: 999999;background: rgba(0, 0, 0,.7);font-size: 16px;";
    document.body.appendChild(m);
    setTimeout(function () {
        var d = 0.5;
        m.style.opacity = '0';
        setTimeout(function () { document.body.removeChild(m) }, d * 1000);
    }, duration);
}
// 通过 TMDB 接口获取对应语言标题，并存到本地
function translateTitle() {
    let tmdbApiKey = GM_getValue(KEY_TMDB_API_KEY);
    let languageCode = GM_getValue(KEY_LANGUAGE_CODE);
    if (!tmdbApiKey || !languageCode || tmdbApiKey.indexOf("Error") != -1) {
        return;
    }

    var url = window.location.href;
    var className = POSTER_TITLE_CLASS_NAME;
    var endPath = url.substring(url.lastIndexOf("/"));
    if (endPath != "/") {
        if (CALENDAR_TITLE_PATH.indexOf(endPath) != -1) {
            className = CALENDAR_TITLE_CLASS_NAME;
        } else if (SERIES_TITLE_PATH.indexOf(endPath) != -1) {
            className = SERIES_TITLE_CLASS_NAME;
        } else if (url.indexOf(DETAILS_TITLE_PATH) != -1) {
            className = DETAILS_TITLE_CLASS_NAME;
        }
    }
    var titleDivs = document.getElementsByClassName(className);
    if (className == POSTER_TITLE_CLASS_NAME && (!titleDivs || titleDivs.length == 0)) {
        titleDivs = document.getElementsByClassName(SERIES_TITLE_CLASS_NAME);
        if (!titleDivs || titleDivs.length == 0) {
            titleDivs = document.getElementsByClassName(OVERVIEW_TITLE_CLASS_NAME);
        }
    }
    if (className == CALENDAR_TITLE_CLASS_NAME && (!titleDivs || titleDivs.length == 0)) {
        titleDivs = document.getElementsByClassName(CALENDAR_TITLE_AGENDA_CLASS_NAME);
    }
    for (let titleDiv of titleDivs) {
        tmdbApiKey = GM_getValue(KEY_TMDB_API_KEY);
        if (tmdbApiKey.indexOf("Error") != -1) {
            return;
        }
        let title = titleDiv.innerHTML;
        if (!title) {
            return;
        }
        if (!/[a-zA-Z].*/.test(title) || title.indexOf("<") != -1) {
            continue;
        }
        var chineseTitle = GM_getValue(KEY_TITLE_PREFIX + title);
        if (chineseTitle) {
            titleDiv.innerHTML = chineseTitle;
        } else {
            $.ajax({
                type: "GET",
                url: API_URL + "?api_key=" + tmdbApiKey + "&language=" + languageCode + "&page=1&include_adult=true&query=" + encodeURIComponent(title),
                success: function (res) {
                    if (res && res.results && res.results.length > 0) {
                        chineseTitle = res.results[res.results.length - 1].name;
                        GM_setValue(KEY_TITLE_PREFIX + title, chineseTitle);
                        titleDiv.innerHTML = chineseTitle;
                    } else {
                        GM_setValue(KEY_TITLE_PREFIX + title, title);
                    }
                },
                error: function (err) {
                    GM_setValue(KEY_TMDB_API_KEY, "Error【" + err.responseJSON.status_message + "】");
                    return;
                }
            });
        }
    };
}

setInterval(translateTitle, 600);
