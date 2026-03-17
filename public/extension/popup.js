document.getElementById('analyze').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.body.innerText
  }, async (results) => {
    const text = results[0].result;
    const btn = document.getElementById('analyze');
    btn.innerText = 'Analyzing...';
    
    try {
      // In a real extension, this would point to your deployed APP_URL
      const response = await fetch('https://ais-dev-snmrerw5jyuiha2z76nfod-303277423385.asia-east1.run.app/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      
      document.getElementById('result').style.display = 'block';
      document.getElementById('classification').innerText = data.classification + ' News';
      document.getElementById('score').innerText = data.truthScore + '/100';
      document.getElementById('reason').innerText = data.reasons[0];
      btn.innerText = 'Analyze This Page';
    } catch (e) {
      btn.innerText = 'Error. Try again.';
    }
  });
});
