import parser from "ua-parser-js";

export const getRequestDomain = (log: any) => {
  const domain = log?.request?.host;
  return domain;
};

// todo fix: app name for chromium based browsers is always chrome
export const getRequestApp = (log: any) => {
  const ua = log?.request?.headers["user-agent"];
  const app = getAppNameFromUA(ua);
  return app;
};

/**
 * Processes user agent string of request header and gives back the app name.
 * It uses ua-parser-js library which returns browser name directly but if its an electron app,
 * in place of browser name "electron" is returned then by doing some string manipulations on the user-agent string
 * electron app name is obtained else if it is not an electron app the parser returns 'undefined', so app nam is
 * obtained from the user-agent string.
 *
 * @param {String} userAgent User Agent String
 * @returns {String} name of the app
 */
export const getAppNameFromUA = (userAgent: any) => {
  const { browser } = parser(userAgent);

  let appName;
  if (browser.name === "Electron") {
    appName = userAgent.split(")")[2].split("/")[0];
  } else if (!browser.name) {
    appName = userAgent.split("/")[0];
  } else {
    appName = browser.name;
  }
  return appName;
};
