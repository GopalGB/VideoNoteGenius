document.addEventListener('DOMContentLoaded', function() {
  const generateButton = document.getElementById('generateNotes');
  const statusDiv = document.getElementById('status');
  const notesList = document.getElementById('notesList');
  const exportPDFButton = document.getElementById('exportPDF');
  const copyNotesButton = document.getElementById('copyNotes');

  let currentNotes = []; // Store generated notes for export and copying
  let videoTitle = 'Study_Notes'; // Default title in case video title is unavailable

  function formatTime(seconds) {
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
  }

  function displayNotes(notes, title) {
    notesList.innerHTML = '';
    currentNotes = notes; // Save notes for export
    videoTitle = title || 'Study_Notes'; // Use video title if available
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

  function updateStatus(message, isError = false) {
    statusDiv.innerHTML = `<p>${message}</p>`;
    if (isError) {
      console.error(message);
    }
  }

  function enableExportButtons() {
    copyNotesButton.classList.remove('hidden');
    exportPDFButton.classList.remove('hidden');
  }

  generateButton.addEventListener('click', async () => {
    generateButton.disabled = true;
    updateStatus('Generating detailed study notes...');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, { action: 'getVideoInfo' }, async videoInfo => {
          if (chrome.runtime.lastError) {
            updateStatus('Error: Could not connect to content script or find a video', true);
            generateButton.disabled = false;
            return;
          }

          if (videoInfo) {
            chrome.runtime.sendMessage({
              action: 'generateNotes',
              videoInfo
            }, response => {
              if (response.success) {
                displayNotes(response.notes, videoInfo.title);
                updateStatus('Study notes generated successfully!');
                enableExportButtons();
              } else {
                updateStatus(`Error: ${response.error}`, true);
              }
              generateButton.disabled = false;
            });
          } else {
            updateStatus('No video found on this page. Please refresh the page and try again.');
            generateButton.disabled = false;
          }
        });
      }, 100);

    } catch (error) {
      updateStatus(`Error: ${error.message}`, true);
      generateButton.disabled = false;
    }
  });

  // Copy Notes
  copyNotesButton.addEventListener('click', () => {
    if (!currentNotes.length) {
      updateStatus('No notes available to copy!', true);
      return;
    }

    // Convert the notes into a string format for copying
    let notesText = '';
    currentNotes.forEach(note => {
      notesText += `Timestamp: ${formatTime(note.timestamp)}\n`;
      notesText += `Main Topic: ${note.mainTopic}\n`;
      notesText += `Subtopics: ${note.subtopics.join(', ')}\n`;
      notesText += `Key Points: ${note.keyPoints.join(', ')}\n`;
      notesText += `Examples: ${note.examples.join(', ')}\n`;
      notesText += `Key Terms: ${Object.entries(note.definitions).map(([term, def]) => `${term}: ${def}`).join(', ')}\n`;
      notesText += `Quiz Questions: ${note.quizQuestions.join(', ')}\n`;
      notesText += '\n';
    });

    // Use the Clipboard API to copy the text
    navigator.clipboard.writeText(notesText)
      .then(() => {
        updateStatus('Notes copied to clipboard!');
      })
      .catch(err => {
        updateStatus('Failed to copy notes to clipboard.', true);
        console.error('Error copying notes:', err);
      });
  });

  exportPDFButton.addEventListener('click', () => {
    if (!currentNotes.length) {
      updateStatus('No notes available for export!', true);
      return;
    }
  
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
  
    currentNotes.forEach((note, index) => {
      let yPosition = 10;
  
      // Set main topic with bold font
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`Timestamp: ${formatTime(note.timestamp)}`, 10, yPosition);
      yPosition += 10;
      doc.text(`Main Topic: ${note.mainTopic}`, 10, yPosition);
      yPosition += 10;
  
      // Set subtopics, key points, examples, key terms, and quiz questions
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
  
      if (note.subtopics.length > 0) {
        doc.text('Subtopics:', 10, yPosition);
        yPosition += 7;
        note.subtopics.forEach(subtopic => {
          doc.text(`- ${subtopic}`, 15, yPosition);
          yPosition += 7;
        });
      }
  
      if (note.keyPoints.length > 0) {
        doc.text('Key Points:', 10, yPosition);
        yPosition += 7;
        note.keyPoints.forEach(point => {
          const wrappedText = doc.splitTextToSize(`- ${point}`, 180);
          doc.text(wrappedText, 15, yPosition);
          yPosition += wrappedText.length * 7;
        });
      }
  
      if (note.examples.length > 0) {
        doc.text('Examples:', 10, yPosition);
        yPosition += 7;
        note.examples.forEach(example => {
          const wrappedText = doc.splitTextToSize(`- ${example}`, 180);
          doc.text(wrappedText, 15, yPosition);
          yPosition += wrappedText.length * 7;
        });
      }
  
      if (Object.keys(note.definitions).length > 0) {
        doc.text('Key Terms:', 10, yPosition);
        yPosition += 7;
        for (const [term, definition] of Object.entries(note.definitions)) {
          const wrappedText = doc.splitTextToSize(`${term}: ${definition}`, 180);
          doc.text(wrappedText, 15, yPosition);
          yPosition += wrappedText.length * 7;
        }
      }
  
      if (note.quizQuestions.length > 0) {
        doc.text('Quiz Questions:', 10, yPosition);
        yPosition += 7;
        note.quizQuestions.forEach(question => {
          const wrappedText = doc.splitTextToSize(`- ${question}`, 180);
          doc.text(wrappedText, 15, yPosition);
          yPosition += wrappedText.length * 7;
        });
      }
  
      if (index < currentNotes.length - 1) {
        doc.addPage();
      }
    });
  
    doc.save(`${videoTitle}.pdf`);
  });
  
});