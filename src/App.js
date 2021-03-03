import './App.css';
import {Recorder} from 'react-voice-recorder'
import 'react-voice-recorder/dist/index.css'
import ProgressBar from "@ramonak/react-progress-bar";
import {toRecord} from "./sentences"
import { v4 as uuidv4 } from 'uuid';

const React = require('react');
const toWav = require('audiobuffer-to-wav')
let xhr = require('xhr')
let audioContext = new (window.AudioContext)()


class App extends React.Component {

  speakerID = uuidv4();
  idx = 0;

  state = {
    audioDetails: {
      url: null,
      blob: null,
      chunks: null,
      duration: {
        h: 0,
        m: 0,
        s: 0
      }
    },
    wavBuffers: []
  };

  handleAudioStop(data){
    console.log(data)
    this.setState({ audioDetails: data });
  }

  handleAudioUpload(file) {
    console.log(file);
  }

  handleReset() {
    const reset = {
      url: null,
      blob: null,
      chunks: null,
      duration: {
        h: 0,
        m: 0,
        s: 0
      }
    };
    this.setState({ audioDetails: reset });
  }

  downloadRecordings = () => {
    const that = this;
    xhr({
      uri: this.state.audioDetails.url,
      responseType: 'arraybuffer'
    }, function (err, body, resp) {
      if (err) throw err

      let anchor = document.createElement('a')
      document.body.appendChild(anchor)
      anchor.style = 'display: none'

      audioContext.decodeAudioData(resp, function (buffer) {
        let wav = toWav(buffer)
        let blob = new window.Blob([ new DataView(wav) ], {
          type: 'audio/wav'
        })

        let url = window.URL.createObjectURL(blob)
        anchor.href = url
        anchor.download = that.speakerID+'-recording-'+that.idx+'.wav'
        anchor.click()
        window.URL.revokeObjectURL(url)

        const file = new window.Blob([toRecord[that.idx]], {type: 'text/plain'});
        url = window.URL.createObjectURL(file)
        anchor.href = url
        anchor.download = that.speakerID+'-recording-'+that.idx+'.txt'
        anchor.click()
        window.URL.revokeObjectURL(url)

        that.idx += 1;
        that.handleReset();
        that.forceUpdate();
      }, function () {
        throw new Error('Could not decode audio data.')
      })
    });
  }

  render() {
    return (
        <div>
          <div className="progress-bar">
            <ProgressBar completed={Math.ceil((this.idx / toRecord.length) *100)} />
          </div>
          <div className="text-holder">
            <div className="text">
              <span>{toRecord[this.idx]}</span>
            </div>
          </div>
          <Recorder
              record={true}
              title={"Text-dependent voice verification dataset collector"}
              audioURL={this.state.audioDetails.url}
              showUIAudio
              handleAudioStop={data => this.handleAudioStop(data)}
              handleAudioUpload={data => this.handleAudioUpload(data)}
              handleRest={() => this.handleReset()}
          />
          <div className="controls">
            <button disabled={!this.state.audioDetails.url} className="btn btn-save" onClick={this.downloadRecordings}>{'Save and Next'}</button>
          </div>
        </div>
    );
  }

}

export default App;
