// popup.js
document.addEventListener('DOMContentLoaded', function() {
  const generateButton = document.getElementById('generateNotes');
  const statusDiv = document.getElementById('status');
  const notesList = document.getElementById('notesList');

  function formatTime(seconds) {
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
  }

  function displayNotes(notes) {
    notesList.innerHTML = '';
    notes.forEach(note => {
      const noteElement = document.createElement('div');
      noteElement.className = 'note-section';
      
      let definitionsList = '';
      for (const [term, definition] of Object.entries(note.definitions)) {
        definitionsList += `<li><strong>${term}</strong>: ${definition}</li>`;
      }
      
      let quizQuestions = '';
      if (note.quizQuestions && note.quizQuestions.length > 0) {
        quizQuestions = `
          <h4>Practice Questions:</h4>
          <ul>
            ${note.quizQuestions.map(q => `<li>${q}</li>`).join('')}
          </ul>
        `;
      }
      
      noteElement.innerHTML = `
        <h3>${formatTime(note.timestamp)}: ${note.mainTopic}</h3>
        
        <h4>Subtopics:</h4>
        <ul>
          ${note.subtopics.map(subtopic => `<li>${subtopic}</li>`).join('')}
        </ul>
        
        <h4>Key Points:</h4>
        <ul>
          ${note.keyPoints.map(point => `<li>${point}</li>`).join('')}
        </ul>
        
        <h4>Examples/Applications:</h4>
        <ul>
          ${note.examples.map(example => `<li>${example}</li>`).join('')}
        </ul>
        
        <h4>Key Terms:</h4>
        <ul>
          ${definitionsList}
        </ul>
        
        ${quizQuestions}
        
        <hr>
      `;
      notesList.appendChild(noteElement);
    });
  }

  function updateStatus(message, isError = false, rawResponse = null) {
    statusDiv.innerHTML = `<p>${message}</p>`;
    if (isError && rawResponse) {
      statusDiv.innerHTML += `
        <details>
          <summary>Debug Info</summary>
          <pre style="white-space: pre-wrap; word-wrap: break-word; max-height: 200px; overflow-y: auto;">
            ${rawResponse}
          </pre>
        </details>
      `;
    }
  }

  generateButton.addEventListener('click', async () => {
    generateButton.disabled = true;
    updateStatus('Generating detailed study notes... because apparently, your brain needs a little help today!');

    try {
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      
      // Add a delay in case of timing issues
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, { action: 'getVideoInfo' }, async videoInfo => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);  // Log the exact error message
            updateStatus('Oh NO!! Could not connect to the content script or find a video. But hey, refreshing the page sounds like a fun activity, right?');
            generateButton.disabled = false;
            return;
          }

          if (videoInfo) {
            chrome.runtime.sendMessage({
              action: 'generateNotes',
              videoInfo
            }, response => {
              if (response.success) {
                displayNotes(response.notes);
                updateStatus('Study notes generated successfully! Now if only they could do the actual studying for you.');
              } else {
                updateStatus(`Error: ${response.error}`, true, response.rawResponse);
              }
              generateButton.disabled = false;
            });
          } else {
            updateStatus('No video found on this page, Please try to refresh the page');
            generateButton.disabled = false;
          }
        });
      }, 100);  // 100ms delay to avoid potential timing issues

    } catch (error) {
      console.error('Error in popup.js:', error.message);
      updateStatus(`Error: ${error.message}`);
      generateButton.disabled = false;
    }
  });
});
