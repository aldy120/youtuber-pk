import logo from './ps/youtube-pk.png';
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
    let [left, right] = [competitors.shift(), competitors.shift()];
    return { left, right }
  }

  handleImageClick(target) {
    // Update competitor states.
    // Need current states
    // Need current image index (left or right)
    let competitors = new Deque(this.state.competitors.toArray());
    competitors.shift();
    competitors.shift();
    competitors.push(target);
    console.log(target)
    console.log(competitors);
    let updatedCompetitors =
      this.setState({
        competitors: competitors
      })
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

    // Game end
    if (this.state.competitors.length === 1) {
      let endPage = (
        <div className="App">
          <header className="App-header">
            <p>
              The winner
            </p>
            <img src={`https://youtuber-pk-nrt.s3.ap-northeast-1.amazonaws.com/images/${this.state.competitors.peekFront().ImageName}.jpeg`} />
          </header>
        </div>
      )
      return endPage
    }

    // Game started
    let { left, right } = this.getLeftAndRight()
    let gamePage = (
      <div className="App">
        <header className="App-header">
          <p>
            Pick one you prefer.
          </p>
          <Square target={left} className='left-image responsive' onClick={() => this.handleImageClick(left)} />
          <Square target={right} className='right-image responsive' onClick={() => this.handleImageClick(right)} />
        </header>
      </div>
    );

    if (this.state.game === 'ongoing') {
      return gamePage;
    }

    


  }
}

function Square(props) {
  let url = `https://youtuber-pk-nrt.s3.ap-northeast-1.amazonaws.com/images/${props.target.ImageName}.jpeg`
  return (
    <div>
      <p>
      <img src={url} className={props.className} onClick={() => props.onClick(props.target)}/>
      </p>
    </div>
  );
}


export default App;
