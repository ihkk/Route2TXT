import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';

function processText(text) {
  const result = {
    dept: {
      name: "",
      address: ""
    },
    dest: {
      name: "",
      address: ""
    }
  };

  const departureMatch = text.match(/出発地: ([^\、]+)、([^]+)/);
  if (departureMatch) {
    result.dept.name = departureMatch[1];
    result.dept.address = departureMatch[2].split('\n')[0]; // 假设地址和随后的内容由换行符分隔
  }

  const destinationMatch = text.match(/目的地: ([^\、]+)、([^]+)/);
  if (destinationMatch) {
    result.dest.name = destinationMatch[1];
    result.dest.address = destinationMatch[2].split('\n')[0]; // 假设地址和随后的内容由换行符分隔
  }

  const addCalendarIndex = text.indexOf("カレンダーに追加");
  let newText = text;
  if (addCalendarIndex !== -1) {
    const nextLineIndex = text.indexOf("\n", addCalendarIndex);
    newText = nextLineIndex !== -1 ? text.substring(nextLineIndex + 1) : "";
  }

  const ticketInfoIndex = newText.indexOf("切符などの情報");

  if (ticketInfoIndex !== -1) {
    newText = newText.substring(0, ticketInfoIndex).trim();
  }

  // delete empty lines
  newText = newText.replace(/^[\s	]*$/gm, "");
  newText = newText.replace(/^\s*$/gm, "");
  newText = newText.replace(/\t/g, "");
  newText = newText.replace(/^\s*[\r\n]/gm, "");

  // delete the third line but keep the first line
  newText = newText.replace(/(.*\n.*\n).+\n/, '$1');

  //format
  const lines = newText.trim().split('\n');
  const formattedLines = [];

  const timeRegex = /^\d{1,2}:\d{2}$/;

  for (let i = 0; i < lines.length; i++) {
    if (timeRegex.test(lines[i])) {
      const departure = lines[i + 1] ? lines[i + 1] : '';
      const isTimeFormat = /^\d{1,2}:\d{2}$/.test(lines[i + 2]);
      let mode = isTimeFormat ? '' : (lines[i + 2] ? lines[i + 2] : '');
      mode = mode.replace(/(.*線)/g, "$1 ").replace(/電車/g, "").replace(/徒歩徒歩/g, "").replace(/バス/g, "バス：");
      mode = mode.replace(/(通勤快急|通勤急行|区間特急|快速急行|空港急行|直通特急|通勤特急|新快速|特快速|準特急|各停|急行|快速|特急)/g, "$1 ");
      formattedLines.push(`→${lines[i]}【${departure}】${mode}`);
    }
  }
  // remove the first line and the last line
  formattedLines.shift();
  formattedLines.pop();



  const formattedText = formattedLines.join('\n');



  console.log(formattedText);


  return JSON.stringify(result, null, 2);

}




function App() {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event) => {
    const inputText = event.target.value;
    setInputValue(processText(inputText));
    adjustTextareaHeight(event.target);
    let outputTextarea = document.getElementById('outputTextarea');
    adjustTextareaHeight(outputTextarea);

  };

  const adjustTextareaHeight = (textarea) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };





  return (
    <div className="App">
      <div className="container">
        <header class="d-flex flex-wrap justify-content-center py-3 border-bottom">
          <a href="." class="d-flex align-items-center me-md-auto text-dark text-decoration-none">
            <span class="fs-4">Route2TXT</span>
          </a>
        </header>
        <div className='row mt-2'>
          <div className='col-md-6'>
            <label for="inputTextarea">Input</label>
            <textarea class="form-control textarea-no-scroll" id="inputTextarea" rows="10" onChange={handleInputChange}></textarea>
          </div>
          <div className='col-md-6'>
            <label for="outputTextarea">Input</label>
            <textarea class="form-control textarea-no-scroll" id="outputTextarea" rows="10" value={inputValue}></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
