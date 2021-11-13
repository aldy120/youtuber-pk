import logo from './ps/youtube-pk.png';
import './App.css';
import React from 'react';
import Papa from 'papaparse'
import Deque from "double-ended-queue";
const imageSourceUrl = 'https://youtuber-pk-images.lichi-chen.com'


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
      competitors: [],
      // clickable: true,
      clickableLeft: false,
      clickableRight: false
    };
  }

  initializeCompetitors() {
    let competitorsUrl = 'https://youtuber-pk-nrt.s3.ap-northeast-1.amazonaws.com/data-csv/tw-women-youtubers.csv'
    this.getCompetitors(competitorsUrl);
  }


  componentDidMount() {
    this.initializeCompetitors();
  }

  lockScreenLeft() {
    this.setState({
      clickableLeft: false
    })
  }
  
  lockScreenRight() {
    this.setState({
      clickableRight: false
    })
  }

  unlockScreenLeft() {
    this.setState({
      clickableLeft: true
    })
  }
  
  unlockScreenRight() {
    console.log('unlockScreenRight')
    this.setState({
      clickableRight: true
    })
  }

  handleStartButtonClick(i) {
    this.setState({
      game: 'ongoing'
    });
  }

  getCompetitors(fileInputName) {
    let that = this;
    let shuffle = this.shuffle;
    Papa.parse(fileInputName, {
      header: true,
      download: true,
      complete: function (results) {
        that.setState({
          competitors: new Deque(shuffle(results.data.slice(0, 16)))
        });
      }
    });
  }

  shuffle(array) {
    var m = array.length, t, i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
    return array
  }

  getLeftAndRight() {
    let competitors = new Deque(this.state.competitors.toArray())
    console.log(competitors)
    let [left, right] = [competitors.shift(), competitors.shift()];
    console.log({ left, right })
    return { left, right }
  }

  handleImageClick(target) {
    // If the last-second round we choose right, the unlock in onLoad event won't trigger
    // Because the DOM doesn't update
    if (this.state.competitors.length === 3) {
      this.lockScreenLeft()
      this.lockScreenRight()
    }
    // Update competitor states.
    let competitors = new Deque(this.state.competitors.toArray());
    
    competitors.shift();
    competitors.shift();
    competitors.push(target);
    console.log(target)
    this.setState({
      competitors: competitors,
    })
  }

  render() {
    // window.scrollTo(0, 0)
    // Initial page
    let welcomePage = (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Click <button onClick={() => this.handleStartButtonClick()} type="button">Start!</button> to choose your favorite YouTuber.
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
            <img alt='' className='responsive beauty' src={`${imageSourceUrl}/images/${this.state.competitors.peekFront().ImageName}.jpeg`} />
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
          <Square handleUnlockScreen={() => this.unlockScreenLeft()} clickable={this.state.clickableLeft} target={left} className='left-image beauty' onClick={() => this.handleImageClick(left)} />
          <Square handleUnlockScreen={() => this.unlockScreenRight()} clickable={this.state.clickableRight} target={right} className='right-image beauty' onClick={() => this.handleImageClick(right)} />
        </header>
      </div>
    );

    if (this.state.game === 'ongoing') {
      return gamePage;
    }
  }
}

function Square(props) {
  let url = `${imageSourceUrl}/images/${props.target.ImageName}.jpeg`
  let handleClick = () => {
    if (props.clickable === false) {
      return
    }
    props.onClick(props.target)
  }
  let handleImageLoad = () => {
    props.handleUnlockScreen()
    window.scrollTo(0, 0)
  }
  const loading = props.clickable? '' : ' loading'
  return (
    <div>
      <div className="responsive">
        <img alt='' src={url} className={props.className + loading} onClick={handleClick} onLoad={handleImageLoad} />
      </div>
    </div>
  );
}

export default App;
