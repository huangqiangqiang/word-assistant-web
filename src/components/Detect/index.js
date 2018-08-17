import * as React from 'react';
import './index.less';
import HttpTool from '../../utils/HttpTool';
import { Progress, message, Slider, Modal, Button } from 'antd';
import nextIcon from './assets/next.png';
import wrongIcon from './assets/wrong.png';

const marks = {
    1: '1',
    50: '50',
    100: '100',
    200: '200',
    500: '500',
};

const classPrefix = 'Detect';

class Detect extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        tmpCount: 50,
        detectCount: 0,
        words: [],
        itemWidth: document.body.clientWidth * 0.8,
        itemMarginRight: document.body.clientWidth * 0.05,
        progress: 0,
        isLoading: false,
        remenberWordCount: 0, // 记得的单词的数量
    };
  }

  componentDidMount() {
    window.onresize = () => {
        this.setState({
            itemWidth: document.body.clientWidth * 0.8,
            itemMarginRight: document.body.clientWidth * 0.05,
        });
    };
  }

  componentWillUnmount() {
      window.onresize = null;
  }

  clickOK = (word) => {
      this.calcProgress(word);
      this.jumpNext(word);
      const remenberWordCount = this.state.remenberWordCount + 1;
      this.setState({ remenberWordCount });
  }

  clickNO = (word) => () => {
    this.calcProgress(word);
    this.jumpNext(word);
  }

  calcProgress = (word) => {
    const index = this.state.words.indexOf(word);
    const progress = parseInt(((index + 1) / this.state.words.length) * 100, 10);
    this.setState({ progress });
  }

  jumpNext = (word) => {
    const index = this.state.words.indexOf(word);
    let offset = 0;
    if (this.state.itemWidth <= 500) {
        offset = (index + 1) * (this.state.itemWidth + this.state.itemMarginRight);
    } else {
        offset = (index + 1) * (500 + this.state.itemMarginRight);
    }
    this.scrollRef.style.transform = `translate3d(-${offset}px, 0px, 0px)`;
  }

  restart = () => {
      this.setState({
          remenberWordCount: 0,
          progress: 0,
      });
      this.fetchWords();
      this.scrollRef.style.transform = `translate3d(0px, 0px, 0px)`;
  }

  fetchWords = () => {
    this.setState({ isLoading: true });
    HttpTool.detectWords({count: this.state.detectCount}, (res)=>{
        this.setState({
            words: res.data.data,
        });
        this.setState({ isLoading: false });
    }, (e)=>{
        if (e.response && e.response.status === 401) {
          localStorage.removeItem('token');
          location.reload();
          return;
        }
        console.log(e);
        this.setState({ isLoading: false });
        message.error('服务器异常，请稍后再试！');
    });
  }

  handleOnSelectDetectCount = () => {
    const detectCount = this.state.tmpCount;
    this.setState({ detectCount },()=>{
        this.fetchWords();
    });
  }

  render() {
    const length = this.state.words.length;
    const itemWidth = this.state.itemWidth;
    let marginLeft = 0;
    let style = {};
    if (this.state.itemWidth <= 500) {
        marginLeft = document.body.clientWidth * 0.1;
        style = {
            marginLeft: 0,
            marginRight:this.state.itemMarginRight,
            width:this.state.itemWidth,
        };
    } else {
        marginLeft = document.body.clientWidth / 2 - 250;
        style = {
            marginLeft: 0,
            marginRight:document.body.clientWidth * 0.05,
        };
    }
    return (
      <div className={classPrefix}>
        <Progress className={`${classPrefix}-progress`} percent={this.state.progress} strokeColor={'#52c41a'} strokeWidth={5} />
        {
            this.state.isLoading && (
                <div className={`${classPrefix}-loading`}><span>加载中...</span></div>
            )
        }
        <div className={`${classPrefix}-container`} style={{width:`${length * itemWidth}px`}} ref={(el)=>this.scrollRef=el}>
        {
            this.state.words.map((word, i)=>{
                let newStyle = {...style};
                if (i === 0) {
                    newStyle.marginLeft = marginLeft;
                } else {
                    newStyle.marginLeft = 0;
                }
                return (
                    <div key={word.text} className={`${classPrefix}-card`} style={newStyle}>
                        <div className={`${classPrefix}-card-word`}>{word.text.toLowerCase()}</div>
                        <div className={`${classPrefix}-card-buttons`}>
                            <div className={`${classPrefix}-card-buttons-cancel`} onClick={this.clickNO(word)}><img src={wrongIcon} alt='' /></div>
                            <div className={`${classPrefix}-card-buttons-ok`} onClick={()=>{this.clickOK(word);}}><img src={nextIcon} alt='' /></div>
                        </div>
                    </div>
                );
            })
        }
        {
            this.state.words.length > 0 && (
                <div className={`${classPrefix}-card ${classPrefix}-result`} style={style} >
                    <div className={`${classPrefix}-result-score`}>
                        <b>{parseInt(this.state.remenberWordCount / this.state.words.length * 100, 10)}</b> 分<br />
                        <div className={`${classPrefix}-result-desc`}>
                        {
                            (this.state.words.length - this.state.remenberWordCount) === 0 ? (
                                <span>perfect!</span>
                            ) : (
                                `有 ${this.state.words.length - this.state.remenberWordCount} 个单词不认识，再接再厉！`
                            )
                        }
                        </div>
                    </div>
                    <div className={`${classPrefix}-result-buttons`}>
                        <div className={`${classPrefix}-result-buttons-restart`} onClick={this.restart}>下一波</div>
                    </div>
                </div>
            )
        }
        </div>
        {
            this.state.detectCount === 0 && (
                <Modal
                title="选择测验的单词数量"
                visible={this.state.detectCount === 0}
                closable={false}
                footer={[
                    <Button onClick={this.handleOnSelectDetectCount}>确定</Button>,
                ]}
                >
                    <Slider min={1} max={500} marks={marks} defaultValue={this.state.tmpCount} onChange={(value)=>this.setState({tmpCount:value})} />
                </Modal>
            )
        }
      </div>
    );
  }
}

export default Detect;