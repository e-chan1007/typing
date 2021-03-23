import React, { ReactElement } from "react";
import TestComponent from "./TestComponent";
import "./App.css";
// @ts-ignore
import _romanjiHiraganaTSV from "./lib/romanji-hiragana.tsv";

const romanjiHiraganaTSV = [] as string[][][];
_romanjiHiraganaTSV.forEach((tsvRow: string[]) => {
  if (!romanjiHiraganaTSV[tsvRow[0].length]) romanjiHiraganaTSV[tsvRow[0].length] = [];
  romanjiHiraganaTSV[tsvRow[0].length].push(tsvRow);
});

interface IAppProps {
  [key: string]: string
}

interface IAppState {
  raw?: string,
  beforeConfirm?: string,
  confirmed?: string,
  confirmedRomanjiLength?: number
}
class App extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.state = { raw: "", beforeConfirm: "", confirmed: "", confirmedRomanjiLength: 0 };
  }
  componentDidMount(): void {
    document.addEventListener("keydown", this.onKeyDown);
  }
  componentWillUnmount(): void {
    document.removeEventListener("keydown", this.onKeyDown);
  }
  onKeyDown(event: KeyboardEvent): void {
    let raw = this.state.raw || "";
    let beforeConfirm = this.state.beforeConfirm || "", confirmed = this.state.confirmed || "", confirmedRomanjiLength = this.state.confirmedRomanjiLength || 0;
    if (event.key.length > 1) return;
    raw += event.key;
    beforeConfirm = raw.slice(confirmedRomanjiLength);

    let currentChars = beforeConfirm;

    let k = 0;
    do {
      if (!Number.isNaN(parseInt(currentChars))) {
        confirmed += currentChars;
        confirmedRomanjiLength += currentChars.length;
        beforeConfirm = currentChars = beforeConfirm.slice(currentChars.length);
        continue;
      }
      if (romanjiHiraganaTSV[currentChars.length]) {
        const searchResult = romanjiHiraganaTSV[currentChars.length].find(
          // eslint-disable-next-line no-loop-func
          (tsvRow: string[]) => tsvRow[0] === currentChars
        );
        if (searchResult) {
          if (/^(n|ny)$/.test(beforeConfirm)) break;
          confirmed += searchResult[1];
          confirmedRomanjiLength += currentChars.length;
          if (searchResult[2]) {
            beforeConfirm = beforeConfirm.slice(currentChars.length - searchResult[2].length);
            confirmedRomanjiLength -= searchResult[2].length;
          } else {
            beforeConfirm = beforeConfirm.slice(currentChars.length);
          }
          currentChars = beforeConfirm;
        } else {
          if (currentChars.length === 2) {
            // eslint-disable-next-line no-loop-func
            if (!romanjiHiraganaTSV.flat().some((tsvRow: string[]) => tsvRow[0].startsWith(currentChars))) {
              console.error("error!");
              confirmed += currentChars;
              beforeConfirm = currentChars = beforeConfirm.slice(2);
              confirmedRomanjiLength += 2;
            } else {
              currentChars = currentChars.slice(0, currentChars.length - 1);
            }
          } else {
            currentChars = currentChars.slice(0, currentChars.length - 1);
          }
        }
      }
      k++;
    } while (currentChars !== "" && k < 10);
    this.setState({ raw, beforeConfirm, confirmed, confirmedRomanjiLength });
  }
  render(): ReactElement {
    return (
      <div className="App">
        { this.state.raw }
        <h2>{this.state.confirmed}{this.state.beforeConfirm}</h2>
      </div>
    );
  }
}

export default App;
