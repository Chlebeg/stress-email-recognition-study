/**
 * Detect browser type and device type from user agent
 * @returns {Object} {device_type: "phone"|"computer", browser: "Chrome"|"Firefox"|"Safari"|"Edge"|"Other"}
 */
export const getBrowserDevice = () => {
  const ua = window.navigator.userAgent;
  
  // Detect device type
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const device_type = isMobile ? 'phone' : 'computer';
  
  // Detect browser
  let browser = 'Other';
  
  if (/Edg(e|A)\//.test(ua)) {
    browser = 'Edge';
  } else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) {
    browser = 'Chrome';
  } else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) {
    browser = 'Safari';
  } else if (/Firefox\//.test(ua)) {
    browser = 'Firefox';
  } else if (/MSIE|Trident\//.test(ua)) {
    browser = 'InternetExplorer';
  }
  
  return {
    device_type,
    browser
  };
};
