// content.js
function extractVideoInfo() {
  function findVideoElement() {
    return document.querySelector('video');
  }

  function getVideoTitle() {
    // Try different methods to get video title
    const youtubeTitleElement = document.querySelector('h1.title.style-scope.ytd-video-primary-info-renderer');
    if (youtubeTitleElement) return youtubeTitleElement.textContent.trim();
    
    // For other platforms, try to find video title in meta tags
    const metaTitleElement = document.querySelector('meta[property="og:title"]');
    if (metaTitleElement) return metaTitleElement.getAttribute('content');
    
    return document.title;
  }

  function getVideoDescription() {
    // Try to get video description (YouTube specific)
    const youtubeDescElement = document.querySelector('#description-text');
    if (youtubeDescElement) return youtubeDescElement.textContent.trim();
    
    // For other platforms
    const metaDescElement = document.querySelector('meta[property="og:description"]');
    if (metaDescElement) return metaDescElement.getAttribute('content');
    
    return '';
  }

  function getVideoDuration() {
    const video = findVideoElement();
    return video ? video.duration : null;
  }

  function getVideoTranscript() {
    // This is a simplified example. Actual transcript extraction would depend on the platform
    const transcriptElements = document.querySelectorAll('.caption-visual-line');
    if (transcriptElements.length > 0) {
      return Array.from(transcriptElements).map(el => el.textContent).join(' ');
    }
    return null;
  }

  return {
    title: getVideoTitle(),
    description: getVideoDescription(),
    duration: getVideoDuration(),
    transcript: getVideoTranscript(),
    url: window.location.href
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getVideoInfo') {
    sendResponse(extractVideoInfo());
  }
  return true;
});