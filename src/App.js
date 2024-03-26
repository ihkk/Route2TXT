import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';

function processText(text) {
  return text.split('').reverse().join('');
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
        <div className='row'>
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
