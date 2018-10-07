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
import { eventProxy } from 'react-eventproxy';

const classPrefix = 'Wordlist';

class WordList extends React.Component {

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

    eventProxy.on('wordListWillOnlyShowKeepInMind', () => {
      this.setState({
        isOnlyShowNotKeepInMind: false,
        isOnlyShowKeepInMind: true,
      });
    });
    eventProxy.on('wordListWillOnlyShowNotKeepInMind', () => {
      this.setState({
        isOnlyShowKeepInMind: false,
        isOnlyShowNotKeepInMind: true,
      });
    });

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
    HttpTool.historyWords(page, (response)=>{
      const { status, data, message } = response;
      if (status === 1) {
        let words = this.state.words;
        if (!words) {
          words = [];
        }
        let newWordsList = [];
        if (page === 0) {
          if (data) {
            newWordsList = [...data];
          }
        } else {
          newWordsList = [...words, ...data];
        }
        this.setState({
          words: newWordsList,
          currPage: page + 1,
        });
      } else {
        message.error(message);
      }
      this.setState({
        isLoading: false,
        isLastPage: data ? (data.length !== 50) : true,
      });
    },(e)=>{
      console.log(e);
      if (e.response && e.response.status === 401) {
        localStorage.removeItem('token');
        location.reload();
        return;
      }
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
          return item._id !== word._id;
        });
        console.log('newWords',newWords);
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
    console.log(word);
    const audio = this.voiceRefs[word._id];
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

  handleOnKeepInMind = (newWord) => () => {
    if (!newWord.expand) {
      newWord.expand = {};
      newWord.expand.isKeepInMind = true;
    } else {
      newWord.expand.isKeepInMind = !newWord.expand.isKeepInMind;
    }
    HttpTool.editWords(newWord, (res) => {
      const { data: { status } } = res;
      if (status === 1) {
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
    }, (err) => {
      console.log(err);
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
                const { expand, baseInfo: { voice } } = word;
                const hasVoice = voice;
                let hasVoiceMP3 = false;
                let isKeepInMind = false;
                let hasDescription = false;
                if (hasVoice) {
                  hasVoiceMP3 = voice.am_mp3;
                }
                if (expand) {
                  isKeepInMind = (expand.isKeepInMind === true);
                  hasDescription = expand.detail;
                }
                if (this.state.isOnlyShowKeepInMind && !isKeepInMind) {
                  return null;
                }
                if (this.state.isOnlyShowNotKeepInMind && isKeepInMind) {
                  return null;
                }
                return (
                  <li key={word._id}>
                      <div className={`${classPrefix}-content`}>
                        <div className={`${classPrefix}-content-src`}>
                          <div className={`${classPrefix}-content-src-text`}>{word.baseInfo.src.toLowerCase()}</div>
                          {
                            hasVoiceMP3 &&
                            <div className={`${classPrefix}-content-src-speaker`} onClick={this.speakWord(word)}><img src={speakerIcon} alt=''/></div>
                          }
                          {
                            hasVoice &&
                            <audio ref={(el)=>this.voiceRefs[word._id]=el}>
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
                          {
                            isKeepInMind && (
                              <span onClick={this.handleOnKeepInMind(word)}>
                                <svg viewBox="0 -10 35 35" width="35" height="35" aria-hidden="true" className={`${classPrefix}-content-toolbar-close`}><path fillRule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path></svg>
                              </span>
                            )
                          }
                          {
                            !isKeepInMind && (
                              <span onClick={this.handleOnKeepInMind(word)}>
                                <svg viewBox="0 -10 35 35" width="35" height="35" aria-hidden="true" className={`${classPrefix}-content-toolbar-open`}><path fillRule="evenodd" d="M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"></path></svg>
                              </span>
                            )
                          }
                          <span onClick={this.edit(word)}><img src={editIcon} alt='' /></span>
                          {
                            hasDescription && <span onClick={this.displayExtends(word)}><img src={detailIcon} alt='' /></span>
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

export default withRouter(WordList);