import logo from './logo.svg';
import './App.css';
import React, { Component } from 'react';
import Papa from 'papaparse'
import Deque from "double-ended-queue";

function App() {
  return (
    <Game />
  );
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      game: 'start',
      competitors: []
    };
  }

  initializeCompetitors() {
    let competitorsUrl = 'https://youtuber-pk-nrt.s3.ap-northeast-1.amazonaws.com/tw-women-youtubers.csv'
    this.getCompetitors(competitorsUrl);
  }


  componentDidMount() {
    this.initializeCompetitors();

  }


  handleClick(i) {
    console.log(this.state)
    this.setState({
      game: 'ongoing'
    });
  }

  getCompetitors(fileInputName) {
    let that = this;
    Papa.parse(fileInputName, {
      header: true,
      download: true,
      complete: function (results) {
        that.setState({
          competitors: new Deque(results.data.slice(0, 2))
        });
      }
    });
  }

  getLeftAndRight() {
    let competitors = new Deque(this.state.competitors.toArray())
    console.log(this.state.competitors)
    console.log(competitors)
    let [left, right] = [competitors.shift(), competitors.shift()]
    let leftUrl = `https://youtuber-pk-nrt.s3.ap-northeast-1.amazonaws.com/images/${left.ImageName}.jpeg`
    let rightUrl = `https://youtuber-pk-nrt.s3.ap-northeast-1.amazonaws.com/images/${right.ImageName}.jpeg`
    let urls = { leftUrl, rightUrl }
    return urls
  }

  render() {

    // Initial page
    let welcomePage = (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Click <button onClick={() => this.handleClick()} type="button">Start!</button> to choose your favorite YouTuber.
          </p>
        </header>
      </div>
    );

    if (this.state.game === 'start') {
      return welcomePage;
    }

    // Game started
    let { leftUrl, rightUrl } = this.getLeftAndRight()
    let gamePage = (
      <div className="App">
        <header className="App-header">
          <p>
            Pick one you prefer.
          </p>
          <div>
            <img src={leftUrl} className='left-image' />
            <button onClick={() => this.handleClick()} type="button">Choose me!</button>
          </div>
          <div>
            <img src={rightUrl} className='right-image' />
            <button onClick={() => this.handleClick()} type="button">Choose me!</button>
          </div>
        </header>
      </div>
    );

    if (this.state.game === 'ongoing') {
      return gamePage;
    }


  }
}
export default App;
