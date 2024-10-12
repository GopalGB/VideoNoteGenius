// background.js
const GROQ_API_KEY = 'your-api-key-here';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callGroqAPI(prompt) {
  try {
    console.log('Calling Groq API with prompt:', prompt);
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [{
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 8000  // Increased for more detailed response
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
}

function generateTimestampedNotes(videoInfo) {
  const duration = videoInfo.duration || 600;
  const numTimestamps = Math.min(Math.max(Math.floor(duration / 180), 4), 8);
  const interval = duration / numTimestamps;
  
  return Array.from({length: numTimestamps}, (_, i) => ({
    timestamp: Math.round(interval * (i + 0.5)),
    content: '',
    subtopics: [],
    keyPoints: [],
    examples: [],
    definitions: {}
  }));
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateNotes') {
    const videoInfo = request.videoInfo;
    console.log('Received video info:', videoInfo);

    const timestampedNotes = generateTimestampedNotes(videoInfo);
    
    const prompt = `
As an expert academic note generator, produce comprehensive and well-structured study notes for a video lecture with the following information:

Title: "${videoInfo.title}"
Description: "${videoInfo.description || 'Not available'}"
Duration: ${videoInfo.duration || 'unknown'} seconds

For each of the ${timestampedNotes.length} timestamps at (${timestampedNotes.map(note => `${note.timestamp} seconds`).join(', ')}), generate detailed and in-depth academic notes that include the following elements:

Main Topic: The central theme or subject being discussed during this segment of the lecture.
Subtopics: Identify 2-3 closely related subtopics or secondary concepts that elaborate on the main topic or expand on the discussion.
Key Points: Extract and summarize 3-5 critical ideas, insights, or arguments presented by the lecturer, ensuring that they cover essential details that contribute to a deeper understanding of the subject.
Examples and Applications: Provide relevant real-world examples or practical applications that illustrate how the concepts discussed can be applied in academic, professional, or everyday contexts. Wherever possible, link examples to current trends, studies, or case scenarios.
Key Terms and Definitions: Highlight important terminology or specialized vocabulary used in the lecture. For each key term, provide a clear and concise definition that includes both technical meaning and contextual understanding (when applicable).
Detailed Explanations: Include any elaborations, clarifications, or extensions of concepts presented by the lecturer, such as analogies, comparisons, or deeper dives into the material. These explanations should help bridge the gap between abstract ideas and practical comprehension.
Potential Quiz Questions: Create 5-6 thought-provoking questions for each timestamp that test the learner’s understanding of the material. These questions should range from basic factual recall to more analytical or conceptual questions that challenge the learner to apply the concepts discussed.
Additional Resources or References (Optional): If relevant, suggest any academic papers, textbooks, online resources, or other references that may provide further insights into the topics discussed at this timestamp.
Format your response as a JSON array of objects, with each object structured as follows:

{
  "timestamp": number,
  "mainTopic": string,
  "subtopics": string[],
  "keyPoints": string[],
  "examples": string[],
  "definitions": {
    "term1": "definition1",
    "term2": "definition2"
  },
  "detailedExplanations": string[],
  "quizQuestions": string[],
  "additionalResources": string[] (optional)
}
Ensure that the notes are highly detailed, academic, and suitable for deep learning and study purposes. Assume that the video is an educational lecture at the college or university level, and provide thorough, structured content to support a comprehensive understanding of the subject matter.


`;
    
    callGroqAPI(prompt)
      .then(response => {
        console.log('Raw API response:', response);
        
        let parsedNotes;
        try {
          parsedNotes = JSON.parse(response);
        } catch (e) {
          console.log('Failed to parse entire response as JSON, trying to extract JSON');
          const jsonMatch = response.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            try {
              parsedNotes = JSON.parse(jsonMatch[0]);
            } catch (e2) {
              console.error('Failed to parse extracted JSON:', e2);
            }
          }
        }
        
        if (Array.isArray(parsedNotes) && parsedNotes.length > 0) {
          chrome.storage.local.set({
            [videoInfo.url]: {
              title: videoInfo.title,
              notes: parsedNotes
            }
          });
          sendResponse({success: true, notes: parsedNotes});
        } else {
          sendResponse({
            success: false,
            error: 'Could not parse notes from AI response',
            rawResponse: response
          });
        }
      })
      .catch(error => {
        sendResponse({
          success: false,
          error: error.message,
          rawResponse: null
        });
      });
    
    return true;
  }
});