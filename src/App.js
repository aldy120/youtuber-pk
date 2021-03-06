import logoPng from './ps/youtube-pk.png';
import logoAvif from './ps/youtube-pk.avif';
import logoWebp from './ps/youtube-pk.webp';
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
        const result = results.data
        const competitors = new Deque(shuffle(result).slice(0, 16))
        console.log(competitors)
        that.setState({
          competitors: competitors
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
    let [left, right] = [competitors.shift(), competitors.shift()];
    return { left, right }
  }

  handleImageClick(target) {
    // If the last-second round we choose right, the unlock in onLoad event won't trigger
    // Because the DOM doesn't update
    if (this.state.competitors.length !== 3) {
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
          <picture>
            <source className="App-logo" srcset={logoWebp} type="image/webp" />
            <source className="App-logo" srcset={logoAvif} type="image/avif" />
            <img className="App-logo" src={logoPng} alt="logo" />
          </picture>
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
      const winner = this.state.competitors.peekFront()
      const metricsEndpoint = 'https://youtuber-pk-metrics.lichi-chen.com/'
      const metricsUrl = metricsEndpoint + JSON.stringify(winner)
      let endPage = (
        <div className="App">
          <header className="App-header">
            <p>
              Winner: {winner.DisplayName}
            </p>
            <a target="_blank" rel="noreferrer" href={winner.ChannelLink}>
              <img alt='' className='responsive beauty' src={`${imageSourceUrl}/images/${winner.ImageName}.jpeg`} />
            </a>
            <img src={metricsUrl} alt="send metrics" />
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
  const loading = props.clickable ? '' : ' loading'
  return (
    <div>
      <div className="responsive">
        <div>{props.target.DisplayName}</div>
        <img alt='' src={url} className={props.className + loading} onClick={handleClick} onLoad={handleImageLoad} />
      </div>
    </div>
  );
}

export default App;
