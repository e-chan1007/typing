import React, { ReactElement } from "react";
import "./App.scss";
// @ts-ignore
import _romanjiHiraganaTSV from "./lib/romanji-hiragana.tsv";
const romanjiHiraganaTSV = _romanjiHiraganaTSV;
romanjiHiraganaTSV.sort((a: string[], b: string[]) => a[0].length - b[0].length);

interface IAppProps {
  [key: string]: string
}

interface IAppState {
  confirmedAnswer?: string,
  confirmedRomanji?: string,
  inputtedRomanji?: string,
  preConfirmedRomanji?: string,
  question?: string,
  questionLabel?: string,
  questionIndex?: number,
  missTyped?: boolean
}

class App extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.generateQuestion = this.generateQuestion.bind(this);
    this.state = { question: "", questionLabel: "", questionIndex: 0, confirmedAnswer: "", confirmedRomanji: "", inputtedRomanji: "", preConfirmedRomanji: "", missTyped: false };
  }
  componentDidMount(): void {
    document.addEventListener("keydown", this.onKeyDown);
    this.generateQuestion();
  }
  componentWillUnmount(): void {
    document.removeEventListener("keydown", this.onKeyDown);
  }
  generateQuestion(): void {
    const questions = [
      ["坊主が屏風に上手に坊主の絵を描いた", "ぼうずがびょうぶにじょうずにぼうずのえをかいた"],
      ["東京特許許可局許可局長の許可 今日急遽却下", "とうきょうとっきょきょかきょくきょかきょくちょうのきょか きょうきゅうきょきゃっか"],
      ["肩硬かったから買った肩たたき器", "かたかたかったからかったかたたたきき"],
      ["ニュースです!人参のぬか漬けがネットで大人気です!なんでだろう?", "にゅーすです!にんじんのぬかづけがねっとでだいにんきです!なんでだろう?"],
      ["She sells sea shells by the seashore.", "She sells sea shells by the seashore."],
      ["The shells she sells are surely seashells.", "The shells she sells are surely seashells."],
      ["So if she sells shells on the seashore,", "So if she sells shells on the seashore,"],
      ["I'm sure she sells seashore shells.", "I'm sure she sells seashore shells."]
    ];
    console.log(this.state.questionIndex);
    this.setState({
      questionLabel: questions[Number(this.state.questionIndex)][0],
      question: questions[Number(this.state.questionIndex)][1],
      questionIndex: Number(this.state.questionIndex) < questions.length - 1 ? Number(this.state.questionIndex) + 1 : 0
    });
  }
  onKeyDown(event: KeyboardEvent): void {
    if (event.key.length > 1) return;
    let confirmedAnswer = this.state.confirmedAnswer || "",
      confirmedRomanji = this.state.confirmedRomanji || "",
      inputtedRomanji = this.state.inputtedRomanji + event.key,
      preConfirmedRomanji = this.state.preConfirmedRomanji + event.key;
    let missTyped = false;
    const matchedRows = romanjiHiraganaTSV.filter((tsvRow: string[]) => {
      if (!tsvRow[0].startsWith(preConfirmedRomanji)) return false;
      for (let i = 1; i <= String(this.state.question).length - confirmedAnswer.length; i++) {
        if (!tsvRow[1].startsWith(String(this.state.question).substr(confirmedAnswer.length, i))) { return false; }
        console.log("ans", String(this.state.question).substr(confirmedAnswer.length, i));
        if (tsvRow[1].length === i) return true;
      }
      console.log("finally");
      if (String(this.state.question).length - confirmedAnswer.length === 1) {
        return true;
      }
      return false;
    });
    if (matchedRows.length > 0) {
      console.log(String(this.state.question).substr(String(this.state.confirmedAnswer).length, 1));
      const matchedRow = matchedRows.find((tsvRow: string[]) => (
        tsvRow[0] === preConfirmedRomanji
      ));
      if (!(preConfirmedRomanji === "n" && /^(ん[なにぬねのや]?)$/.test(String(this.state.question).substr(String(this.state.confirmedAnswer).length, 2))) && matchedRow) {
        if (matchedRow[2]) {
          console.log(3);
          console.log(matchedRow);
          confirmedRomanji += preConfirmedRomanji.slice(0, -matchedRow[2].length);
          confirmedAnswer += matchedRow[1];
          preConfirmedRomanji = matchedRow[2];
        } else {
          console.log(4);
          confirmedRomanji += preConfirmedRomanji;
          confirmedAnswer += matchedRow[1];
          preConfirmedRomanji = "";
        }
      } else {
        if (String(this.state.question).substr(confirmedAnswer.length, 1) === "っ"
        && /^[qvlxkgszjtdhfbpmyrwc]$/.test(preConfirmedRomanji)
        && !romanjiHiraganaTSV.some((tsvRow: string[]) => {
          if (!tsvRow[0].startsWith(preConfirmedRomanji)) return false;
          console.log(String(this.state.question).substr(confirmedAnswer.length + 1, 1));
          if (tsvRow[1] !== String(this.state.question).substr(confirmedAnswer.length + 1, 1)) return false;
          return true;
        })) {
          preConfirmedRomanji = preConfirmedRomanji.slice(0, -1);
          inputtedRomanji = inputtedRomanji.slice(0, -1);
          missTyped = true;
        }
      }
    } else {
      if (String(this.state.confirmedAnswer).endsWith("ん") && /(?<!n)n$/.test(String(this.state.confirmedRomanji)) && preConfirmedRomanji === "n") {
        preConfirmedRomanji = "";
        confirmedRomanji += "n";
      } else if (this.state.question?.substr(confirmedAnswer.length, 1) === preConfirmedRomanji) {
        confirmedAnswer += preConfirmedRomanji;
        confirmedRomanji += preConfirmedRomanji;
        preConfirmedRomanji = "";
      } else {
        preConfirmedRomanji = preConfirmedRomanji.slice(0, -1);
        inputtedRomanji = inputtedRomanji.slice(0, -1);
        missTyped = true;
      }
    }
    if (this.state.question === confirmedAnswer) {
      console.log(9);
      this.generateQuestion();
      confirmedRomanji = "";
      confirmedAnswer = "";
      preConfirmedRomanji = "";
      inputtedRomanji = "";
    }
    this.setState({ confirmedAnswer, confirmedRomanji, inputtedRomanji, preConfirmedRomanji, missTyped });
  }
  render(): ReactElement {
    let suggestedRomanji = "";
    let _remainKana = String(this.state.question).slice(String(this.state.confirmedAnswer).length).replace(/(ん[なにぬねのや])/g, "ん$1").replace(/ん$/, "んん");
    let _i = _remainKana.length;
    const failedTSVRows: string[][] = [];
    console.log("---");
    let _sokuonSkipFlag = false;
    while (_remainKana.length > 0) {
      const _target = _remainKana.substr(0, _i);

      const _matchedRow = romanjiHiraganaTSV.find((tsvRow: string[]) => (
        tsvRow[1] === _target
        && (suggestedRomanji.length > 0 || tsvRow[0].startsWith(String(this.state.preConfirmedRomanji)))
        && !failedTSVRows.includes(tsvRow)
      ));
      if (_matchedRow) {
        if (_matchedRow[2] && !romanjiHiraganaTSV.some((tsvRow: string[]) =>
          tsvRow[1] === _remainKana.substr(_matchedRow[1].length, 1)
        && (tsvRow[0].startsWith(_matchedRow[2])))) {
          failedTSVRows.push(_matchedRow);
          if (failedTSVRows.length > 50) break;
          continue;
        }
        failedTSVRows.splice(0, failedTSVRows.length);
        if (_matchedRow[0] === "n") {
          suggestedRomanji += "n";
        } else if (_matchedRow[1] === "っ" && _matchedRow[2]) {
          console.log({ _sokuonSkipFlag });
          if (suggestedRomanji.length === 0
             && String(this.state.preConfirmedRomanji).length === 1 && !_sokuonSkipFlag) {
            _sokuonSkipFlag = true;
            continue;
          }
          suggestedRomanji += _matchedRow[2];
        } else if (String(this.state.preConfirmedRomanji).length > 0 && suggestedRomanji.length === 0) {
          suggestedRomanji += _matchedRow[0].slice(String(this.state.preConfirmedRomanji).length);
        } else {
          suggestedRomanji += _matchedRow[0];
        }
        _remainKana = _remainKana.slice(_matchedRow[1].length);
        _i = _remainKana.length;
      } else {
        _i--;
      }
      if (_i === 0) {
        suggestedRomanji += _remainKana.substr(0, 1);
        _remainKana = _remainKana.slice(1);
        _i = _remainKana.length;
      }
    }
    if (String(this.state.preConfirmedRomanji).endsWith("n") && suggestedRomanji.startsWith("nn")) {
      suggestedRomanji = suggestedRomanji.slice(1);
    }
    if (_sokuonSkipFlag) suggestedRomanji = suggestedRomanji.slice(1);

    return (
      <div className="container">
        <div className="question">
          <div className="ruby">{ this.state.question }</div>
          {this.state.questionLabel}
        </div>
        <div className="answer">
          <span className="text__confirmed">{ this.state.inputtedRomanji }</span>
          <span className="text__missed">{ this.state.missTyped ? suggestedRomanji?.slice(0, 1) : "" }</span>
          { this.state.missTyped ? suggestedRomanji?.slice(1) : suggestedRomanji }
        </div>
      </div>
    );
  }
}

export default App;
