import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import React, { useState, useEffect } from 'react';






function App() {
  const [inputValue, setInputValue] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  const handleInputChange = (event) => {
    const inputText = event.target.value;
    setInputValue(processText(inputText));
  };

  // focus on the input textarea when the page is loaded
  useEffect(() => {
    document.getElementById("inputTextarea").focus();
  }, []);

  // copy to clipboard
  async function copyTextToClipboard(text) {
    if ('clipboard' in navigator) {
      try {
        await navigator.clipboard.writeText(text);
        setCopySuccess('コピーしました Copied to the clipboard');
        setTimeout(() => setCopySuccess(''), 5000);
        return true;
      } catch (error) {
        console.error('Copying to clipboard failed:', error);
        return false;
      }
    } else {
      let textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        var successful = document.execCommand('copy');
        return successful;
      } catch (err) {
        console.error('Fallback: Copying text command was unsuccessful', err);
        return false;
      } finally {
        document.body.removeChild(textArea);
      }
    }
  }



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
    // delete lines starting with "徒歩"
    newText = newText.replace(/^(徒歩.*)$/gm, "徒歩徒歩");
    newText = newText.replace(/^(步行.*)$/gm, "步行步行");

    // delete empty lines
    newText = newText.replace(/^[\s	]*$/gm, "");
    newText = newText.replace(/^\s*$/gm, "");
    newText = newText.replace(/\t/g, "");
    newText = newText.replace(/^\s*[\r\n]/gm, "");


    // delete the first three lines
    newText = newText.replace(/^.+\n.+\n.+\n/, "");
    // delete the last four line if there's cost info
    if (result.cost > 0) {
      newText = newText.replace(/\n.+\n.+\n.+\n.+$/, "");
    } else {
      newText = newText.replace(/\n.+\n.+\n.+$/, "");
    }
    // process same stop transfer
    newText = newText.replace(/(^|\n)(\d{1,2}:\d{2})\n(.+)$\n\d{1,2}:\d{2}/gm, "$1$2\n$3");

    console.log(newText);

    //format
    const lines = newText.trim().split('\n');
    const formattedLines = [];

    const timeRegex = /^\d{1,2}:\d{2}$/;
    const twoTimeRegex = /^(\d{2}:\d{2})(\d{2}:\d{2})$/;
    let platformRegex;
    if (lang === "JP") {
      platformRegex = /([\d+\/]*)\s*番ホーム/;
    } else if (lang === "CN") {
      platformRegex = /第([\d+\/]*)\s*站台/;
    }
    for (let i = 0; i < lines.length; i++) {
      // real time: HH:MMHH:MM in one line to HH:MM (only take the second time)
      if (lines[i].match(twoTimeRegex)) {
        lines[i] = lines[i].replace(twoTimeRegex, "$2");
      }
      if (timeRegex.test(lines[i])) {
        const departure = lines[i + 1] ? lines[i + 1] : '';
        const isTimeFormat = /^\d{1,2}:\d{2}$/.test(lines[i + 2]);
        let mode = isTimeFormat ? '' : (lines[i + 2] ? lines[i + 2] : '');
        if (lang === "JP") {
          mode = mode.replace(/(.*線)/g, "$1 ").replace(/^(.*ライン)/g, "$1 ").replace(/(.*号)/g, "$1 ").replace(/^(電車)/, "").replace(/^(地下鉄)/, "").replace(/^(新幹線)/, "").replace(/徒歩徒歩/g, "").replace(/^(バス)/, "バス：").replace(/^(フェリー)/, "フェリー：");
          mode = mode.replace(/(通勤快急|通勤急行|区間特急|快速急行|空港急行|直通特急|通勤特急|新快速|特快速|準特急|特急線|快特|各停|急行|普通|快速|特急)/g, "$1 ");
        } else if (lang === "CN") {
          mode = mode.replace(/(.*线)/g, "$1 ").replace(/(.*Line)/g, "$1 ").replace(/(.*線)/g, "$1 ").replace(/^(地铁)/, "").replace(/(.*号)/g, "$1 ").replace(/^(火车)/, "").replace(/^(新干线)/, "").replace(/步行步行/g, "").replace(/^(公交)/, "公交：").replace(/^(轮渡)/, "轮渡：");
          mode = mode.replace(/(通勤快急|通勤急行|区間特急|快速急行|空港急行|直通特急|通勤特急|新快速|特快速|准特急|特急线|各站停车|各停|快特|普通|急行|快速|特急)/g, "$1 ");

        }

        // check platform for the i+5 line
        if (platformRegex.test(lines[i + 5])) {
          mode = `${mode} ${lines[i + 5].match(platformRegex)[1]}番線`;
        }

        // check direct train
        if (lang === "JP") {
          if (lines[i + 6] && lines[i + 6].indexOf("直通") !== -1) {
            mode = `${mode} 直通`;
          }
        } else if (lang === "CN") {
          if (lines[i + 6] && lines[i + 6].indexOf("继续乘坐同一辆车") !== -1) {
            mode = `${mode} 直通`;
          }
        }
        formattedLines.push(`→${lines[i]}【${departure}】${mode}`);
      }
    }
    // // remove the last line
    // formattedLines.pop();

    const formattedText = formattedLines.join('\n');

    setResult(result);

    // copy to clipboard when it's not empty
    if (formattedText) {
      if (copyTextToClipboard(formattedText)) {
        console.log("copied");
      } else {
        console.log("failed");
      }
    }

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
            <textarea class="form-control textarea-no-scroll" id="inputTextarea" rows="15" onChange={handleInputChange} placeholder="ここにペースト　Paste here"></textarea>
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
                    disabled={result.dept.name === ""}
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
                    disabled={result.dest.name === ""}
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
                    disabled={result.cost === 0}
                  />
                </div>
              </form>

            </div>
          </div>
          <div className='col-md-5'>
            <label for="outputTextarea" className='form-label'>結果</label>      {copySuccess && <span className="copy-success">{copySuccess}</span>}
            <textarea
              class="form-control textarea-no-scroll"
              id="outputTextarea"
              rows="15"
              value={inputValue}
              onClick={copyTextToClipboard.bind(this, inputValue)}
              disabled={inputValue === ""}>
            </textarea>
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
