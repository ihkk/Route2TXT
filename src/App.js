import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import React, { useState } from 'react';






function App() {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event) => {
    const inputText = event.target.value;
    setInputValue(processText(inputText));
  };


  const [result, setResult] = useState({
    dept: {
      name: "",
      address: ""
    },
    dest: {
      name: "",
      address: ""
    },
    cost: 0
  });

  function processText(text) {
    const result = {
      dept: {
        name: "",
        address: ""
      },
      dest: {
        name: "",
        address: ""
      },
      cost: 0
    };


    const departureMatch = text.match(/出発地: ([^\、]+)、([^]+)/);
    if (departureMatch) {
      result.dept.name = departureMatch[1];
      result.dept.address = departureMatch[2].split('\n')[0];
    }

    const destinationMatch = text.match(/目的地: ([^\、]+)、([^]+)/);
    if (destinationMatch) {
      result.dest.name = destinationMatch[1];
      result.dest.address = destinationMatch[2].split('\n')[0];
    }

    const costMatch = text.match(/料金: ([\d,]+)円/);
    if (costMatch) {
      result.cost = parseInt(costMatch[1].replace(/,/g, ''));
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

    // deleter the first three lines
    newText = newText.replace(/^.+\n.+\n.+\n/, "");
    // process same stop transfer
    newText = newText.replace(/(^|\n)(\d{1,2}:\d{2})\n(.+)$\n\d{1,2}:\d{2}/gm, "$1$2\n$3");
    console.log(newText);

    //format
    const lines = newText.trim().split('\n');
    const formattedLines = [];

    const timeRegex = /^\d{1,2}:\d{2}$/;

    for (let i = 0; i < lines.length; i++) {
      if (timeRegex.test(lines[i])) {
        const departure = lines[i + 1] ? lines[i + 1] : '';
        const isTimeFormat = /^\d{1,2}:\d{2}$/.test(lines[i + 2]);
        let mode = isTimeFormat ? '' : (lines[i + 2] ? lines[i + 2] : '');
        mode = mode.replace(/(.*線)/g, "$1 ").replace(/(.*号)/g, "$1 ").replace(/^(電車)/, "").replace(/^(新幹線)/, "").replace(/徒歩徒歩/g, "").replace(/^(バス)/, "バス：");
        mode = mode.replace(/(通勤快急|通勤急行|区間特急|快速急行|空港急行|直通特急|通勤特急|新快速|特快速|準特急|特急線|各停|急行|快速|特急)/g, "$1 ");
        formattedLines.push(`→${lines[i]}【${departure}】${mode}`);
      }
    }
    // remove the last line
    formattedLines.pop();

    const formattedText = formattedLines.join('\n');

    setResult(result);

    return formattedText;

  }




  return (
    <div className="App">
      <div className="container">
        <header class="d-flex flex-wrap justify-content-center py-3 border-bottom">
          <a href="." class="d-flex align-items-center me-md-auto text-dark text-decoration-none">
            <span class="fs-4">Route2TXT</span>
          </a>
        </header>
        <div className='row mt-2'>
          <div className='col-md-4'>
            <label for="inputTextarea" className='form-label'>Input</label>
            <textarea class="form-control textarea-no-scroll" id="inputTextarea" rows="20" onChange={handleInputChange}></textarea>
          </div>
          <div className='col-md-3'>
            <div className='row'>
              <form>
                <div className="mb-3">
                  <label htmlFor="deptName" className="form-label">
                    出発地
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="deptName"
                    name="deptName"
                    value={result.dept.name}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="destName" className="form-label">
                    目的地
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="destName"
                    name="destName"
                    value={result.dest.name}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="cost" className="form-label">
                    料金（円）
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="cost"
                    name="cost"
                    value={result.cost}
                  />
                </div>
              </form>

            </div>
          </div>
          <div className='col-md-5'>
            <label for="outputTextarea" className='form-label'>Result</label>
            <textarea class="form-control textarea-no-scroll" id="outputTextarea" rows="20" value={inputValue}></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
