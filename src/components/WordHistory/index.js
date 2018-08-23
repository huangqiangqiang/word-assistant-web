import * as React from 'react';
import './index.less';
import { message } from 'antd';
import HttpTool from '../../utils/HttpTool';
import { withRouter } from 'react-router-dom';
import speakerIcon from './assets/speaker.png';
import deleteIcon from './assets/delete.png';
import editIcon from './assets/edit.png';
import detailIcon from './assets/detail.png';
import Editor from '../Editor';
import Details from '../Details';

const classPrefix = 'Wordlist';

class WordHistory extends React.Component {

  voiceRefs = {};

  constructor(props) {
    super(props);
    this.state = {
      words: null,
      currPage: 0,
      isLoading: false,
      isLastPage: false,
      editVisible: false,
      selectWord: null,
    };
  }

  componentDidMount() {
    window.onscroll = () => {
      const sHeight = document.documentElement.scrollTop || document.body.scrollTop; //滚动高度
      const wHeight = document.documentElement.clientHeight; //window 
      const dHeight = this.listRef.offsetHeight; //整个文档高度
      const lineHeight = 180;
      if (sHeight + wHeight > (dHeight - (lineHeight * 3))) {
        this.loadMore();
      }
    };
    this.loadMore();
  }

  componentWillUnmount() {
    window.onscroll = null;
  }

  // 加载更多
  loadMore = () => {
    if (this.state.isLoading || this.state.isLastPage) { return; }
    const page = this.state.currPage;
    console.log('load page',page);
    this.setState({
      isLoading: true
    });
    HttpTool.historyWords(page, (data)=>{
      console.log(data);
      if (data.status === 1) {
        let words = this.state.words;
        if (!words) {
          words = [];
        }
        let newWordsList = [];
        if (page === 0) {
          newWordsList = [...data.data];
        } else {
          newWordsList = [...words, ...data.data];
        }
        this.setState({
          words: newWordsList,
          currPage: page + 1,
        });
      } else {
        message.error(data.message);
      }
      this.setState({
        isLoading: false,
        isLastPage: (data.data.length !== 50),
      });
    },(err)=>{
      console.log(err);
      message.error('服务器异常，请稍后再试！');
      this.setState({
        isLoading: false,
      });
    });
  }

  deleteWord = (word) => () => {
    HttpTool.deleteWord(word, (res)=>{
      if (res.data.status === 1) {
        const newWords = this.state.words.filter((item)=>{
          return item.id !== word.id;
        });
        this.setState({
          words: newWords
        });
      } else {
        message.error(res.data.message);
      }
    }, (e)=>{
      console.log(e);
      message.error('服务器异常，请稍后再试！');
    });
  }

  speakWord = (word) => () => {
    const audio = this.voiceRefs[word.id];
    audio.play();
  }

  edit = (word) => () => {
    this.setState({
      editVisible: true,
      displayExtends: false,
      selectWord: word,
    });
  }

  editWordSuccess = (newWord) => {
    const newWords = this.state.words.map((word)=>{
      if (word.text === newWord.text) {
        return newWord;
      } else {
        return word;
      }
    });
    this.setState({
      words: newWords,
    });
  }

  displayExtends = (word) => () => {
    this.setState({
      editVisible: false,
      displayExtends: true,
      selectWord: word,
    });
  }

  render() {
    return (
      <div className={classPrefix}>
        <ul className={`${classPrefix}-list`} ref={(el)=>{this.listRef=el;}}>
        {
          this.state.words === null ? (
            <div className={`${classPrefix}-placehold`}>正在加载...</div>
          ) : (
            this.state.words.length === 0 ? (
              <div className={`${classPrefix}-placehold`}>没有查询记录</div>
            ) : (
              this.state.words.map((word)=>{
                const hasVoice = word.baseInfo.voice;
                let hasVoiceMP3 = false;
                if (hasVoice) {
                  hasVoiceMP3 = word.baseInfo.voice.am_mp3;
                }
                return (
                  <li key={word.id}>
                      <div className={`${classPrefix}-content`}>
                        <div className={`${classPrefix}-content-src`}>
                          <div className={`${classPrefix}-content-src-text`}>{word.baseInfo.src.toLowerCase()}</div>
                          {
                            hasVoiceMP3 &&
                            <div className={`${classPrefix}-content-src-speaker`} onClick={this.speakWord(word)}><img src={speakerIcon} alt=''/></div>
                          }
                          {
                            hasVoice &&
                            <audio ref={(el)=>this.voiceRefs[word.id]=el}>
                              <source src={word.baseInfo.voice.am_mp3} type="audio/mpeg" />
                            </audio>
                          }
                        </div>
                        <div className={`${classPrefix}-content-dst`}>
                        {
                          <div className={`${classPrefix}-content-dst-voice`}>{hasVoice ? `[${word.baseInfo.voice.am}]` : '[无音标]'}</div>
                        }
                        {
                          word.baseInfo.dst_info ? (
                            // 有dst_info字段便展示，没有则展示dst字段
                            word.baseInfo.dst_info.map((info, i)=>{
                              if (i > 4) {
                                // 太多了显示不下
                                return null;
                              }
                              return (
                                <div key={info.means}>{`${info.part} ${info.means}`}</div>
                              );
                            })
                          ) : (
                            word.baseInfo.dst
                          )
                        }
                        </div>
                        <div className={`${classPrefix}-content-toolbar`}>
                          <span onClick={this.edit(word)}><img src={editIcon} alt='' /></span>
                          {
                            word.extends && <span onClick={this.displayExtends(word)}><img src={detailIcon} alt='' /></span>
                          }
                        </div>
                        <div className={`${classPrefix}-content-delete`} onClick={this.deleteWord(word)}><img src={deleteIcon} alt='' /></div>
                      </div>
                  </li>
                );
              })
            )
          )
        }
        </ul>
          <div className={`${classPrefix}-loadmore`}>{this.state.isLastPage ? `共 ${this.state.words.length} 个单词` : `正在加载，目前有 ${this.state.words ? this.state.words.length : 0} 个单词`}</div>
          <div className={`${classPrefix}-blank`}></div>
        <Editor 
          visible={this.state.editVisible}
          word={this.state.selectWord}
          handleEditSuccess={this.editWordSuccess}
          onClose={()=>{this.setState({ editVisible: false });}}
        />
        <Details 
          visible={this.state.displayExtends}
          word={this.state.selectWord}
          onClose={()=>{this.setState({ displayExtends: false });}}
        />
      </div>
    );
  }
}


export default withRouter(WordHistory);