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

    // check language: if there's "出発地" then JP, if there's "已保存" then CN
    let lang;
    if (text.indexOf("出発地") !== -1) {
      lang = "JP";
    } else if (text.indexOf("已保存") !== -1) {
      lang = "CN";
    }

    let departureMatch;
    if (lang === "JP") {
      departureMatch = text.match(/出発地: ([^\、]+)、([^]+)/);
    } else if (lang === "CN") {
      departureMatch = text.match(/从(.*)/);
    }
    if (departureMatch) {
      result.dept.name = departureMatch[1];
    }

    let destinationMatch;

    if (lang === "JP") {
      destinationMatch = text.match(/目的地: ([^\、]+)、([^]+)/);
    }
    else if (lang === "CN") {
      destinationMatch = text.match(/到(.*)/);
    }

    if (destinationMatch) {
      result.dest.name = destinationMatch[1];
    }

    let costMatch;
    if (lang === "JP") {
      costMatch = text.match(/料金: ([\d,]+)円/);
    }
    else if (lang === "CN") {
      costMatch = text.match(/费用：JP¥([\d,]+)/);
    }
    if (costMatch) {
      result.cost = parseInt(costMatch[1].replace(/,/g, ""));
    }


    let addCalendarIndex;
    if (lang === "JP") {
      addCalendarIndex = text.indexOf("カレンダーに追加");
    } else if (lang === "CN") {
      addCalendarIndex = text.indexOf("添加到日历");
    }

    let newText = text;
    if (addCalendarIndex !== -1) {
      const nextLineIndex = text.indexOf("\n", addCalendarIndex);
      newText = nextLineIndex !== -1 ? text.substring(nextLineIndex + 1) : "";
    }


    let ticketInfoIndex;
    if (lang === "JP") {
      ticketInfoIndex = newText.indexOf("切符などの情報");
    } else if (lang === "CN") {
      ticketInfoIndex = newText.indexOf("票务信息");
    }

    if (ticketInfoIndex !== -1) {
      newText = newText.substring(0, ticketInfoIndex).trim();
    }

    // delete empty lines
    newText = newText.replace(/^[\s	]*$/gm, "");
    newText = newText.replace(/^\s*$/gm, "");
    newText = newText.replace(/\t/g, "");
    newText = newText.replace(/^\s*[\r\n]/gm, "");
    console.log(newText);

    // delete the first three lines
    newText = newText.replace(/^.+\n.+\n.+\n/, "");
    // delete the last four line
    newText = newText.replace(/\n.+\n.+\n.+\n.+$/, "");
    // process same stop transfer
    newText = newText.replace(/(^|\n)(\d{1,2}:\d{2})\n(.+)$\n\d{1,2}:\d{2}/gm, "$1$2\n$3");

    //format
    const lines = newText.trim().split('\n');
    const formattedLines = [];

    const timeRegex = /^\d{1,2}:\d{2}$/;

    for (let i = 0; i < lines.length; i++) {
      if (timeRegex.test(lines[i])) {
        const departure = lines[i + 1] ? lines[i + 1] : '';
        const isTimeFormat = /^\d{1,2}:\d{2}$/.test(lines[i + 2]);
        let mode = isTimeFormat ? '' : (lines[i + 2] ? lines[i + 2] : '');
        if (lang === "JP") {
          mode = mode.replace(/(.*線)/g, "$1 ").replace(/(.*号)/g, "$1 ").replace(/^(電車)/, "").replace(/^(新幹線)/, "").replace(/徒歩徒歩/g, "").replace(/^(バス)/, "バス：");
          mode = mode.replace(/(通勤快急|通勤急行|区間特急|快速急行|空港急行|直通特急|通勤特急|新快速|特快速|準特急|特急線|各停|急行|快速|特急)/g, "$1 ");
        } else if (lang === "CN") {
          mode = mode.replace(/(.*线)/g, "$1 ").replace(/(.*Line)/g, "$1 ").replace(/(.*線)/g, "$1 ").replace(/(.*号)/g, "$1 ").replace(/^(火车)/, "").replace(/^(新干线)/, "").replace(/步行步行/g, "").replace(/^(公交)/, "公交：");
          mode = mode.replace(/(通勤快急|通勤急行|区間特急|快速急行|空港急行|直通特急|通勤特急|新快速|特快速|准特急|特急线|各停|急行|快速|特急)/g, "$1 ");

        }
        formattedLines.push(`→${lines[i]}【${departure}】${mode}`);
      }
    }
    // // remove the last line
    // formattedLines.pop();

    const formattedText = formattedLines.join('\n');

    setResult(result);

    return formattedText;

  }




  return (
    <div className="App">
      <div className="container">
        <header class="d-flex flex-wrap justify-content-left py-3 border-bottom">
          <a href="." class="d-flex align-items-center me-md-auto text-dark text-decoration-none">
            <span class="fs-4">Route2TXT</span>
          </a>
        </header>
        {/* warning bar */}
        <div className='row mt-2'>
          <div className='col-md-12'>
            <div className="alert alert-warning" role="alert">
              本サイトは、日本語と中国語のみをサポートしています。This site only supports Japanese and Chinese.
            </div>
            <div className="alert alert-primary" role="alert">
              <code>Ctrl+A</code>を使用して、Googleマップの公共交通機関の経路ページの全内容をコピーし、「入力」ボックスに貼り付けてください。<br />
              Use <code>Ctrl+A</code> to copy all content from the Google Maps public transit route page, and paste it into the "入力" box.

            </div>
          </div>
        </div>
        <div className='row mt-2'>
          <div className='col-md-4'>
            <label for="inputTextarea" className='form-label'>入力</label>
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
            <label for="outputTextarea" className='form-label'>結果</label>
            <textarea class="form-control textarea-no-scroll" id="outputTextarea" rows="20" value={inputValue}></textarea>
          </div>
        </div>
        <footer class="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
          <div class="col-9 d-flex align-items-center">
            <span class="mb-md-0 text-muted">
              ©
              <a href="https://github.com/ihkk" class="link text-muted" target="_blank" style={{ textDecoration: "none" }}>Jacky HE</a>            </span>
          </div>

          <ul class="nav col-3 justify-content-end list-unstyled d-flex">

            <li class="ms-3">
              <a className="text-muted" target="_blank" href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans">
                <i class="bi bi-cc-circle-fill"></i>
              </a>
            </li>

            <li class="ms-1">
              <a className="text-muted" target="_blank" href="https://github.com/ihkk/Route2TXT">
                <i class="bi bi-github"></i>
              </a>
            </li>

          </ul>
        </footer>
      </div>
    </div>
  );
}

export default App;
